# Wildverse 🐾

An interactive virtual wildlife museum for exploring animals and learning about nature.

## Features

- 🐘 **Explore Creatures** — Browse animals by category.
- 🔬 **Learn About Wildlife** — Discover scientific names and animal information.
- 🤖 **Wildverse AI** — Ask questions about animals, biology, and nature.
- 💬 **AI Chat History** — Continue or revisit conversations.

## Tech Stack

- React + Vite
- CSS
- Supabase
- Node.js + Express
- Google Gemini API

## Run Locally

```bash
# Install frontend dependencies
npm install

# Start the frontend
npm run dev
```

For the AI Explorer, configure the Gemini API key in `server/.env`, then start the backend separately:

```bash
cd server
npm install
npm start
```

## Environment Variables

Create `server/.env` and add:

```env
GEMINI_API_KEY=your_api_key
```

Never commit API keys or secrets to GitHub.

## Status

🚧 Under development