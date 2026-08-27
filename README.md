# WaterMark — Secure Your Administrative Documents 🛡️

> Add security watermarks to PDFs and images — 100% client-side, privacy-first

<div align="center">

![Version](https://img.shields.io/badge/WaterMark-v1.0-blue)
![License](https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-red)
![Platform](https://img.shields.io/badge/Platform-Web%20(PWA)-green)
![Tests](https://img.shields.io/badge/Tests-Playwright%20%7C%20Vitest-blue)

**100% client-side security watermarking for PDFs and images**

</div>

---

## 🔐 Why WaterMark?

When you send sensitive documents via email — ID cards, bank statements (RIB/IBAN), proof of address, passports — it's important to add a watermark indicating:

- **Who** the document is intended for (recipient name)
- **Why** the document is being shared (context/purpose)
- **When** the document was issued (date)

WaterMark lets you add these notices **quickly, securely, and locally** — without ever uploading your documents to a server.

---

## ⚡ Key Features

- **🔒 100% Local Processing** — All operations happen in your browser, nothing is uploaded
- **📄 PDF & Image Support** — Watermark both PDF files and images (PNG, JPEG, WebP)
- **📝 Customizable Text** — Set recipient name, purpose, date, and custom messages
- **🎨 Full Style Control** — Adjust font size, color, opacity, rotation, and position
- **📐 Multiple Positions** — Center, diagonal, top-left, bottom-right, and more
- **💡 Preset Templates** — Pre-configured watermarks for common use cases (RIB, ID, etc.)
- **👁️ Live Preview** — See the watermark in real-time before applying
- **🌐 Multi-Language** — Supports EN, FR, DE, ES, PT, NL, IT
- **♿ Accessible** — Full keyboard navigation and screen reader support (ARIA-compliant)
- **📱 PWA Ready** — Install as a Progressive Web App on mobile devices

---

## 🚀 Quick Start

### Online Demo
Visit the live demo (if hosted): `https://[your-domain]/watermark`

### Local Development
```bash
# Clone the repository
git clone https://github.com/Hichiro6/watermark.git
cd watermark

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📖 Usage Guide

### Step 1: Upload Your Document
- Drag and drop a PDF or image file onto the dropzone, or
- Click to browse and select a file

### Step 2: Configure Your Watermark
- **Choose a preset** (e.g., "RIB", "ID Card", "Proof of Address") or create a custom one
- **Set the text** — Recipient name, purpose, date
- **Customize appearance** — Font size, color, opacity, rotation angle, position

### Step 3: Preview and Download
- See a live preview of the watermarked document
- Adjust settings until satisfied
- Download the watermarked file

---

## 🎯 Preset Templates

| Preset | Use Case | Default Text |
|--------|----------|--------------|
| **RIB / IBAN** | Bank details sharing | "Pour [recipient] — [date]" |
| **ID Card** | Identity documents | "Copie pour [recipient] — [date]" |
| **Proof of Address** | Utility bills, rent receipts | "Pour [recipient] — [date]" |
| **Custom** | Any other document | Fully customizable |

---

## 🛠️ Technical Stack

| Technology | Purpose |
|------------|---------|
| **[Vite](https://vitejs.dev/)** | Build tool & dev server |
| **[pdf-lib](https://pdf-lib.js.org/)** | PDF watermarking |
| **[PDF.js](https://mozilla.github.io/pdf.js/)** | PDF rendering & preview |
| **Canvas API** | Image watermarking |
| **[Biome](https://biomejs.dev/)** | Linting & formatting |
| **[Vitest](https://vitest.dev/)** | Unit testing |
| **[Playwright](https://playwright.dev/)** | E2E testing |

---

## 🧪 Testing

```bash
# Run unit tests
npm run test:unit

# Run E2E tests
npm run test:e2e

# Run tests with UI
npm run test:ui

# View test report
npm run test:report
```

---

## 📂 Project Structure

```
watermark/
├── src/
│   ├── main.js           # Application logic
│   ├── image-handler.js  # Image watermarking module
│   ├── presets.js        # Preset watermark templates
│   └── i18n.js           # Internationalization
├── styles/
│   └── main.css          # Global styles
├── public/
│   ├── manifest.json     # PWA manifest
│   ├── sw.js             # Service worker
│   └── icons/            # PWA icons
├── tests/
│   ├── unit/             # Unit tests
│   └── e2e/              # Playwright E2E tests
├── vite.config.js        # Vite configuration
├── playwright.config.js  # Playwright configuration
└── biome.json            # Biome linting rules
```

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (HMR enabled) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Check code with Biome |
| `npm run format` | Format code with Biome |
| `npm test` | Run all tests |

---

## 🌍 Internationalization

Supported languages:
- **English** (default)
- **Français** (FR)
- **Deutsch** (DE)
- **Español** (ES)
- **Português** (PT)
- **Nederlands** (NL)
- **Italiano** (IT)

Add your language by editing `src/i18n.js`.

---

## 🔐 Security & Privacy

- ✅ **No network calls** — All processing is local
- ✅ **No analytics** — No tracking or telemetry
- ✅ **No cookies** — Nothing stored externally
- ✅ **No backend** — Zero server requirements
- ✅ **Open source** — Code is auditable

---

## 📄 License

Copyright © 2026 Hichiro6

Licensed under **CC BY-NC-ND 4.0** — You are free to share and adapt this work for non-commercial purposes, provided you give attribution and do not create derivative works.

See [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

This project is released under a restrictive license to protect privacy-focused usage. For commercial licensing or contributions, please open an issue.

---

## 🙏 Acknowledgments

- [pdf-lib](https://pdf-lib.js.org/) — PDF manipulation library
- [PDF.js](https://mozilla.github.io/pdf.js/) — Mozilla's PDF toolkit
- [Vite](https://vitejs.dev/) — Next-generation frontend tooling

---

<div align="center">

**Made with ❤️ for privacy-conscious users**

[Report Bug](https://github.com/Hichiro6/watermark/issues) · [Request Feature](https://github.com/Hichiro6/watermark/issues)

</div>
