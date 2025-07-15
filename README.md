# ⚡ Smart Battery Saver

A React + TypeScript-based web application that intelligently monitors and suggests optimizations for battery life, network usage, and device activity.

---

## 🚀 Features

- 🔋 Real-time battery usage insights
- 📍 Location tracking using browser geolocation
- 📶 Wi-Fi status detection
- 🌐 Online/offline detection
- 🌙 Battery-saving suggestions based on system state
- 📱 Mobile-first responsive UI
- 🌈 Clean UI with Lucide React Icons

---

## 🧩 Tech Stack

- React (with Hooks)
- TypeScript
- Lucide React
- Web APIs (`BatteryManager`, `Geolocation`, `navigator.onLine`)
- Tailwind CSS (optional for styling)

---


## 🧠 Web APIs Used

| Web API                                | Used? | Description                                                                 |
|----------------------------------------|-------|-----------------------------------------------------------------------------|
| [Battery Status API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API) | ✅     | To track battery level, charging state, and display energy usage tips      |
| [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)         | ✅     | To fetch user’s latitude and longitude using the browser                   |
| [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API) | ✅     | To check internet connection type (e.g., 4G, Wi-Fi)                        |
| [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) | ✅     | To detect when UI elements (tips) enter the viewport                      |
---

## 📦 Installation

```bash
git clone https://github.com/your-username/smart-battery-saver.git
cd smart-battery-saver
npm install
npm start


## Project Structure..

smart-battery-saver/
├── public/
│   └── index.html
├── src/
│   ├── App.tsx
│   ├── SmartBatterySaver.tsx
│   ├── index.tsx
│   └── styles/
│       └── tailwind.css (optional)
├── tsconfig.json
├── package.json
└── README.md
