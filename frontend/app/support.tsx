import React, { useRef, useState } from "react";
import { FlatList, Platform, StyleSheet, TextInput, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, errMsg, fmtDT, useApi } from "@/src/api";
import { useLang } from "@/src/i18n";
import { Button, Icon, IconBtn, Row, ScreenHeader, Segmented, T, useToast, Empty } from "@/src/ui";
import { colors, fonts, radius, spacing } from "@/src/theme";

type Msg = { from: "bot" | "me"; text: string };

export default function Support() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { t, lang } = useLang();
  const [seg, setSeg] = useState("chat");
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: "Hi! I'm the SMARTFIX assistant. Ask me about refunds, cancellation, invoices, coupons or your partner's location." }]);
  const [text, setText] = useState("");
  const [suggest, setSuggest] = useState(false);
  const [busy, setBusy] = useState(false);
  const tickets = useApi<any[]>("/support/tickets");
  const list = useRef<FlatList>(null);

  const ask = async () => {
    const q = text.trim();
    if (!q) return;
    setMsgs((m) => [...m, { from: "me", text: q }]);
    setText("");
    try {
      const d = await api("/support/chatbot", { method: "POST", body: { text: q } });
      setMsgs((m) => [...m, { from: "bot", text: d.reply }]);
      setSuggest(!!d.suggest_ticket);
    } catch (e) { toast(errMsg(e), "error"); }
  };
  const raise = async () => {
    setBusy(true);
    try {
      const last = [...msgs].reverse().find((m) => m.from === "me")?.text || "Need help";
      const d = await api("/support/tickets", { method: "POST", body: { subject: last.slice(0, 60), message: last } });
      toast(`Ticket ${d.ticket_no} created`); setSuggest(false); tickets.reload();
    } catch (e) { toast(errMsg(e), "error"); } finally { setBusy(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScreenHeader back title="Help & Support" />
      <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
        <Segmented testID="support-seg" value={seg} onChange={setSeg} options={[{ k: "chat", label: "Live chatbot" }, { k: "tickets", label: `${t("My tickets")} (${tickets.data?.length ?? 0})` }]} />
      </View>
      {seg === "chat" ? (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={0}>
          <FlatList ref={list} data={msgs} keyExtractor={(_, i) => String(i)} testID="chatbot-messages"
            onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
            contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
            renderItem={({ item: m }) => (
              <View style={[styles.bubble, m.from === "me" ? styles.me : styles.bot]}>
                {m.from === "bot" && <Icon name="chatbubbles" size={14} color={colors.brand} />}
                <T v="body" color={m.from === "me" ? colors.onBrand : colors.onSurface}>{m.text}</T>
              </View>
            )}
            ListFooterComponent={suggest ? <Button small variant="accent" icon="ticket-outline" title="Raise support ticket" loading={busy} onPress={raise} testID="chatbot-raise-ticket-btn" style={{ alignSelf: "flex-start", marginTop: spacing.sm }} /> : null} />
          <Row style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.md }]}>
            <TextInput testID="chatbot-input" value={text} onChangeText={setText} placeholder={t("Type your question")} placeholderTextColor={colors.muted}
              style={styles.input} returnKeyType="send" onSubmitEditing={ask} />
            <IconBtn testID="chatbot-send-btn" name="send" color={colors.onBrand} bg={colors.brand} onPress={ask} />
          </Row>
        </KeyboardAvoidingView>
      ) : (
        <FlatList data={tickets.data || []} keyExtractor={(x) => x.id} contentContainerStyle={{ padding: spacing.lg, paddingTop: 0, gap: spacing.sm, paddingBottom: insets.bottom + spacing.xl }}
          ListEmptyComponent={<Empty text="No tickets yet" icon="ticket-outline" testID="tickets-empty" />}
          renderItem={({ item: x }) => (
            <View style={styles.ticket} testID={`ticket-${x.id}`}>
              <Row style={{ justifyContent: "space-between" }}><T v="mono">{x.ticket_no}</T><T v="label" color="#A16207">{x.status}</T></Row>
              <T v="bodyMedium">{x.subject}</T>
              <T v="caption">{`${fmtDT(x.created_at, lang)} · ${x.messages.length} ${t("message(s)")}`}</T>
            </View>
          )} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: "85%", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.lg, gap: 4 },
  me: { alignSelf: "flex-end", backgroundColor: colors.brand, borderBottomRightRadius: radius.sm },
  bot: { alignSelf: "flex-start", backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: radius.sm },
  inputBar: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surfaceSecondary },
  input: { flex: 1, height: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, fontFamily: fonts.text, fontSize: 15, color: colors.onSurface },
  ticket: { gap: 4, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border },
});
