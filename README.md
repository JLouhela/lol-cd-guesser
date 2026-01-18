# League of Legends Cooldown Quiz

A web-based quiz application that helps League of Legends players learn champion ability cooldowns through a progressive three-phase questioning system.

## Features

- **Progressive Learning**: Three-phase quiz system that helps you learn cooldowns step by step
  - Phase 1: Identify the cooldown range
  - Phase 2: Guess the exact cooldown within the range
  - Phase 3: Identify the max rank cooldown
- **Visual Comparison**: Animated cooldown visualization comparing Rank 1 vs Max Rank
- **Complete Champion Data**: Uses Riot Games Data Dragon API for up-to-date champion and ability information
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Beautiful UI**: Modern gradient design with smooth animations and transitions

## Technology Stack

- **React 18+** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for styling
- **Riot Games Data Dragon API** for champion data
- **GitHub Pages** for hosting

## Getting Started

### Prerequisites

- Node.js 20.12+ or 22.12+
- npm 10.5+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cdguesser.git
cd cdguesser

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

### Deployment

```bash
# Deploy to GitHub Pages
npm run deploy
```

## How It Works

1. **Champion Selection**: A random champion and ability are selected from the League of Legends roster
2. **Phase 1**: Players guess the cooldown range at a specific rank
3. **Phase 2**: After answering Phase 1, players guess the exact cooldown within the correct range
4. **Phase 3**: Finally, players guess the cooldown at max rank
5. **Visualization**: See an animated comparison of Rank 1 vs Max Rank cooldowns

## Project Structure

```
src/
├── components/
│   ├── Quiz/           # Quiz-specific components
│   ├── Layout/         # Layout components
│   └── common/         # Reusable components
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Development

This project was generated using [Claude Code](https://claude.ai/claude-code), an AI-powered development assistant.

## Legal Notice

League of Legends Cooldown Quiz is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.

## License

MIT
