# StatsBomb 3D Arena ⚽

A high-performance 3D football event visualizer and tactical analyzer powered by **StatsBomb Open Data**, **Three.js**, **React 19**, **TypeScript**, and **Tailwind CSS**.

---

## 🌟 Key Features & Graphics Enhancements

### 🏟️ Photorealistic & Broadcast Stadium Environment
- **High-Definition Turf**: Procedural striped mowing pattern with micro-fiber grass blade grain and contact roughness.
- **Accurate Pitch Markings**: Regulation touchlines, penalty boxes, 6-yard boxes, penalty arcs ('D'), center circle, and corner arcs.
- **3D Goals & Net Mesh**: Metal posts, support stanchions, and depth-enabled hexagonal net mesh.
- **Surroundings**: Animated LED perimeter advertising boards, team dugouts/benches, corner flags, and 4 stadium floodlight towers.
- **Day & Night Themes**: Toggle between crisp sunny daylight and atmospheric night stadium floodlight mode.

### 🏃 Dynamic Players & 2 Visualization Modes
- **Broadcast 3D Figures**: Stylized 3D football player figures with team kit colors (home/away), shorts, socks, boots, dynamic facing orientation, and floating name/number badges.
- **Tactical Hologram Pucks**: Futuristic glowing cylindrical pedestals with team illumination rings, number badges, and tactical vision cones.

### ⚽ Physics & Trajectory
- **Authentic Match Ball**: 32-panel soccer ball texture with angular spin physics aligned to flight direction.
- **Dynamic Arc Trajectories**: Fading parabolic flight arcs (cyan for passes, gold/amber for shots) with dynamic ground contact shadows.

### 🎥 Broadcast & Tactical Camera Modes
- **Broadcast TV Cam**: Elevated sideline camera that smoothly tracks play progression and ball position.
- **Tactical (2D Top-Down)**: High-altitude pitch view for shape and formation analysis.
- **Ball Follow Cam**: Dynamic third-person chase camera closely tracking the ball.
- **Behind the Goal**: Endline view behind the net for shot perspectives.
- **Free Orbit Cam**: Full interactive 3D rotation and zoom.

### 📊 Tactical Radar & HUD
- **Minimap Radar**: Real-time 2D pitch radar overlay displaying all 22 player positions and the ball.
- **Broadcast Scoreboard**: Live match time, period (1H/2H), team colors, and event ticker.
- **Interactive Scrubber**: Timeline seek bar with markers for goals, shots, fouls, and substitutions.
- **Goal Celebrations**: Screen-wide broadcast goal alert with camera shake and celebratory confetti!
- **Match Browser**: Curated legendary matches (e.g., FIFA World Cup 2022 Final: Argentina vs France, UCL 2015 Final: Juventus vs Barcelona), random match generator, and custom URL loader.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Dev Server**: Vite 8
- **3D Engine**: Three.js (r186)
- **Styling**: Tailwind CSS v4
- **Icons & FX**: Lucide React + Canvas Confetti
- **Server**: Express (ES Modules)

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18 (Node 26+ tested)
- npm

### Development Mode (with instant HMR)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Server
```bash
# Build optimized production bundle
npm run build

# Start Express server (serves the dist build)
npm start
```
The server will start at [http://localhost:3003](http://localhost:3003).