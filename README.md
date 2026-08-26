# WaterMark — Secure Your Administrative Documents 🛡️

<div align="center">

![WaterMark](https://img.shields.io/badge/WaterMark-v1.0-blue)
![License](https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-red)
![Platform](https://img.shields.io/badge/Platform-Web%20(PWA)-green)

**100% client-side security watermarking for PDFs and images**

</div>

---

## 🔐 Why WaterMark?

When you send your ID cards, bank statements (RIB/IBAN), proof of address, or other sensitive documents via email, it's important to add a watermark indicating:
- Who the document is intended for
- The context of the transfer
- The date of issuance

WaterMark lets you add these notices **quickly, securely, and invisibly** — without ever uploading your documents to a server.

---

## ⚡ Key Features

- **🔒 100% local**: Your documents stay on your device, no uploads
- **🌍 Works everywhere**: Browser, iOS, Android — nothing to install
- **📄 Supported formats**: PDF, JPG, PNG, WEBP, BMP, GIF
- **⚙️ Ready-to-use presets**: Common use cases in one click
- **🎨 Customizable**: Color, opacity, size, position, rotation
- **💾 PWA installable**: Add to favorites or install as an app
- **🚀 Zero server dependency**: Open source, auditable, deployable anywhere

---

## 🚀 Usage

### Online (Recommended)
Access the app from any modern browser:
- Desktop: Chrome, Firefox, Safari, Edge
- Mobile: Safari (iOS), Chrome (Android), Zen Browser

### Local Installation
```bash
git clone https://github.com/Hichiro6/watermark.git
cd watermark
npm install
npm run dev
```

The app opens at `http://localhost:5173`

### Production Build
```bash
npm run build
# The dist folder contains everything needed for deployment
```

You can host the contents of the `dist` folder on:
- GitHub Pages
- Netlify
- Vercel
- Any static server

### With Docker (Recommended for Production)

Docker containerization makes it easy to deploy the application anywhere.

#### Prerequisites
- Docker ≥ 20.10
- Docker Compose ≥ 2.0

#### Build and Launch

```bash
# Build the Docker image
docker compose build

# Launch the container
docker compose up -d

# Verify the app is accessible
curl http://localhost:8080

# Stop the containers
docker compose down
```

#### Useful Commands

```bash
# View logs
docker compose logs -f

# Restart the service
docker compose restart

# Stop and remove container + log volume
docker compose down -v

# Build without cache (for a clean rebuild)
docker compose build --no-cache
```

#### Environment Variables (Optional)

You can customize behavior via environment variables:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `NGINX_WORKER_PROCESSES` | Number of nginx processes | `auto` |
| `NGINX_MAX_BODY_SIZE` | Maximum upload size | `10m` |

Example with custom variables:
```bash
NGINX_MAX_BODY_SIZE=50m docker compose up -d
```

#### Healthcheck

The container includes a healthcheck that verifies the app responds on `/index.html`.  
Healthcheck status:
```bash
docker compose ps
docker inspect --format='{{.State.Health.Status}}' watermark-app
```

---

## 💡 How It Works

1. **Drag & drop** your document (PDF or image)
2. **Choose a preset** or write your own text
3. **Adjust appearance** (color, opacity, position, etc.)
4. **Download** the document with integrated watermark

> ⚠️ **Important**: No files are sent to a server. Everything is processed locally in your browser via JavaScript.

---

## 🎯 Available Presets

| Icon | Name | Description |
|------|------|-------------|
| 🪪 | ID Card | "Copy for identity verification only — {date}" |
| 🏦 | Bank Statement (RIB/IBAN) | "Bank statement sent to {recipient} — Single use — {date}" |
| 🏠 | Proof of Address | "Proof of address for {recipient} — {date}" |
| 🚗 | Driver's License | "Driver's license copy — Single use — Sent to {recipient} on {date}" |
| 📄 | Invoice / Quote | "Document sent to {recipient} — {date}" |
| ⚕️ | Medical Document | "Medical document — Strictly private — Do not distribute — {date}" |

### Dynamic Variables
- `{date}` → Automatically replaced with today's date
- `{recipient}` → Free text field (organization name)
- `{usage}` → Purpose of the transfer

---

## 🛠️ Tech Stack

| Role | Technology |
|------|------------|
| Framework | Vite (vanilla JS) |
| PDF Manipulation | pdf-lib |
| Canvas Rendering | Native HTML5 Canvas API |
| PWA | Service Worker + Web App Manifest |
| Styling | Modern CSS3 (CSS Variables) |
| Build | Vite |

---

## 📁 Project Structure

```
watermark/
├── index.html              # Main page
├── src/
│   ├── main.js             # Main orchestrator
│   ├── presets.js          # Watermark presets
│   ├── image-handler.js    # Image processing
│   └── pdf-handler.js      # PDF processing
├── styles/
│   └── main.css            # Global styles
├── public/
│   ├── manifest.json       # PWA configuration
│   ├── sw.js               # Service Worker (offline)
│   └── favicon.svg         # Logo
├── Dockerfile              # Multi-stage Docker image
├── docker-compose.yml      # Docker Compose orchestration
├── .dockerignore           # Files excluded from Docker build
├── nginx.conf              # Nginx configuration
├── LICENSE                 # CC BY-NC-ND 4.0
├── README.md
└── package.json
```

---

## 📝 License

**CC BY-NC-ND 4.0** — Attribution - NonCommercial - NoDerivatives

- ✅ Personal use allowed
- ✅ Attribution required (Hichiro / Hichiro6)
- ❌ No commercial use
- ❌ No modifications allowed
- ❌ No redistribution without attribution

See [LICENSE](LICENSE) for the full text.

---

## 🤝 Contributing

Contributions are welcome for:
- UI/UX improvements
- New format support (DOCX, etc.)
- Performance optimizations
- Translations

⚠️ Note: All contributions must comply with the CC BY-NC-ND 4.0 license.

---

## 🙋 FAQ

**Q: Are my documents really processed locally?**  
A: Yes, absolutely. No network calls are made after the initial page load. Everything executes locally in your browser.

**Q: Can I use this app without internet?**  
A: Yes! Once the page loads, the Service Worker caches all assets. You can even add the app to your home screen (PWA) and use it offline.

**Q: Which browsers are supported?**  
A: All modern browsers (Chrome, Firefox, Safari, Edge, Opera). iOS: Safari 14+. Android: Chrome 80+.

**Q: Is there a mobile version?**  
A: The app is responsive and can be "installed" as a native app via "Add to Home Screen" on iOS and Android.

**Q: Can I change the watermark colors?**  
A: Yes, 5 predefined colors are available (red, blue, green, purple, black). More customization options are planned.

---

## 📧 Contact

Developed by **Hichiro** (GitHub: [@Hichiro6](https://github.com/Hichiro6))

Issues and PRs on GitHub: https://github.com/Hichiro6/watermark

---

<div align="center">

**Secure your documents — simply, locally, efficiently.**

Made with ❤️ in Belgium

</div>
