import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Linking, Platform, StyleSheet, View } from "react-native";
import { useFocusEffect } from "expo-router";
import {
  RecordingPresets, getRecordingPermissionsAsync, requestRecordingPermissionsAsync, setAudioModeAsync,
  useAudioRecorder, useAudioRecorderState,
} from "expo-audio";
import { API_BASE, getToken } from "./api";
import { useLang } from "./i18n";
import { uploadForm } from "@/src/utils/upload";
import { Button, Icon, Press, Sheet, T, useToast } from "./ui";
import { colors, spacing } from "./theme";

type Phase = "idle" | "listening" | "thinking";
const SILENCE_MS = 1800;
const ARM_IGNORE_MS = 400;
const CALIBRATE_MS = 500;
const MAX_MS = 30000;

/** Mic button: tap → record (auto-stops on silence) → transcribe → onText(text). */
export default function VoiceButton({ onText, testID, size = 40, color = colors.brand, bg = colors.brandTertiary }: {
  onText: (t: string) => void; testID: string; size?: number; color?: string; bg?: string;
}) {
  const toast = useToast();
  const { lang } = useLang();
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const state = useAudioRecorderState(recorder, 100);
  const [phase, setPhase] = useState<Phase>("idle");
  const [perm, setPerm] = useState<null | "explain" | "blocked">(null);
  const preparing = useRef(false);
  const turn = useRef(0);
  const startedAt = useRef(0);
  const floor = useRef<number[]>([]);
  const heardAt = useRef(0);
  const spoke = useRef(false);
  const watchdog = useRef<any>(null);
  const denials = useRef(0);

  useEffect(() => { setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true }).catch(() => {}); }, []);

  const finish = useCallback(async () => {
    if (watchdog.current) clearTimeout(watchdog.current);
    const myTurn = ++turn.current;
    setPhase("thinking");
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri || Date.now() - startedAt.current < 300) { setPhase("idle"); return; }
      const name = Platform.OS === "web" ? "recording.webm" : "recording.m4a";
      const d = await uploadForm(`${API_BASE}/transcribe`, {
        files: { audio: { uri, name, mimeType: Platform.OS === "web" ? "audio/webm" : "audio/m4a" } },
        fields: { language: lang === "hi" ? "hi" : "en" }, token: getToken(),
      });
      if (myTurn !== turn.current) return;
      if (d?.text) onText(d.text);
      else toast("Didn't catch that, please try again", "error");
    } catch (e: any) {
      toast(e?.message || "Voice input failed, please try again", "error");
    } finally {
      if (myTurn === turn.current) setPhase("idle");
    }
  }, [recorder, lang, onText, toast]);

  // Silence detection with calibrated noise floor
  useEffect(() => {
    if (phase !== "listening" || !state.isRecording) return;
    const m = state.metering;
    if (m === undefined || m === null) return;
    const el = Date.now() - startedAt.current;
    if (el < ARM_IGNORE_MS) return;
    if (el < ARM_IGNORE_MS + CALIBRATE_MS) { floor.current.push(m); return; }
    const base = floor.current.length ? floor.current.reduce((a, b) => a + b, 0) / floor.current.length : -50;
    if (m > base + 12) { spoke.current = true; heardAt.current = Date.now(); return; }
    if (spoke.current && Date.now() - heardAt.current > SILENCE_MS) finish();
    else if (!spoke.current && el > 7000) finish();
  }, [state.metering, state.isRecording, phase, finish]);

  useFocusEffect(useCallback(() => () => {
    if (watchdog.current) clearTimeout(watchdog.current);
    try { if (recorder.isRecording) recorder.stop().catch(() => {}); } catch { /* released on unmount */ }
  }, [recorder]));

  const record = async () => {
    if (preparing.current) return;
    preparing.current = true;
    try {
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      floor.current = []; spoke.current = false; heardAt.current = 0;
      startedAt.current = Date.now();
      setPhase("listening");
      watchdog.current = setTimeout(() => finish(), MAX_MS);
    } catch {
      toast("Could not start the microphone", "error");
      setPhase("idle");
    } finally { preparing.current = false; }
  };

  const onPress = async () => {
    if (phase === "listening") return finish();
    if (phase === "thinking") return;
    const p = await getRecordingPermissionsAsync();
    if (p.granted) return record();
    if (p.status === "denied" && (!p.canAskAgain || denials.current >= 2)) return setPerm("blocked");
    setPerm("explain");
  };
  const allow = async () => {
    const r = await requestRecordingPermissionsAsync();
    if (r.granted) { setPerm(null); return record(); }
    denials.current += 1;
    setPerm(r.canAskAgain && denials.current < 2 ? "explain" : "blocked");
  };

  const listening = phase === "listening";
  return (
    <>
      <Press testID={testID} onPress={onPress} style={[styles.btn, { width: size, height: size, borderRadius: size / 2, backgroundColor: listening ? colors.error : bg }]}>
        {phase === "thinking" ? <ActivityIndicator size="small" color={color} /> :
          <Icon name={listening ? "stop" : "mic"} size={size * 0.5} color={listening ? colors.onError : color} />}
      </Press>
      <Sheet open={!!perm} onClose={() => setPerm(null)} title={perm === "blocked" ? "Microphone permission" : "Allow microphone"} testID="mic-permission-sheet">
        <View style={{ alignItems: "center", gap: spacing.md }}>
          <View style={styles.big}><Icon name="mic" size={30} color={colors.brand} /></View>
          <T v="body" color={colors.onSurfaceTertiary} style={{ textAlign: "center" }}>
            {perm === "blocked" ? "Microphone is off for SMARTFIX. Enable it in Settings to search and chat by voice." : "Speak instead of typing — we use the mic only while you hold a voice search or chat."}
          </T>
        </View>
        {perm === "blocked" ? (Platform.OS !== "web" && <Button testID="mic-open-settings-btn" title="Open Settings" icon="settings-outline" onPress={() => { setPerm(null); Linking.openSettings(); }} />)
          : <Button testID="mic-allow-btn" title="Allow" icon="mic" onPress={allow} />}
        <Button testID="mic-not-now-btn" variant="ghost" title="Not now" onPress={() => setPerm(null)} />
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  btn: { alignItems: "center", justifyContent: "center" },
  big: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.brandTertiary, alignItems: "center", justifyContent: "center" },
});
