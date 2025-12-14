# Chronicle

**Design your time. Write your story.**

A minimalist personal planning, journaling, and productivity application with AI-powered insights. Built with React, TypeScript, and Vite, powered by Google Gemini AI.

![Chronicle](https://img.shields.io/badge/Version-1.0.0-orange)
![License](https://img.shields.io/badge/License-MIT-green)
![PWA](https://img.shields.io/badge/PWA-Ready-blue)
![Electron](https://img.shields.io/badge/Desktop-Electron-9feaf9)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white)

![App Screenshot](./assets/Screenshot_Desktop.png)

## Live Demo

**[Try Chronicle Now](https://chronicle-lac.vercel.app)** - No installation required!

## Features

- **Glass Morphism UI** - Beautiful, modern frosted glass design with smooth animations
- **AI-Powered Insights** - Daily schedule analysis powered by Google Gemini AI
- **Interactive Timeline** - Gantt chart view with zoom, pan, and drag controls
- **Smart Reminders** - Configurable alerts (same-day, 1-day, 3-days, 1-week before)
- **Journal Entries** - AI-generated reflection prompts with masonry layout
- **Password Vault** - Secure credential storage with show/hide functionality
- **Analytics Dashboard** - Visual breakdown of your activities by category
- **Local Storage** - All data persists locally in your browser
- **Progressive Web App** - Install on any device, works offline
- **Desktop App** - Native Windows executable via Electron

## Design Philosophy

> "Simplicity is the ultimate sophistication."

Chronicle strips productivity down to its essentials. No clutter. No distractions. Just a calm, focused space to plan your time and write your story.

## Installation

### Option 1: Use Online (Recommended)

Visit **[https://chronicle-lac.vercel.app](https://chronicle-lac.vercel.app)** and install as a PWA:

#### Install on Desktop (Chrome/Edge)
1. Open the app in Chrome or Edge
2. Look for the **install icon** (⊕) in the address bar (right side)
3. Click it and select **"Install"**
4. Chronicle will open as a standalone app!

#### Install on iPhone/iPad
1. Open the app in **Safari**
2. Tap the **Share button** (box with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"** in the top right
5. Chronicle appears on your home screen!

#### Install on Android
1. Open the app in **Chrome**
2. Tap the **three dots menu** (⋮)
3. Tap **"Add to Home screen"** or **"Install app"**
4. Tap **"Install"**
5. Chronicle appears in your app drawer!

### Option 2: Download Windows App

Download the portable Windows executable:
1. Go to [Releases](https://github.com/me-yeatz/Chronicle/releases)
2. Download `Chronicle 1.0.0.exe`
3. Run the file - no installation needed!

### Option 3: Build from Source

```bash
# Clone the repository
git clone https://github.com/me-yeatz/Chronicle.git
cd Chronicle

# Install dependencies
npm install

# Set up your Gemini API key
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# Run development server
npm run dev

# Build for production
npm run build

# Build Windows .exe
npm run electron:build:win
```

Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/)

## Mobile Preview

![Mobile Screenshot](./assets/Screenshot%20Mobile.png)

## Project Structure

```
Chronicle/
├── App.tsx                    # Main app component
├── index.tsx                  # React entry point
├── index.html                 # HTML template with PWA config
├── types.ts                   # TypeScript interfaces
├── vite.config.ts             # Vite + PWA configuration
├── package.json               # Dependencies and scripts
├── vercel.json                # Vercel deployment config
├── .env.local                 # Environment variables (API key)
├── assets/
│   ├── chronicle.png          # App icon
│   ├── Screenshot_Desktop.png # Desktop screenshot
│   └── Screenshot Mobile.png  # Mobile screenshot
├── components/
│   ├── Sidebar.tsx            # Navigation sidebar
│   ├── GanttChart.tsx         # Interactive timeline
│   ├── StatsChart.tsx         # Analytics pie chart
│   ├── EventModal.tsx         # Event create/edit modal
│   ├── Journal.tsx            # Journal entries view
│   ├── RemindersView.tsx      # Reminders management
│   └── PasswordVault.tsx      # Credential manager
├── services/
│   └── geminiService.ts       # Gemini AI integration
├── electron/
│   └── main.js                # Electron main process
└── public/
    └── icon-*.png             # PWA icons
```

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Charts and analytics
- **Lucide React** - Icons
- **Google Gemini AI** - AI-powered insights
- **Electron** - Desktop app
- **vite-plugin-pwa** - Progressive Web App
- **Vercel** - Hosting

## Usage

1. **Dashboard**: View AI insights, timeline, upcoming events, and analytics
2. **Timeline**: Click events to edit, use zoom/pan controls to navigate
3. **New Event**: Click "+ New Event" to create plans with categories and reminders
4. **Journal**: Mark events as journal entries for reflection
5. **Reminders**: Manage active, scheduled, and dismissed alerts
6. **Vault**: Store and manage credentials securely
7. **Analytics**: View activity breakdown by category

## Roadmap

- [ ] Cloud sync (optional)
- [ ] Dark mode toggle
- [ ] Export to PDF/iCal
- [ ] Recurring events
- [ ] Browser notifications
- [ ] Collaboration features
- [ ] Mobile app (React Native)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**me-yeatz**

- GitHub: [@me-yeatz](https://github.com/me-yeatz)

## Acknowledgments

- Glass morphism design inspiration
- Google Gemini AI for intelligent insights
- Built with modern web technologies

---

**Made with passion by yeatz2025**
