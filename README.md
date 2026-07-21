# 🛡️ CryptVault

CryptVault is a modern, premium, cross-platform file encryption application built with **React Native** and **Expo**. It provides military-grade security to encrypt and decrypt files using cryptographically secure 256-bit Fernet keys or custom passwords, wrapped within a sleek glassmorphic dark interface.

The application's encryption format is fully compliant with the **Fernet Specification** (AES-128-CBC + HMAC-SHA256), enabling seamless interoperability with Python scripts (such as `file_crypt.py` in the root repository) and other standard Fernet tools.

🌐 **Live Web App**: [https://dileesha001.github.io/CryptApp](https://dileesha001.github.io/CryptApp)

---

## ✨ Key Features

- **🔐 Robust Encryption**: Encrypts files using `AES-128-CBC` combined with `HMAC-SHA256` for integrity validation and anti-tampering verification.
- **🗝️ CSPRNG Key Generation**: Generates cryptographically secure 256-bit Fernet keys with instant copy-to-clipboard and `.key` file export.
- **📂 Flexible Modes**:
  - **Key File Mode**: Use `.key` secret files to encrypt and decrypt documents.
  - **Password Mode**: Protect files with traditional passwords derived via **PBKDF2-HMAC-SHA256** (600k iterations).
- **🖥️ Adaptive Desktop Layout**: A dedicated `DesktopLayout` component provides a persistent sidebar navigation on screens ≥ 1024px, delivering a true desktop-class experience alongside standard mobile stack navigation.
- **🖌️ Glassmorphism Design System**: Hand-crafted dark theme featuring glass visual effects, glowing accents, fluid micro-interactions, and responsive layout scaling from mobile to 1440px wide desktop viewports.
- **🅰️ Dual Custom Typography**: Loads both **Space Grotesk** (headings) and **Inter** (body/UI) from Google Fonts via a custom `useFonts` hook. Fonts load asynchronously without blocking the initial render — system fonts serve as fallback.
- **🔁 Reactive Theme System**: A `useTheme` hook wraps `useWindowDimensions` to expose live responsive size helpers (`rs`, `rf`, `hPad`, `fontSize`, `spacing`, `radius`) that recompute on every window resize.
- **📂 Cross-Platform File Management**: Native and Web support for picking files, saving encrypted outputs, downloading keys, and triggering native share dialogs.
- **🐍 Python Interoperability**: 100% compatible with the root CLI tool (`file_crypt.py`) and Python's `cryptography.fernet` module.

---

## 🛠️ Security Specifications

CryptVault prioritizes cryptographic rigor:
1. **Algorithm**: AES (Advanced Encryption Standard) in Cipher Block Chaining (CBC) mode with a 128-bit key size.
2. **Integrity & Authenticity**: HMAC-SHA256 signature calculated over the IV + Ciphertext to prevent padding oracle attacks and detect unauthorized alterations.
3. **Key Derivation (Password Mode)**: PBKDF2 with SHA-256 using 600,000 iterations and a 16-byte random salt to resist brute-force cracking attempts.
4. **Format Standard**: Strictly adheres to the Fernet token specification (Version `0x80`).

---

## 📦 Directory Structure

```filepath
CryptApp/
├── App.js                 # App entrypoint, non-blocking font loading & navigation
├── index.js               # Entry registration for Expo
├── app.json               # Expo configuration settings
├── package.json           # App dependencies, run & deploy scripts
├── README.md              # CryptVault specific documentation
├── assets/                # App icons, splash screens, and design assets
└── src/
    ├── components/        # Reusable UI components
    │   ├── ActionCard.js     # Glassmorphic card for main dashboard options
    │   ├── DesktopLayout.js  # Sidebar layout wrapper for desktop viewports (≥1024px)
    │   ├── FilePicker.js     # Unified file picker component for Web & Mobile
    │   ├── PasswordInput.js  # Password input with visibility toggle & strength feedback
    │   └── StatusModal.js    # Custom glassmorphic feedback modal for alerts & status
    ├── crypto/            # Pure JavaScript Fernet engine
    │   └── fernet.js         # AES-128-CBC + HMAC-SHA256 Fernet encoder/decoder
    ├── hooks/             # Custom React hooks
    │   ├── useFonts.js       # Dynamic loader for Space Grotesk & Inter (Google Fonts)
    │   └── useTheme.js       # Reactive responsive helpers via useWindowDimensions
    ├── screens/           # Application views
    │   ├── HomeScreen.js     # Main dashboard & hero navigation screen
    │   ├── GenKeyScreen.js   # Fernet 256-bit key generator & saver screen
    │   ├── EncryptScreen.js  # File encryption interface (Key / Password mode)
    │   └── DecryptScreen.js  # File decryption & integrity check screen
    ├── utils/             # Platform utility helpers
    │   ├── base64.js         # Base64 and URL-safe Base64 converters
    │   └── webFileIO.js      # Cross-platform file saving & web download handlers
    └── theme.js           # Central design system, colors, tokens & responsiveness helper
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:
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

For Windows environments where PowerShell policies may restrict script execution, run using **Command Prompt (cmd)** or use direct node modules invocation:

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

### Deploying to GitHub Pages

The app is pre-configured for static web deployment. To publish the web build:

```cmd
npm run deploy
```

This runs `npx expo export -p web` (the `predeploy` script) to build the static bundle into `dist/`, then publishes it via `gh-pages`.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

