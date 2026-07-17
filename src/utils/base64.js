/**
 * base64.js — Pure JavaScript implementation of atob and btoa
 *
 * Compatible with all environments (Web, Node.js, React Native).
 */

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function btoa(input) {
  const str = String(input);
  let output = '';
  for (let block = 0, charCode, i = 0, map = chars;
       str.charAt(i | 0) || (map = '=', i % 1);
       output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
    charCode = str.charCodeAt(i += 3 / 4);
    if (charCode > 0xFF) {
      throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
    }
    block = block << 8 | charCode;
  }
  return output;
}

export function atob(input) {
  const str = String(input).replace(/[=]+$/, '');
  if (str.length % 4 === 1) {
    throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  let output = '';
  for (let bc = 0, bs = 0, buffer, i = 0;
       i < str.length;
       i++) {
    const char = str.charAt(i);
    const idx = chars.indexOf(char);
    if (idx === -1) continue;
    buffer = bc % 4 ? buffer * 64 + idx : idx;
    if (bc++ % 4) {
      output += String.fromCharCode(255 & buffer >> (-2 * bc & 6));
    }
  }
  return output;
}
