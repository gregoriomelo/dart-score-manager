# Dart Score Manager

A modern web application for managing dart game scores, built with React and TypeScript. Keep track of multiple players, countdown from customizable starting scores, and enjoy a clean, responsive interface.

## Features

- **Multi-player support**: Add 2-8 players with custom names
- **Customizable starting scores**: Choose from 301, 501, 701, or 1001
- **Score validation**: Prevents invalid scores and negative results
- **Quick score buttons**: Fast input for common dart scores
- **Winner detection**: Automatic game completion when a player reaches exactly 0
- **Score history tracking**: Individual player history and consolidated game view with detailed progression
- **Persistent game state**: Automatically saves progress - resume after browser refresh
- **Game management**: Reset current game or start completely new games
- **Responsive design**: Works great on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with visual feedback

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
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

### Running with Docker

If you prefer to use Docker, you can run the application in a containerized environment:

1. Make sure you have Docker and Docker Compose installed
2. Build and start the container:
```bash
docker-compose up --build
```

3. The app will be available at [http://localhost:3000](http://localhost:3000)

The Docker setup includes:
- Live code reloading during development
- Automatic dependency installation
- Isolated environment that works consistently across different systems

To stop the container:
```bash
docker-compose down
```

## Available Scripts

### `npm start`
Runs the app in development mode with hot reloading.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.

### `npm run test:coverage`
Runs tests with coverage reporting.

## How to Play

1. **Setup**: Enter player names (2-8 players) and select starting score
2. **Gameplay**: Current player enters their score for each turn
3. **Scoring**: Scores are subtracted from the player's remaining total
4. **History Tracking**: View individual player history (📊 button) or consolidated game history ("📊 All History")
5. **Winning**: First player to reach exactly 0 wins the game
6. **Game Management**: Use "Reset Game" to restart with same players, or "New Game" to start over
7. **Auto-Save**: Game progress is automatically saved - refresh the page to continue where you left off

## Game Rules

- Players must score exactly their remaining points to win
- Maximum score per turn is 180 (theoretical maximum in darts)
- Scores that would result in negative points are invalid
- Players take turns in the order they were added

## Testing

The project includes comprehensive tests for:

- **Game Logic**: Core scoring and game state management
- **Components**: UI rendering and user interactions  
- **Hooks**: Custom React hooks functionality

Run tests with:
```bash
npm test
```

Generate coverage report:
```bash
npm test -- --coverage --watchAll=false
```

## CI/CD

The project includes GitHub Actions workflows for:

- **Continuous Integration**: Automated testing on multiple Node.js versions
- **Build Verification**: Ensures the app builds successfully
- **Code Coverage**: Tracks test coverage metrics
- **Deployment**: Automatic deployment to GitHub Pages on main branch

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: CSS3 with modern features
- **Testing**: Jest and React Testing Library
- **Build Tool**: Create React App
- **CI/CD**: GitHub Actions


## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).
