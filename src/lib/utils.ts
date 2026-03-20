/**
 * Sanitize text for @react-pdf/renderer.
 *
 * Helvetica (the built-in PDF font) only supports ASCII printable characters
 * (U+0020 – U+007E) and a handful of Latin-1 Supplement characters
 * (U+00A0 – U+00FF).  Everything else — emojis, smart quotes, bullets,
 * partial multi-byte remnants — must be stripped or replaced.
 *
 * Strategy: whitelist-only.  For each character we check if it lives inside
 * one of the safe ranges.  If not we either map it to an ASCII equivalent
 * or drop it entirely.
 */

// Characters that have a safe ASCII stand-in
const REPLACE_MAP: Record<string, string> = {
  // Smart quotes
  "\u2018": "'",   // left single
  "\u2019": "'",   // right single / apostrophe
  "\u201A": "'",   // single low-9
  "\u201C": '"',   // left double
  "\u201D": '"',   // right double
  "\u201E": '"',   // double low-9
  // Dashes
  "\u2013": "-",   // en-dash
  "\u2014": "-",   // em-dash
  "\u2015": "-",   // horizontal bar
  // Bullet / list markers
  "\u2022": "-",   // bullet
  "\u2023": ">",   // triangular bullet
  "\u25AA": "-",   // small black square
  "\u25CF": "-",   // black circle
  "\u2043": "-",   // hyphen bullet
  // Misc typography
  "\u2026": "...", // ellipsis
  "\u00A9": "(C)", // copyright
  "\u00AE": "(R)", // registered
  "\u2122": "TM",  // trademark
  "\u2020": "+",   // dagger
  "\u2021": "++",  // double dagger
  // Math / arrows
  "\u2192": "->",  // right arrow
  "\u2190": "<-",  // left arrow
  "\u2194": "<->", // left-right arrow
  "\u2265": ">=",  // greater-than-or-equal
  "\u2264": "<=",  // less-than-or-equal
  "\u2260": "!=",  // not-equal
  "\u00D7": "x",   // multiplication sign
  "\u00F7": "/",   // division sign
};

function cleanString(input: string): string {
  let out = "";
  for (const char of input) {
    // 1. Check the replacement map first
    if (REPLACE_MAP[char] !== undefined) {
      out += REPLACE_MAP[char];
      continue;
    }
    const code = char.codePointAt(0)!;
    // 2. ASCII printable (space through tilde) — always safe
    if (code >= 0x20 && code <= 0x7E) {
      out += char;
      continue;
    }
    // 3. Common control characters we want to keep
    if (code === 0x0A || code === 0x0D || code === 0x09) {
      // newline, carriage-return, tab
      out += char;
      continue;
    }
    // 4. Latin-1 Supplement (accented letters like é, ñ, ü) — Helvetica supports these
    if (code >= 0xC0 && code <= 0xFF) {
      out += char;
      continue;
    }
    // 5. Everything else (emojis, CJK, Cyrillic, partial bytes, etc.) — drop it
    // This catches the stubborn ð (U+00F0) fragments left by partial emoji bytes
  }
  return out;
}

export function stripEmojis<T>(obj: T): T {
  if (typeof obj === "string") {
    return cleanString(obj) as any;
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
