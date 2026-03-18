export function stripEmojis<T>(obj: T): T {
  if (typeof obj === "string") {
    // Strip emojis to prevent @react-pdf/renderer from rendering garbled text
    return obj.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "") as any;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => stripEmojis(item)) as any;
  }
  if (obj !== null && typeof obj === "object") {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = stripEmojis((obj as any)[key]);
    }
    return newObj as T;
  }
  return obj;
}
