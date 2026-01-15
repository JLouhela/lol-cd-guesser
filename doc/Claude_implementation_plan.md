# League of Legends Cooldown Quiz - Technical Specification

## Project Overview

A web-based quiz application that helps League of Legends players learn champion ability cooldowns through a progressive three-phase questioning system.

## Technology Stack

- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS (modern, responsive design)
- **Build Tool**: Vite (fast development, optimized builds)
- **Hosting**: GitHub Pages (static hosting compatible)
- **Data Source**: Riot Games Data Dragon API

## Data Dragon API Reference

### Base URLs
```
Version API: https://ddragon.leagueoflegends.com/api/versions.json
Champion List: https://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/champion.json
Champion Detail: https://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/champion/{ChampionId}.json
```

### Asset URLs
```
Champion Square Icon: https://ddragon.leagueoflegends.com/cdn/{version}/img/champion/{ChampionId}.png
Spell Icon: https://ddragon.leagueoflegends.com/cdn/{version}/img/spell/{SpellImageFull}
Passive Icon: https://ddragon.leagueoflegends.com/cdn/{version}/img/passive/{PassiveImageFull}
```

### Champion Detail JSON Structure (relevant fields)
```typescript
interface ChampionDetail {
  data: {
    [championId: string]: {
      id: string;           // e.g., "Aatrox"
      name: string;         // e.g., "Aatrox" (display name)
      image: {
        full: string;       // e.g., "Aatrox.png"
      };
      allytips: string[];   // Tips for playing as this champion
      enemytips: string[];  // Tips for playing against this champion
      spells: Spell[];      // Array of 4 spells [Q, W, E, R]
    }
  }
}

interface Spell {
  id: string;               // e.g., "AatroxQ"
  name: string;             // e.g., "The Darkin Blade"
  description: string;      // Short description
  tooltip: string;          // Detailed tooltip (may contain placeholders)
  cooldown: number[];       // Array of cooldowns per rank [rank1, rank2, rank3, rank4, rank5]
  cooldownBurn: string;     // String version e.g., "14/12/10/8/6"
  maxrank: number;          // Usually 5 for basic abilities, 3 for ultimates
  image: {
    full: string;           // e.g., "AatroxQ.png"
  };
}
```

### Keybind Mapping
- `spells[0]` = Q
- `spells[1]` = W
- `spells[2]` = E
- `spells[3]` = R (Ultimate)

## Quiz Flow Design

### Phase 1: Cooldown Range Question
Display a random champion ability and ask the user to identify the cooldown range category.

**Question Format**: "What is the cooldown range of this ability at Rank {1-5}?"

**Answer Generation Algorithm**:
```typescript
function generateRangeOptions(actualCooldown: number): [string, string, string] {
  // Determine appropriate range size based on cooldown magnitude
  const rangeSize = getRangeSize(actualCooldown);
  
  // Generate 3 non-overlapping ranges where one contains the correct answer
  // Ranges should feel natural (e.g., "2-4s", "5-7s", "8-10s")
}

function getRangeSize(cooldown: number): number {
  if (cooldown <= 6) return 2;        // Small CDs: 2s ranges (e.g., 2-4s, 5-6s)
  if (cooldown <= 15) return 3;       // Medium CDs: 3s ranges (e.g., 7-9s, 10-12s)
  if (cooldown <= 40) return 5;       // Large CDs: 5s ranges (e.g., 20-25s)
  if (cooldown <= 80) return 10;      // Very large: 10s ranges (e.g., 60-70s)
  return 20;                          // Ultimate CDs: 20s ranges (e.g., 100-120s)
}
```

### Phase 2: Exact Cooldown (within range)
After Phase 1 is answered, reveal the correct range and ask for the exact cooldown.

**Question Format**: "What is the exact cooldown within the {X-Y}s range?"

**Answer Options**: 3 values from within the selected range (one correct)

### Phase 3: Rank 5 Cooldown
After Phase 2, ask for the Rank 5 cooldown.

**Question Format**: "What is the cooldown at Rank 5?"

**Answer Options**: 3 exact values including the correct Rank 5 cooldown
- One option should always be the Rank 1 cooldown (if different)
- If Rank 1 and Rank 5 are the same, indicate "Cooldown doesn't change"

**Special Case**: If the spell is an Ultimate (maxrank: 3), use Rank 3 instead

## UI/UX Design

### Main Quiz Screen Layout
```
┌─────────────────────────────────────────────────┐
│  [Champion Icon]  Champion Name                 │
│  Ability: [Spell Icon]  Spell Name (Q/W/E/R)   │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Large Spell Icon Display]                     │
│                                                 │
├─────────────────────────────────────────────────┤
│  Spell Description                              │
│  (with tooltip/description text)                │
├─────────────────────────────────────────────────┤
│  💡 Ally Tips / ⚔️ Enemy Tips                   │
│  (collapsible section)                          │
├─────────────────────────────────────────────────┤
│  Phase 1 Question:                              │
│  What is the cooldown at Rank 1?                │
│                                                 │
│  ┌───────┐  ┌───────┐  ┌───────┐              │
│  │ 2-4s  │  │ 5-7s  │  │ 8-10s │              │
│  └───────┘  └───────┘  └───────┘              │
│                                                 │
│  [After answer - show Phase 2 with animation]   │
│                                                 │
│  [After Phase 2 - show Phase 3 with animation]  │
├─────────────────────────────────────────────────┤
│  [Cooldown Visualization]                       │
│  (Animated circles comparing Rank 1 vs Rank 5)  │
├─────────────────────────────────────────────────┤
│           [Next Question Button]                │
└─────────────────────────────────────────────────┘
```

