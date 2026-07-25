# Logic Games for Mobile

A polished Android and iOS logic-game collection built with Expo, React Native,
and TypeScript. The app currently includes:

- **Queens** - place one queen in every row, column, and colored region.
- **Tango** - balance suns and moons while satisfying sequence and relationship
  clues.

The home screen is designed to support more games without changing either
game's internal architecture. Each game owns its API client, rule engine, state,
controls, and instructions while sharing the responsive navigation, stat bar,
size picker, and accessibility conventions.

## Queens

### Rules

Place exactly one queen in every row, column, and colored region. Queens may not
touch one another, including diagonally.

### Controls

| Gesture or action | Result |
| --- | --- |
| Tap an empty cell | Place a queen |
| Tap a queen | Replace it with an X |
| Tap an X | Clear the cell |
| Drag across cells | Mark or erase multiple Xs |
| Patterns | Add non-color region cues |
| Retry | Clear the board without restarting the timer |
| Solution | Reveal the answer and invalidate the timed attempt |
| Auto X | Mark cells forbidden by placed queens |
| New game | Generate a fresh board and restart the timer |

## Tango

### Rules

For an even `N x N` board:

1. Fill every cell with either a sun or a moon.
2. Every row and column must contain `N / 2` of each symbol.
3. Three matching symbols may not appear consecutively in a row or column.
4. Cells joined by `=` must contain the same symbol.
5. Cells joined by `x` must contain opposite symbols.

### Controls

| Action | Result |
| --- | --- |
| Tap an empty cell | Place a sun |
| Tap a sun | Replace it with a moon |
| Tap a moon | Clear the cell |
| Undo | Restore the previous move |
| Retry | Clear player entries without restarting the timer |
| Hint | Reveal one cell and invalidate the timed attempt |
| Solution | Reveal the answer and invalidate the timed attempt |
| New game | Generate a fresh board and restart the timer |

## UX and accessibility

- Responsive layouts for phones, tablets, portrait, and landscape.
- The game board remains physically centered in landscape orientation.
- Colorblind-friendly Queens palette with optional texture patterns.
- Distinct sun and moon shapes in Tango, so play never relies on color alone.
- Clear striped conflict cells with an optional explanation popup.
- Board-level loading, error, conflict, and win feedback that does not shift the
  layout.
- Best times stored locally for each game and board size.
- Haptic feedback for moves, warnings, and successful solves.
- Screen-reader labels and native accessibility roles on interactive controls.

## Technology

- Expo SDK 57
- React Native 0.86
- TypeScript
- Expo Router
- Expo Haptics
- AsyncStorage
- Lucide React Native

## Getting started

Requirements:

- Node.js 20 or newer
- npm
- Python 3.11 or newer for the local Tango API
- Expo Go on a device, or an Android/iOS simulator

Install the mobile dependencies:

```bash
npm install
```

Start the local Tango API in a separate terminal:

```bash
cd ../TangoAPI
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

Start the app:

```bash
npm start
```

Scan the QR code with Expo Go, or launch a simulator:

```bash
npm run android
npm run ios
```

The iOS simulator requires macOS. Physical iOS devices can use Expo Go during
development.

## API configuration

Queens uses the deployed API by default:

```text
https://api.arturops.com/queens
```

Tango intentionally uses a local API:

```text
Android emulator: http://10.0.2.2:8000/tango
iOS simulator:     http://127.0.0.1:8000/tango
```

Override either endpoint in `.env.local`:

```dotenv
EXPO_PUBLIC_QUEENS_API_URL=http://192.168.1.10:8000/queens
EXPO_PUBLIC_TANGO_API_URL=http://192.168.1.10:8000/tango
```

Use the computer's LAN address for a physical device. The phone and development
machine must be on the same network, and the API must listen on an interface the
phone can reach.

The Queens endpoint accepts `board_size` and `solution`. The Tango endpoint
accepts the same parameters and returns `board_size`, `board`, `constraints`,
and `solution`. Both clients validate their responses before a puzzle enters
game state.

## Project structure

```text
src/
  app/          Expo Router screens for the menu and games
  components/   Shared and game-specific native interface components
  constants/    Visual design tokens
  hooks/        Game state, timers, persistence, and haptics
  lib/          API clients and pure rule engines
  types/        Shared TypeScript contracts
tests/          Rule-engine tests
```

## Quality checks

```bash
npm run check
npx expo-doctor
npx expo export --platform all
```

`npm run check` runs ESLint, strict TypeScript checking, and both rule-engine
test suites. This repository contains source code only; no store submission or
hosted deployment is configured.

## License

[MIT](LICENSE)
