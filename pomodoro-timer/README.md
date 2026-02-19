# 🍅 Neumorphic Glass Pomodoro Timer

A beautiful, fully-functional Pomodoro timer with a dark glass-neumorphic design. Built with vanilla HTML, CSS, and JavaScript — no dependencies, no build step.

## Features

- **Dark glass-neumorphic UI** — deep shadows, frosted glass panels, glowing accents
- **Three modes** — Focus (25 min), Short Break (5 min), Long Break (15 min)
- **Animated SVG progress ring** — smooth arc tracks time with a glow effect
- **Color-coded modes** — coral red / teal / purple accent theming
- **Session dot tracker** — 4-dot indicator cycles per Pomodoro round
- **Task input** — pin what you're working on
- **Customizable durations** — adjust timers via settings panel
- **Auto-start breaks** — optional chained sessions
- **Sound alerts** — 3-note chime via Web Audio API
- **Settings persistence** — saved to localStorage
- **Keyboard shortcuts** — Space, R, 1/2/3

## Keyboard Shortcuts

| Key     | Action               |
|---------|----------------------|
| `Space` | Start / Pause        |
| `R`     | Reset current timer  |
| `1`     | Switch to Focus mode |
| `2`     | Switch to Short Break|
| `3`     | Switch to Long Break |

## Getting Started

No installation needed — just open `index.html` in any modern browser:

```bash
git clone https://github.com/YOUR_USERNAME/pomodoro-timer.git
cd pomodoro-timer
open index.html
```

## File Structure

```
pomodoro-timer/
├── index.html   # Markup & structure
├── style.css    # Glass-neumorphic design system
├── app.js       # Timer logic & state management
└── README.md
```

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). Requires support for `backdrop-filter` for full glass effect.

## License

MIT — free to use, modify, and distribute.
