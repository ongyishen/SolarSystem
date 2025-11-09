# 🌌 3D Solar System Web Simulation

An interactive, browser-based 3D simulation of our solar system built with HTML, CSS, jQuery, and Three.js. Explore the planets, moons, and celestial mechanics in real-time or accelerated simulation.

![Solar System Simulation](https://img.shields.io/badge/Three.js-0.158.0-blue.svg)
![jQuery](https://img.shields.io/badge/jQuery-3.7.1-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

### 🌐 Live Demo
👉 [View Website on GitHub Pages](https://ongyishen.github.io/SolarSystem/)


## ✨ Features

### 🪐 Core Simulation
- **All 8 planets** with accurate relative sizes and orbital distances
- **Realistic orbital mechanics** with proper rotation and revolution periods
- **Major moons** including Earth's Moon, Mars' Phobos and Deimos, Jupiter's Galilean moons, and more
- **Saturn's rings** with accurate visual representation
- **Asteroid belt** between Mars and Jupiter with 200-500 animated asteroids
- **Comets** with elliptical orbits (Halley's Comet, Hale-Bopp)
- **Real-time simulation** synchronized with actual UTC time

### 🎮 Interactive Controls
- **Mouse controls**: Rotate view (left-click drag), pan (right-click drag), zoom (scroll)
- **Touch controls**: Full mobile support with swipe and pinch gestures
- **Planet selection**: Click any celestial body to view detailed information
- **Keyboard shortcuts**: Space (play/pause), R (reset camera), H (help), P (performance mode), Ctrl+S (screenshot)

### ⏰ Time Management
- **Adjustable simulation speed**: 0.1x to 500x time acceleration
- **Real-time mode**: Sync simulation with actual Singapore time (UTC+8)
- **Play/Pause control**: Stop and resume the simulation
- **Jump to Now**: Reset simulation to current date and time
- **Date/Time display**: Shows current simulation time in SGT format

### 🎨 Visual Features
- **High-quality textures**: NASA-based planet textures with fallback colors
- **Dynamic lighting**: Realistic sun illumination with multiple light sources
- **Background modes**: Toggle between starfield and grid background
- **Orbital paths**: Visual representation of planetary orbits
- **Planet labels**: Always-visible name tags that face the camera
- **Glow effects**: Sun and planetary atmospheric effects
- **Performance modes**: Optimized rendering for different device capabilities

### 📊 Information Display
- **Planet information panel**: Detailed data for each celestial body including:
  - Size (Earth radii)
  - Orbital distance (AU)
  - Rotation period
  - Revolution period
  - Number of moons
- **Physics accuracy panel**: Shows simulation accuracy metrics
- **Help system**: Comprehensive control guide and feature overview

### 🚀 Performance & Accessibility
- **Responsive design**: Works on desktop, tablet, and mobile devices
- **Performance optimization**: Adaptive quality based on device capabilities
- **Accessibility features**: ARIA labels, keyboard navigation, screen reader support
- **Cross-browser compatibility**: Chrome, Firefox, Safari, Edge support
- **Offline functionality**: Works without internet connection

## 🚀 Quick Start

### Prerequisites
- Modern web browser with WebGL support
- Local HTTP server (recommended for development)

### Installation

1. **Clone or download the project**
   ```bash
   git clone https://github.com/ongyishen/SolarSystem.git

   ```

2. **Start a local server** (using VS Code Live Server recommended)
   - Install Live Server extension in VS Code
   - Right-click `index.html` and select "Open with Live Server"
   - Or use any other local HTTP server

3. **Open in browser**
   - Navigate to `http://localhost:5500` (or your server's address)
   - The simulation will start automatically

### Alternative: Direct File Opening
You can also open `index.html` directly in a browser, but some features may be limited due to browser security policies.

## 🎮 Controls Guide

### Mouse Controls
| Action | Control |
|--------|---------|
| Rotate View | Left Click + Drag |
| Pan View | Right Click + Drag |
| Zoom In/Out | Scroll Wheel |
| Select Planet | Left Click on Planet |

### Keyboard Shortcuts
| Key | Function |
|-----|----------|
| `Space` | Play/Pause simulation |
| `R` | Reset camera position |
| `H` | Toggle help window |
| `P` | Toggle performance mode |
| `Ctrl+S` | Take screenshot |
| `ESC` | Close information panels |

### Touch Controls (Mobile)
| Action | Control |
|--------|---------|
| Rotate View | Single finger swipe |
| Zoom In/Out | Pinch gesture |
| Select Planet | Tap on planet |

### HUD Controls
- **Play/Pause Button**: Start or stop the simulation
- **Speed Slider**: Adjust simulation speed (0.1x - 500x)
- **Real-time Toggle**: Sync with actual time
- **Jump Now**: Reset to current date/time
- **Reset Camera**: Return to default view
- **Grid View Toggle**: Switch between starfield and grid background

## 🏗️ Project Structure

```
SolarSystem/
├── index.html                 # Main HTML structure
├── style.css                  # CSS styling and responsive design
├── main.js                    # Core JavaScript logic and Three.js implementation
├── textures/                  # Planet and celestial body textures
│   ├── 2k_earth_daymap.jpg
│   ├── 2k_jupiter.jpg
│   ├── 2k_mars.jpg
│   ├── 2k_mercury.jpg
│   ├── 2k_moon.jpg
│   ├── 2k_neptune.jpg
│   ├── 2k_saturn.jpg
│   ├── 2k_sun.jpg
│   ├── 2k_uranus.jpg
│   └── 2k_venus_surface.jpg
├── README.md                  # This file
├── 3D_Solar_System_Web_Simulation_PRD.md  # Product Requirements Document
├── PROJECT_TASKS.md           # Development task tracking
├── planetary_data_research.md # Planetary data research
├── physics_analysis.md        # Physics implementation analysis
├── physics_improvement_plan.md # Physics enhancement plans
├── physics_panel_implementation.md # Physics panel documentation
└── planetary_accuracy_improvements.md # Accuracy improvement notes
```

## 🛠️ Technology Stack

### Frontend Technologies
- **HTML5**: Semantic structure and canvas container
- **CSS3**: Responsive design, animations, and UI styling
- **JavaScript (ES6+)**: Core logic and Three.js integration
- **jQuery 3.7.1**: DOM manipulation and event handling

### Graphics & Rendering
- **Three.js 0.158.0**: 3D graphics engine and WebGL wrapper
- **WebGL**: Hardware-accelerated 3D rendering
- **OrbitControls**: Camera navigation and interaction

### Development Tools
- **VS Code**: Recommended development environment
- **Live Server**: Local development server
- **Git**: Version control

## 📊 Technical Specifications

### Performance Requirements
- **Minimum Hardware**:
  - CPU: Dual-core 2GHz
  - RAM: 4GB
  - GPU: Integrated graphics with WebGL support
  - Display: 1024x768 resolution

- **Recommended Hardware**:
  - CPU: Quad-core 3GHz
  - RAM: 8GB
  - GPU: Dedicated graphics card with 2GB VRAM
  - Display: 1920x1080 resolution

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers with WebGL support

### Simulation Accuracy
- **Orbital Periods**: Accurate to within 1% for all planets
- **Relative Sizes**: Scaled for visibility while maintaining proportions
- **Rotation Speeds**: Based on actual planetary rotation periods
- **Moon Systems**: Major moons with accurate orbital relationships

## 🔧 Configuration

### Customization Options

#### Planet Data
Modify the `planetData` array in `main.js` to adjust:
- Planet sizes and colors
- Orbital distances and speeds
- Rotation periods
- Moon counts

```javascript
const planetData = [
    {
        name: 'Mercury',
        radius: 0.383,
        distance: 6,
        rotationSpeed: 0.002,
        orbitSpeed: 0.008,
        color: 0x8C7853,
        // ... additional properties
    },
    // ... other planets
];
```

#### Performance Settings
Adjust performance parameters in `main.js`:
- Asteroid count (`asteroidCount`)
- Render quality settings
- Mobile optimization thresholds

#### Visual Settings
Customize appearance:
- Background colors and starfield density
- Lighting intensity and colors
- Orbit line visibility and colors
- Planet label styling

## 🐛 Troubleshooting

### Common Issues

#### Textures Not Loading
- **Problem**: Planets appear as solid colors instead of textured
- **Solution**: Check that `textures/` folder exists and contains all image files
- **Fallback**: Application automatically uses solid colors if textures fail

#### Performance Issues
- **Problem**: Low frame rate or stuttering
- **Solutions**:
  - Press `P` to enable performance mode
  - Close other browser tabs
  - Reduce simulation speed
  - Check if hardware acceleration is enabled

#### Mobile Touch Issues
- **Problem**: Touch controls not responding
- **Solutions**:
  - Ensure you're using a modern mobile browser
  - Try refreshing the page
  - Check that JavaScript is enabled

#### WebGL Not Supported
- **Problem**: "WebGL not supported" error
- **Solutions**:
  - Update your browser to the latest version
  - Enable hardware acceleration in browser settings
  - Try a different browser

### Debug Mode
Enable console logging by opening browser developer tools (F12) to see:
- Texture loading status
- Performance metrics
- Interaction events
- Error messages

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly across browsers and devices
5. Submit a pull request

### Code Style
- Use ES6+ JavaScript features
- Follow existing naming conventions
- Add comments for complex logic
- Maintain responsive design principles

### Testing
- Test on multiple browsers
- Verify mobile responsiveness
- Check performance on different devices
- Ensure accessibility features work

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA** for planetary textures and astronomical data
- **Three.js** team for the excellent 3D graphics library
- **jQuery** for DOM manipulation utilities
- **Astronomical data sources** for accurate orbital parameters

## 📞 Support

For questions, issues, or suggestions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the documentation files in the project

---

**Enjoy exploring our solar system! 🚀✨**
