# Queens for Mobile

A native Android and iOS version of the Queens logic game, built with Expo and
React Native. It uses the public
[Queens API](https://api.arturops.com/queens) to generate uniquely solvable
puzzles from 4 × 4 through 10 × 10.

The project is intentionally board-first: game state stays visible, controls sit
within thumb reach, feedback appears over the board, and the rules stay out of
the way until requested.

## Game rules

Place exactly one queen in every:

- row;
- column;
- colored region.

Queens may not touch one another, including diagonally. A valid solution has
exactly as many queens as the width of the board.

## Controls

| Gesture or action | Result |
| --- | --- |
| Tap a cell | Place or remove a queen |
| Long-press a cell | Place or remove an X |
| Long-press, then drag | Mark or erase multiple Xs |
| Patterns | Add non-color region cues |
| Retry | Clear the board without restarting the timer |
| Solution | Reveal the answer and invalidate the timed attempt |
| Auto X | Mark cells forbidden by placed queens |
| New game | Generate a fresh board and restart the timer |

Best times are stored locally per board size. Revealing the solution pauses the
timer and does not update the record.

## UX and accessibility

- Colorblind-friendly region palette with optional texture patterns.
- Thin, subdued X marks kept visually distinct from red conflict stripes.
- Haptic feedback for moves, warnings, and successful solves.
- Responsive board sizing for phones and tablets.
- Screen-reader labels and native accessibility roles on interactive controls.
- Board-level loading, error, conflict, and win feedback that does not shift the
  surrounding layout.

## Technology

- Expo SDK 57
- React Native and TypeScript
- Expo Router
- Expo Haptics
- AsyncStorage
- Lucide React Native

## Getting started

Requirements:

- Node.js 20 or newer
- npm
- Expo Go on a device, or an Android/iOS simulator

Install and start the development server:

```bash
npm install
npm start
```

Then scan the QR code with Expo Go, or use:

```bash
npm run android
npm run ios
```

The iOS simulator requires macOS. Physical iOS devices can use Expo Go during
development.

## Configuration

The production API is used by default:

```text
https://api.arturops.com/queens
```

To point the app at another compatible backend, create `.env.local`:

```dotenv
EXPO_PUBLIC_QUEENS_API_URL=http://192.168.1.10:8000/queens
```

The endpoint must accept `board_size` and `solution` query parameters and return:

```json
{
  "board": [[0, 0], [1, 1]],
  "solution": [[0, 0], [1, 1]]
}
```

The app validates both matrices before a puzzle enters game state.

## Project structure

```text
src/
  app/          Expo Router entry points
  components/   Native game and interface components
  constants/    Visual design tokens
  hooks/        Game state, timer, persistence, and haptics
  lib/          API client and pure rule engine
  types/        Shared TypeScript contracts
tests/          Rule engine tests
```

## Quality checks

```bash
npm run check
npx expo-doctor
npx expo export --platform all
```

`npm run check` runs ESLint, strict TypeScript checking, and the rule-engine
tests. This repository contains source code only; no store submission or hosted
deployment is configured.

## License

[MIT](LICENSE)
