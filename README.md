# Dart Score Manager

A modern web application for managing dart game scores, built with React, TypeScript, and Vite. Features a clean, responsive interface with support for both countdown and high-low game modes.

## Features

- **Multi-player support**: Add 2-8 players with custom names
- **Dual game modes**: 
  - **Countdown**: Traditional 501/301 style games
  - **High-Low Challenge**: Lives-based challenge mode
- **Score validation**: Prevents invalid scores and negative results
- **Quick score buttons**: Fast input for common dart scores
- **Winner detection**: Automatic game completion when a player reaches exactly 0
- **Score history tracking**: Individual player history and consolidated game view
- **Persistent game state**: Automatically saves progress - resume after browser refresh
- **Game management**: Reset current game or start completely new games
- **Responsive design**: Works great on desktop and mobile devices
- **PWA support**: Installable web app with offline capabilities
- **Performance monitoring**: Built-in performance dashboard
- **Accessibility**: Screen reader support and ARIA compliance

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Testing**: Vitest + Playwright (E2E)
- **Styling**: CSS3 with modern features
- **State Management**: React hooks and context
- **PWA**: Service worker and manifest
- **CI/CD**: GitHub Actions with automated deployment

## Getting Started

### Prerequisites

- Node.js 22.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dart-score-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Available Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build for production (local deployment)
- `npm run build:gh-pages` - Build for GitHub Pages deployment
- `npm run preview` - Preview production build locally
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage reporting
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically

## How to Play

### Countdown Mode
1. **Setup**: Enter player names (2-8 players) and select starting score (301, 501, 701, 1001)
2. **Gameplay**: Current player enters their score for each turn
3. **Scoring**: Scores are subtracted from the player's remaining total
4. **Winning**: First player to reach exactly 0 wins the game

### High-Low Challenge Mode
1. **Setup**: Enter player names and set starting lives (default: 5)
2. **Gameplay**: Players take turns throwing darts
3. **Challenges**: Set challenges for other players to beat
4. **Lives**: Players lose lives when they fail challenges
5. **Winning**: Last player with lives remaining wins

### General Features
- **History Tracking**: View individual player history (📊 button) or consolidated game history
- **Game Management**: Use "Reset Game" to restart with same players, or "New Game" to start over
- **Auto-Save**: Game progress is automatically saved - refresh the page to continue where you left off

## Game Rules

- Players must score exactly their remaining points to win (countdown mode)
- Maximum score per turn is 180 (theoretical maximum in darts)
- Scores that would result in negative points are invalid
- Players take turns in the order they were added
- High-low mode uses a lives system with challenge mechanics

## Project Structure

```
src/
├── app/                    # App-level components and contexts
├── components/             # Shared components (PWA install, etc.)
├── features/               # Feature-based modules
│   ├── game/              # Game logic and components
│   ├── player/            # Player management
│   ├── history/           # Score history tracking
│   └── performance/       # Performance monitoring
├── hooks/                  # Custom React hooks
├── shared/                 # Shared utilities and types
├── styles/                 # Global styles
└── utils/                  # Utility functions
```

## Testing

The project includes comprehensive testing:

- **Unit Tests**: React components and utilities with Vitest
- **E2E Tests**: Full user workflows with Playwright
- **Coverage**: Detailed test coverage reporting

Run tests with:
```bash
npm test                    # Unit tests
npm run test:e2e           # End-to-end tests
npm run test:coverage      # Coverage report
```

## CI/CD

The project includes GitHub Actions workflows for:

- **Continuous Integration**: Automated testing on multiple Node.js versions
- **Build Verification**: Ensures the app builds successfully for both local and GitHub Pages
- **Code Quality**: Linting and type checking
- **Deployment**: Automatic deployment to GitHub Pages on main branch

## Deployment

### GitHub Pages
The app is automatically deployed to GitHub Pages via GitHub Actions CI/CD:

1. **Push to main branch** - Triggers automatic build and deployment
2. **Live at**: https://gregoriomelo.github.io/dart-score-manager/

### Local Testing
To test builds locally:
```bash
npm run build          # Local build
npm run build:gh-pages # GitHub Pages build
npx serve build        # Serve locally
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).
