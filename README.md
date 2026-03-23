# 🛡️ FraudShield

> Interactive cyber awareness training platform to help users recognise and avoid scams.

FraudShield is a university final-year project built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**. It teaches scam awareness through interactive scenario training, visual recognition exercises, and branching chat simulations — not just passive reading.

---

## 🌐 Live Demo

> Deploy your own — see [Deployment](#-deployment) below.

---

## ✨ Features

| Module | Description |
|---|---|
| 🎭 **Real or Fraud** | 6 realistic scam scenarios with multiple-choice decisions and immediate feedback |
| 👁️ **Scam Recognition** | Visual hotspot game — identify red flags in emails, SMS and webpages |
| 💬 **Chat Simulator** | Branching scam conversation simulations with outcome-based scoring |
| ⚡ **Adaptive Generator** | Unlimited AI-generated scenarios personalised to your weak areas |
| 📊 **Results Dashboard** | Risk profile, susceptibility scoring, overconfidence detection |
| 🔐 **Auth System** | Sign up / login with session persistence across devices |

### Academic Features (Supervisor Requirements)
- **Behaviour logging** — tracks time taken, confidence score, decision history per attempt
- **Risk profiling** — susceptibility score per manipulation technique (urgency, authority, etc.)
- **Adaptive routing** — next scenario prioritised based on your weakest tags
- **Overconfidence detection** — wrong answer + high confidence flagged separately
- **Progressive difficulty** — Beginner → Intermediate → Advanced
- **Data-driven content** — all scenarios in JSON/TypeScript, no code changes needed to add more

---

## 🏗️ Tech Stack

- **Framework** — [Next.js 14](https://nextjs.org/) (App Router)
- **Language** — TypeScript
- **Styling** — Tailwind CSS
- **Icons** — Lucide React
- **Storage** — JSON files on disk via Next.js API Routes
- **Auth** — Custom session-based auth (no third-party dependencies)

---

## 📁 Project Structure

```
fraudshield/
├── data/                          # JSON database files (git-ignored)
│   ├── users.json                 # Registered user accounts
│   └── sessions.json              # Training progress per user
├── src/
│   ├── app/
│   │   ├── page.tsx               # Landing / Welcome page
│   │   ├── auth/page.tsx          # Login & Signup
│   │   ├── training/page.tsx      # Training Hub dashboard
│   │   ├── real-or-fraud/         # Scenario training module
│   │   ├── scam-recognition/      # Visual hotspot game
│   │   ├── chat-simulator/        # Branching chat simulations
│   │   ├── adaptive-training/     # AI adaptive scenario generator
│   │   ├── results/               # Analytics & risk profile dashboard
│   │   └── api/
│   │       ├── auth/signup/       # POST — create account
│   │       ├── auth/login/        # POST — login
│   │       ├── session/[userId]/  # GET/PUT — training progress
│   │       └── db/export/         # GET — download full JSON snapshot
│   ├── data/
│   │   ├── scenarios.ts           # Real or Fraud scenario content
│   │   ├── recognition.ts         # Scam recognition examples
│   │   └── chatSimulations.ts     # Chat branching trees
│   └── lib/
│       ├── filedb.ts              # Server-side JSON file read/write
│       ├── apiStore.ts            # Client-side API fetch calls
│       ├── session.ts             # Session management & analytics
│       ├── auth.ts                # Auth helpers
│       ├── generator.ts           # Adaptive scenario generator engine
│       ├── store.ts               # localStorage store (guest users)
│       └── useAuth.ts             # React auth hook
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.17 or higher
- **npm** (comes with Node.js)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/fraudshield.git
cd fraudshield
```

**2. Install dependencies**
```bash
npm install
```

**3. Run the development server**
```bash
# Windows CMD (recommended on Windows)
npm run dev

# Mac / Linux
npm run dev
```

**4. Open in browser**
```
http://localhost:3000
```

> ⚠️ **Windows VS Code users** — if PowerShell gives a script execution error, either:
> - Switch VS Code terminal to **Command Prompt**: `Ctrl+Shift+P` → "Terminal: Select Default Profile" → Command Prompt
> - Or run in the regular Windows CMD app instead

---

## 🗄️ Data Storage

User accounts and training progress are stored as plain JSON files in the `data/` folder:

```
data/
├── users.json      ← all registered accounts
└── sessions.json   ← all training progress keyed by user ID
```

You can open these in any text editor to inspect the data, or hit the export endpoint:

```
GET http://localhost:3000/api/db/export
```

This downloads a `fraudshield_export_*.json` file with all data (passwords stripped).

> These files are in `.gitignore` — they will **not** be pushed to GitHub.

---

## ➕ Adding New Content

All training content is data-driven. No logic changes needed.

### Add a Scenario (Real or Fraud)
Edit `src/data/scenarios.ts`:
```typescript
{
  id: "rof-007",
  module: "real_or_fraud",
  difficulty: 2,           // 1=Beginner, 2=Intermediate, 3=Advanced
  tags: ["urgency", "banking"],
  category: "Bank Scam",
  title: "New Scenario Title",
  scenario: "Your scenario description here...",
  sender: "Sender display name",
  options: [
    { id: "a", text: "Option A", safe: false },
    { id: "b", text: "Option B", safe: false },
    { id: "c", text: "Safe option", safe: true },
    { id: "d", text: "Option D", safe: false }
  ],
  correctAnswer: "c",
  feedback_correct: "Explanation when correct...",
  feedback_incorrect: "Explanation when incorrect...",
  redFlags: ["Red flag 1", "Red flag 2"]
}
```

### Add a Chat Simulation
Edit `src/data/chatSimulations.ts` — follow the branching node structure. Each node has `id`, `speaker`, `message`, `options` (pointing to next nodes), and terminal nodes have `isEnd: true` with an `outcome`.

---

## 🎯 Scam Techniques Covered

| Tag | Manipulation Technique |
|---|---|
| `urgency` | Time pressure to bypass rational thinking |
| `authority` | Impersonating police, HMRC, banks |
| `impersonation` | Pretending to be family or trusted contacts |
| `payment` | Requesting money transfers |
| `banking` | Bank fraud and APP scams |
| `tech_support` | Remote access / Microsoft scams |
| `delivery` | Fake parcel fee requests |
| `emotional` | Fear, panic, love bombing |
| `refund_bait` | Fake tax rebates and refunds |

---

## 📦 Deployment

### Vercel (Recommended — free)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and click **"New Project"**
3. Import your GitHub repo
4. Click **Deploy** — done

> Note: Vercel's serverless functions don't persist files between requests. For production with file storage, use a VPS (DigitalOcean, Railway) or swap `filedb.ts` for a database like PostgreSQL or MongoDB.

### Local Production Build
```bash
npm run build
npm start
```

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Create a new account |
| `POST` | `/api/auth/login` | Login to existing account |
| `GET` | `/api/session/:userId` | Get user's training progress |
| `PUT` | `/api/session/:userId` | Save user's training progress |
| `GET` | `/api/db/export` | Download full JSON snapshot |

---

## 🔒 Security Notes

- Passwords are hashed (simple hash for MVP — swap for bcrypt in production)
- `data/*.json` files are git-ignored to prevent committing user data
- No sensitive data is ever returned from login (password hash stripped)
- For production: add HTTPS, rate limiting, and a proper database

---

## 🎓 Academic Context

Built as a final-year university project focused on:
- **Behavioural training** over passive information delivery
- **Manipulation technique awareness** (urgency, authority, emotional pressure)
- **Personalised learning** through adaptive scenario selection
- **Measurable outcomes** via risk profiling and behaviour logging

Supervisor feedback incorporated:
- Scenarios test decision-making, not just identification
- System rewards verification behaviours (calling official numbers)
- Progressive difficulty supports measurable learning improvement
- Confidence tracking reveals overconfidence risk patterns

---

## 📝 License

MIT — free to use for educational purposes.

---

## 👤 Author

Built by **Sarang Abbasi** ·

---

> 🚨 Report real scams to **Action Fraud: 0300 123 2040** · [actionfraud.police.uk](https://www.actionfraud.police.uk)