### Answer Feedback
- **Correct**: Green highlight + checkmark animation
- **Incorrect**: Red highlight + show correct answer highlighted in green

### Cooldown Visualization Ideas
1. **Circle Timer Animation**: Two circles that fill up at different speeds representing Rank 1 and Rank 5 cooldowns
2. **Bar Comparison**: Horizontal bars growing to represent relative cooldown lengths
3. **Countdown Animation**: Animated numbers counting down from each cooldown value
4. **Pie Chart**: Visual comparison showing how much faster Rank 5 is

## Component Structure

```
src/
├── components/
│   ├── Quiz/
│   │   ├── QuizContainer.tsx       # Main quiz logic and state
│   │   ├── ChampionDisplay.tsx     # Champion icon and name
│   │   ├── SpellDisplay.tsx        # Spell icon, name, keybind
│   │   ├── SpellDescription.tsx    # Description and tips
│   │   ├── QuestionPhase.tsx       # Individual phase component
│   │   ├── AnswerButton.tsx        # Styled answer option
│   │   ├── CooldownVisualization.tsx # End-of-round visualization
│   │   └── NextButton.tsx          # Next question button
│   ├── Layout/
│   │   ├── Header.tsx              # App header/title
│   │   └── Footer.tsx              # Credits, version info
│   └── common/
│       ├── LoadingSpinner.tsx
│       └── ErrorDisplay.tsx
├── hooks/
│   ├── useChampionData.ts          # Fetch and cache champion data
│   └── useQuizLogic.ts             # Quiz state management
├── services/
│   └── dataDragon.ts               # API service layer
├── types/
│   └── index.ts                    # TypeScript interfaces
├── utils/
│   ├── cooldownHelpers.ts          # Range generation, answer logic
│   └── randomization.ts            # Champion/spell selection
├── App.tsx
├── main.tsx
└── index.css                       # Tailwind imports
```

## State Management

```typescript
interface QuizState {
  // Data
  version: string;
  champions: ChampionSummary[];
  currentChampion: ChampionDetail | null;
  currentSpell: Spell | null;
  currentSpellIndex: number;  // 0=Q, 1=W, 2=E, 3=R
  questionRank: number;       // Rank being asked about (1-5)
  
  // Quiz Progress
  currentPhase: 1 | 2 | 3;
  phase1Answer: string | null;
  phase2Answer: number | null;
  phase3Answer: number | null;
  phase1Correct: boolean | null;
  phase2Correct: boolean | null;
  phase3Correct: boolean | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  showVisualization: boolean;
}
```

## Animation Specifications

### Phase Transition
- Fade in + slide up for new question
- Duration: 300-400ms
- Use CSS transitions or Framer Motion

### Answer Feedback
- Correct: Scale up slightly + green glow
- Incorrect: Shake animation + red highlight
- Duration: 200ms

### Cooldown Visualization
- Circle fill animation: 2-3 seconds
- Synchronized start for both Rank 1 and Rank 5 circles
- Display numerical countdown inside circles

## Mobile Responsiveness

### Breakpoints
- **Mobile**: < 640px (single column, larger touch targets)
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Considerations
- Minimum touch target: 44x44px
- Stack answer buttons vertically on small screens
- Collapsible tips section to save space
- Bottom-sticky "Next Question" button

## Error Handling

1. **API Errors**: Show retry button, cache previously loaded data
2. **Image Loading**: Use placeholder/fallback images
3. **Empty Data**: Skip champions with invalid spell data

## Performance Optimizations

1. **Lazy Loading**: Load champion details only when needed
2. **Image Preloading**: Preload next random champion's images
3. **Caching**: Store champion list and details in localStorage
4. **Debouncing**: Prevent rapid-fire answer clicks

## GitHub Pages Deployment

### Build Configuration (vite.config.ts)
```typescript
export default defineConfig({
  base: '/lol-cooldown-quiz/',  // Repository name
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})
```

### Deployment Script (package.json)
```json
{
  "scripts": {
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "gh-pages -d dist"
  }
}
```

### GitHub Actions (optional)
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Data Dragon Version Handling

```typescript
async function getLatestVersion(): Promise<string> {
  const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
  const versions = await response.json();
  return versions[0]; // Latest version is first
}
```

## Example Cooldown Ranges by Category

| Cooldown Range | Examples |
|----------------|----------|
| 1-3s | Some resets, very low CD abilities |
| 4-6s | Basic poke abilities, dashes |
| 7-10s | Standard abilities |
| 10-15s | Stronger abilities with moderate CD |
| 16-20s | Long cooldown basic abilities |
| 20-30s | Strong utility abilities |
| 60-90s | Summoner spell-level abilities |
| 80-140s | Ultimate abilities |

## Testing Considerations

1. **Unit Tests**: Cooldown range generation, answer validation
2. **Integration Tests**: API fetching, data transformation
3. **E2E Tests**: Full quiz flow with Playwright/Cypress
4. **Visual Tests**: Responsive layout at different breakpoints

## Future Enhancements (Out of Scope for MVP)

- Score tracking and statistics
- Difficulty modes (only ultimates, only certain roles)
- Champion filtering by role/difficulty
- Streak counter and high scores
- Sound effects and music
- Multiplayer mode
- Spaced repetition learning algorithm

## Legal Notice

This application uses League of Legends assets under Riot Games' API Terms of Service. Include the following disclaimer:

> [App Name] is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.

---

## Quick Start Commands

```bash
# Create project
npm create vite@latest lol-cooldown-quiz -- --template react-ts

# Navigate to project
cd lol-cooldown-quiz

# Install dependencies
npm install
npm install -D tailwindcss postcss autoprefixer
npm install -D gh-pages

# Initialize Tailwind
npx tailwindcss init -p

# Start development server
npm run dev
```