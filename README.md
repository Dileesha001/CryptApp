# 🛡️ CryptVault

CryptVault is a modern, premium, cross-platform file encryption application built with **React Native** and **Expo**. It provides military-grade security to encrypt and decrypt files using a cryptographically secure 256-bit key or custom passwords, all designed within a sleek, glassmorphic dark interface.

The encryption format is fully compatible with the standard **Fernet specification**, enabling seamless interoperability with Python scripts and other Fernet-compatible tools.

---

## ✨ Features

- **🔐 Robust Encryption**: Secures files using `AES-128-CBC` combined with `HMAC-SHA256` for integrity validation and tamper detection.
- **🗝️ CSPRNG Key Generation**: Generates cryptographically secure 256-bit random Fernet keys.
- **📂 Double Modes**:
  - **Key File Mode**: Generate and download a `.key` file to encrypt/decrypt documents.
  - **Password Mode**: Protect files with traditional passwords derived using secure hashing.
- **🖥️ Responsive Glassmorphism Design**: Hand-crafted, modern responsive UI scaling elegantly from mobile screens up to 1440px wide desktop viewports.
- **📤 Sharing & Exporting**: Integrated with Expo's document picker, sharing APIs, and file system to easily save keys and encrypted/decrypted outputs.
- **🐍 Python Interoperable**: Fully compatible with CLI-based python script encryptors (`file_crypt.py` / cryptography library).

---

## 🛠️ Security Specifications

CryptVault prioritizes cryptographic rigor:
1. **Algorithm**: AES (Advanced Encryption Standard) in Cipher Block Chaining (CBC) mode with a 128-bit key size.
2. **Authenticity**: HMAC-SHA256 signature calculated over the IV + Ciphertext to prevent padding oracle attacks and detect unauthorized alterations.
3. **Key Derivation (Password Mode)**: PBKDF2 with SHA-256 using 600,000 iterations to resist brute-force cracking attempts.
4. **Format Compatibility**: Strictly adheres to the Fernet token specification (Version 0x80).

---

## 📦 Directory Structure

```filepath
CryptApp/
├── App.js                 # App entrypoint & theme-wrapper navigation configuration
├── app.json               # Expo configuration
├── package.json           # App dependencies & scripts
├── src/
│   ├── components/
│   │   ├── ActionCard.js  # Interactive menu options for Home
│   │   └── StatusModal.js # Beautiful glassmorphic modal for feedback messages
│   ├── crypto/
│   │   └── fernet.js      # Custom Fernet encryption/decryption algorithm implementation
│   ├── screens/
│   │   ├── HomeScreen.js  # Main dashboard featuring action grids
│   │   ├── GenKeyScreen.js# Fernet key generator and exporter
│   │   ├── EncryptScreen.js# File encryptor (Key or Password mode)
│   │   └── DecryptScreen.js# File decryptor with integrity validator
│   └── theme.js           # Premium theme styling tokens, gradients, and custom utility functions
└── assets/                # App icons and design assets
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**

### Installation

1. Navigate to the project folder:
   ```cmd
   cd "d:\File Encryption Tool\CryptApp"
   ```

2. Install dependencies:
   ```cmd
   npm install
   ```

### Running the Application

Because standard PowerShell policies might block script execution on some Windows environments, use **Command Prompt (cmd)** to run commands.

- **Start Metro Bundler**:
  ```cmd
  node_modules\.bin\expo.cmd start
  ```

- **Run in Web Browser**:
  ```cmd
  node_modules\.bin\expo.cmd start --web
  ```

- **Run on Android**:
  ```cmd
  node_modules\.bin\expo.cmd start --android
  ```

- **Run on iOS**:
  ```cmd
  node_modules\.bin\expo.cmd start --ios
  ```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
