import { Platform } from "react-native";
import { fetch as expoFetch } from "expo/fetch";

type FilePart = { uri: string; name: string; mimeType: string };

/** Multipart upload that works on web and real phones (reads file:// via expo/fetch, appends a Blob). */
export async function uploadForm(url: string, opts: { files?: Record<string, FilePart>; fields?: Record<string, string>; token?: string | null }) {
  const form = new FormData();
  for (const [k, v] of Object.entries(opts.fields || {})) form.append(k, v);
  for (const [k, f] of Object.entries(opts.files || {})) {
    const blob = Platform.OS === "web" ? await (await fetch(f.uri)).blob() : await (await expoFetch(f.uri)).blob();
    form.append(k, blob as any, f.name);
  }
  const headers: Record<string, string> = {};
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  const doFetch: any = Platform.OS === "web" ? fetch : expoFetch;
  const res = await doFetch(url, { method: "POST", body: form, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data && typeof data.detail === "string" && data.detail) || "Upload failed");
  return data;
}
