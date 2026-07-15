/**
 * webFileIO.js — Cross-platform file I/O helpers
 *
 * On web:   uses FileReader API (read) + Blob/anchor (write/download)
 * On native: uses expo-file-system (read/write) + expo-sharing (share)
 */
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Read a picked file asset as a Uint8Array.
 *
 * @param {object} asset  - expo-document-picker asset: { uri, name, file? }
 *                          On web, asset.file is a browser File object.
 * @returns {Promise<Uint8Array>}
 */
export async function readFileAsBytes(asset) {
  if (Platform.OS === 'web') {
    // Web: use the raw File object from the picker
    const file = asset.file;
    if (!file) {
      // Fallback: fetch the blob URL
      const response = await fetch(asset.uri);
      const ab = await response.arrayBuffer();
      return new Uint8Array(ab);
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(new Uint8Array(e.target.result));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  } else {
    // Native: expo-file-system
    const b64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    // Convert base64 → Uint8Array
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
}

// ─── Write / Download ─────────────────────────────────────────────────────────

/**
 * Save bytes as a file and prompt the user to download/share.
 *
 * @param {Uint8Array} bytes      - raw bytes to save
 * @param {string}     filename   - suggested file name
 * @param {string}     mimeType   - MIME type (default: application/octet-stream)
 * @param {string}     dialogTitle - (native only) share dialog title
 * @returns {Promise<void>}
 */
export async function saveAndShareBytes(
  bytes,
  filename,
  mimeType = 'application/octet-stream',
  dialogTitle = 'Save file'
) {
  if (Platform.OS === 'web') {
    // Web: trigger a browser download
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    // Native: write to cache then share
    const path = FileSystem.cacheDirectory + filename;
    // Convert bytes → base64
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const b64 = btoa(binary);
    await FileSystem.writeAsStringAsync(path, b64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path, { mimeType, dialogTitle });
    }
  }
}

/**
 * Save a UTF-8 string as a file and prompt download/share.
 *
 * @param {string} text       - text content
 * @param {string} filename   - suggested file name
 * @param {string} mimeType   - MIME type (default: text/plain)
 */
export async function saveAndShareText(
  text,
  filename,
  mimeType = 'text/plain',
  dialogTitle = 'Save file'
) {
  if (Platform.OS === 'web') {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    const path = FileSystem.cacheDirectory + filename;
    await FileSystem.writeAsStringAsync(path, text, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path, { mimeType, dialogTitle });
    }
  }
}
