# bitchat World View

A real-time Nostr chat application that streams kind 20000 (ephemeral) events from multiple relays using Applesauce.

## Features

- **Real-time streaming** of kind 20000 events from multiple Nostr relays
- **MIRC-style interface** with timestamps, nicknames, and geohash display
- **Auto-scroll** to latest messages
- **Responsive design** with dark theme
- **Live message counter** and relay status

## Prerequisites

- **Node.js 20.19+ or 22.12+** (required for Vite)
- npm or yarn

## Installation

1. **Upgrade Node.js** (if needed):
   ```bash
   # Using Homebrew
   brew install node@20
   
   # Or using nvm
   nvm install 20
   nvm use 20
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Usage

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser** to the URL shown in the terminal (usually `http://localhost:5173`)

3. **Watch for live events** - The app will automatically connect to the configured relays and display incoming kind 20000 events

## Configuration

The app connects to these relays by default:
- `wss://relay.damus.io`
- `wss://nos.lol`
- `wss://relay.primal.net`
- `wss://offchain.pub`
- `wss://nostr21.com`

You can modify the relay list in `src/lib/applesauce.ts`.

## Event Format

Each event displays:
- **Timestamp**: When the event was created
- **Nickname**: From the `n` tag, or pubkey prefix if not available
- **Message**: The event content
- **Geohash**: From the `g` tag (if present)

## Technical Details

- Built with **React 19** + **TypeScript**
- Uses **Applesauce** for Nostr connectivity
- **Tailwind CSS** for styling
- **Vite** for development and building

## Building for Production

```bash
npm run build
```

## Architecture

- **EventStore**: Central in-memory database for events
- **RelayPool**: Manages connections to multiple relays
- **TimelineModel**: Provides sorted, reactive timeline of events
- **React Hooks**: Reactive UI updates using Applesauce hooks

## Troubleshooting

- **Node.js version error**: Make sure you're using Node.js 20.19+ or 22.12+
- **No events showing**: Kind 20000 events are ephemeral and may not be available on all relays
- **Connection issues**: Check your network/firewall allows WebSocket connections to the relays
