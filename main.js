// Import Three.js and OrbitControls as ES modules
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Global variables
let scene, camera, renderer, controls;
let planets = [];
let moons = [];
let sun;
let clock;
let isPaused = false;
let speedMultiplier = 0.1;
let isRealtime = false;
let simulationTime = new Date();
let raycaster;
let mouse;
let selectedPlanet = null;
let asteroidBelt = [];
let comets = [];
let performanceMode = false;
let isMobile = false;
let planetLabels = [];
let currentBackground = 'grid'; // 'stars' or 'grid'
let starField = null;
let gridBackground = null;

// Planet data (scaled for visualization with accurate ratios)
const planetData = [
    {
        name: 'Mercury',
        radius: 0.383,
        distance: 6, // Scaled from 0.387 AU
        rotationSpeed: 0.002, // Based on 58.65 day rotation period
        orbitSpeed: 0.008, // Based on 87.97 day orbital period
        color: 0x8C7853,
        rotationPeriod: '58.6 days',
        revolutionPeriod: '88 days',
        moons: 0,
        textureUrl: 'textures/2k_mercury.jpg',
        actualDistance: 0.387,
        actualOrbitalPeriod: 87.97,
        actualRotationPeriod: 58.65
    },
    {
        name: 'Venus',
        radius: 0.949,
        distance: 9, // Scaled from 0.723 AU
        rotationSpeed: -0.0005, // Retrograde rotation, 243.02 days
        orbitSpeed: 0.003, // Based on 224.70 day orbital period
        color: 0xFFC649,
        rotationPeriod: '243 days',
        revolutionPeriod: '225 days',
        moons: 0,
        textureUrl: 'textures/2k_venus_surface.jpg',
        actualDistance: 0.723,
        actualOrbitalPeriod: 224.70,
        actualRotationPeriod: 243.02
    },
    {
        name: 'Earth',
        radius: 1,
        distance: 12, // Reference point (1 AU scaled to 12 units)
        rotationSpeed: 0.1, // Based on 24 hour rotation period
        orbitSpeed: 0.002, // Based on 365.26 day orbital period
        color: 0x2E7FFF,
        rotationPeriod: '24 hours',
        revolutionPeriod: '365.25 days',
        moons: 1,
        textureUrl: 'textures/2k_earth_daymap.jpg',
        actualDistance: 1.000,
        actualOrbitalPeriod: 365.26,
        actualRotationPeriod: 0.997 // days
    },
    {
        name: 'Mars',
        radius: 0.532,
        distance: 18, // Scaled from 1.524 AU
        rotationSpeed: 0.097, // Based on 24.6229 hour rotation period
        orbitSpeed: 0.001, // Based on 686.98 day orbital period
        color: 0xCD5C5C,
        rotationPeriod: '24.6 hours',
        revolutionPeriod: '687 days',
        moons: 2,
        textureUrl: 'textures/2k_mars.jpg',
        actualDistance: 1.524,
        actualOrbitalPeriod: 686.98,
        actualRotationPeriod: 1.026 // days
    },
    {
        name: 'Jupiter',
        radius: 2.5,
        distance: 28, // Scaled from 5.203 AU
        rotationSpeed: 0.24, // Based on 9.925 hour rotation period
        orbitSpeed: 0.00017, // Based on 4,332.59 day orbital period
        color: 0xDAA520,
        rotationPeriod: '9.9 hours',
        revolutionPeriod: '11.9 years',
        moons: 79,
        textureUrl: 'textures/2k_jupiter.jpg',
        actualDistance: 5.203,
        actualOrbitalPeriod: 4332.59,
        actualRotationPeriod: 0.414 // days
    },
    {
        name: 'Saturn',
        radius: 2.0,
        distance: 38, // Scaled from 9.537 AU
        rotationSpeed: 0.22, // Based on 10.656 hour rotation period
        orbitSpeed: 0.000068, // Based on 10,759.22 day orbital period
        color: 0xF4E99B,
        rotationPeriod: '10.7 hours',
        revolutionPeriod: '29.5 years',
        moons: 82,
        hasRings: true,
        textureUrl: 'textures/2k_saturn.jpg',
        actualDistance: 9.537,
        actualOrbitalPeriod: 10759.22,
        actualRotationPeriod: 0.444 // days
    },
    {
        name: 'Uranus',
        radius: 1.5,
        distance: 48, // Scaled from 19.191 AU
        rotationSpeed: 0.14, // Based on 17.24 hour rotation period
        orbitSpeed: 0.000024, // Based on 30,685.4 day orbital period
        color: 0x4FD0E0,
        rotationPeriod: '17.2 hours',
        revolutionPeriod: '84 years',
        moons: 27,
        textureUrl: 'textures/2k_uranus.jpg',
        actualDistance: 19.191,
        actualOrbitalPeriod: 30685.4,
        actualRotationPeriod: 0.718 // days
    },
    {
        name: 'Neptune',
        radius: 1.5,
        distance: 58, // Scaled from 30.069 AU
        rotationSpeed: 0.15, // Based on 16.11 hour rotation period
        orbitSpeed: 0.000012, // Based on 60,189 day orbital period
        color: 0x4169E1,
        rotationPeriod: '16.1 hours',
        revolutionPeriod: '165 years',
        moons: 14,
        textureUrl: 'textures/2k_neptune.jpg',
        actualDistance: 30.069,
        actualOrbitalPeriod: 60189,
        actualRotationPeriod: 0.671 // days
    }
];

// Detect mobile device and adjust settings
function detectMobile() {
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    performanceMode = isMobile || window.innerWidth < 768;
    
    if (performanceMode) {
        // Reduce quality for mobile/low-performance devices
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
        renderer.shadowMap.enabled = false;
    }
}

// Performance optimization - toggle quality
function togglePerformance() {
    performanceMode = !performanceMode;
    
    if (performanceMode) {
        // Reduce asteroid count
        asteroidBelt.forEach(asteroid => {
            scene.remove(asteroid);
        });
        asteroidBelt = [];
        createAsteroidBelt();
        
        // Reduce render quality
        renderer.setPixelRatio(1);
    } else {
        // Increase quality
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Recreate asteroid belt with more asteroids
        asteroidBelt.forEach(asteroid => {
            scene.remove(asteroid);
        });
        asteroidBelt = [];
        createAsteroidBelt();
    }
}

// Initialize the scene
function init() {
    // Initialize THREE objects
    clock = new THREE.Clock();
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Detect device capabilities
    detectMobile();
    
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(20, 20, 40);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('container').appendChild(renderer.domElement);
    
    // Add orbit controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 200;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.0;
    
    // Add lighting - significantly increased brightness
    const ambientLight = new THREE.AmbientLight(0xcccccc, 2.0);
    scene.add(ambientLight);
    
    // Add point light from the sun - much higher intensity
    const sunLight = new THREE.PointLight(0xffffff, 8, 300);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
    
    // Add additional directional lights for better illumination
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight1.position.set(10, 10, 5);
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight2.position.set(-10, 5, -10);
    scene.add(directionalLight2);
    
    // Add hemisphere light for more natural lighting
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x4444ff, 0.5);
    scene.add(hemisphereLight);
    
    // Create background based on default setting
    if (currentBackground === 'grid') {
        createGridBackground();
        scene.background = new THREE.Color(0xffffff);
    } else {
        createStarfield();
    }
    
    // Create the sun
    createSun();
    
    // Create planets
    createPlanets();
    
    // Create orbit lines
    createOrbitLines();
    
    // Create asteroid belt
    createAsteroidBelt();
    
    // Create comets
    createComets();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up help modal
    setupHelpModal();
    
    // Add accessibility features
    setupAccessibility();
    
    // Hide loading screen
    $('#loadingScreen').addClass('hidden');
    
    // Start animation loop
    animate();
}

// Create starfield background
function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        transparent: true,
        opacity: 0.8
    });
    
    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
}

// Create white grid background
function createGridBackground() {
    // Create a large white plane as the background
    const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
    const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide
    });
    const backgroundPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    backgroundPlane.position.z = -500;
    scene.add(backgroundPlane);

    // Create grid helper
    const gridHelper = new THREE.GridHelper(1000, 100, 0x888888, 0xcccccc);
    gridHelper.position.y = -50; // Position grid below the solar system plane
    scene.add(gridHelper);

    // Store reference to the grid background
    gridBackground = {
        plane: backgroundPlane,
        grid: gridHelper
    };
}

// Toggle between starfield and grid background
function toggleBackground() {
    const isGridMode = $('#backgroundToggle').prop('checked');
    
    if (isGridMode && currentBackground === 'stars') {
        // Switch to grid background
        if (starField) {
            scene.remove(starField);
        }
        if (!gridBackground) {
            createGridBackground();
        }
        currentBackground = 'grid';
        
        // Change scene background color to white
        scene.background = new THREE.Color(0xffffff);
        
        // Adjust orbit line colors for better visibility on white background
        scene.traverse((child) => {
            if (child.isLine && child.material.color.getHex() === 0x444444) {
                child.material.color.setHex(0x333333);
                child.material.opacity = 0.8;
            }
        });
        
    } else if (!isGridMode && currentBackground === 'grid') {
        // Switch back to starfield background
        if (gridBackground) {
            scene.remove(gridBackground.plane);
            scene.remove(gridBackground.grid);
            gridBackground = null;
        }
        if (!starField) {
            createStarfield();
        }
        currentBackground = 'stars';
        
        // Change scene background color back to black
        scene.background = new THREE.Color(0x000000);
        
        // Restore original orbit line colors
        scene.traverse((child) => {
            if (child.isLine && child.material.color.getHex() === 0x333333) {
                child.material.color.setHex(0x444444);
                child.material.opacity = 0.3;
            }
        });
    }
}

// Create the sun
function createSun() {
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    
    // Create sun material with fallback color
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00
    });
    
    // Load texture from local file
    const textureLoader = new THREE.TextureLoader();
    
    const sunTexture = textureLoader.load(
        'textures/2k_sun.jpg',
        // onLoad
        function(texture) {
            sunMaterial.map = texture;
            sunMaterial.needsUpdate = true;
            console.log('Sun texture loaded successfully');
        },
        // onProgress
        undefined,
        // onError
        function() {
            console.log('Sun texture failed to load, using color fallback');
        }
    );
    
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
    
    // Add glow effect to the sun
    const glowGeometry = new THREE.SphereGeometry(3.5, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.3
    });
    const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    sun.add(sunGlow);
    
    // Add sun label
    const sunLabel = createTextSprite('Sun', '#ffff00', 1.0);
    sunLabel.position.set(0, 5, 0);
    sun.add(sunLabel);
}

// Create text sprite for planet labels
function createTextSprite(text, color = '#ffffff', size = 1) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = 'Bold 24px Arial';
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        opacity: 0.9
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(size * 4, size, 1);
    
    return sprite;
}

// Create planets
function createPlanets() {
    planetData.forEach((data, index) => {
        // Create planet mesh
        const planetGeometry = new THREE.SphereGeometry(data.radius, 32, 32);
        
        // Load texture for planet
        const textureLoader = new THREE.TextureLoader();
        let planetMaterial;
        
        // Start with color-based material
        planetMaterial = new THREE.MeshPhongMaterial({
            color: data.color,
            shininess: 30,
            emissive: data.color,
            emissiveIntensity: 0.1
        });
        
        // Load texture
        if (data.textureUrl) {
            const texture = textureLoader.load(
                data.textureUrl,
                // onLoad
                function(texture) {
                    planetMaterial.map = texture;
                    planetMaterial.needsUpdate = true;
                    console.log(`${data.name} texture loaded successfully`);
                },
                // onProgress
                undefined,
                // onError
                function() {
                    console.log(`${data.name} texture failed to load, using color fallback`);
                }
            );
        }
        
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        planet.position.set(0, 0, 0); // Position at origin within the group
        planet.userData = data;
        
        // Create planet group for rotation and orbit
        const planetGroup = new THREE.Group();
        planetGroup.add(planet);
        
        // Add Saturn's rings if applicable
        if (data.hasRings) {
            const ringGeometry = new THREE.RingGeometry(data.radius * 1.5, data.radius * 2.5, 64);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0xD2B48C,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7
            });
            const rings = new THREE.Mesh(ringGeometry, ringMaterial);
            rings.rotation.x = Math.PI / 2;
            planet.add(rings);
        }
        
        scene.add(planetGroup);
        
        // Create and add planet label
        const label = createTextSprite(data.name, '#ffffff', 0.8);
        label.position.set(0, data.radius + 2, 0);
        planetGroup.add(label);
        
        // Store planet data
        planets.push({
            group: planetGroup,
            mesh: planet,
            data: data,
            angle: Math.random() * Math.PI * 2,
            label: label
        });
        
        // Create moons if applicable
        if (data.moons > 0) {
            createMoons(planet, data.moons);
        }
    });
}

// Create moons for a planet
function createMoons(planet, moonCount) {
    const planetMoons = [];
    
    // Limit moon count for performance
    const actualMoonCount = Math.min(moonCount, 5);
    
    for (let i = 0; i < actualMoonCount; i++) {
        const moonRadius = 0.1 + Math.random() * 0.2;
        const moonDistance = planet.userData.radius + 0.5 + i * 0.3;
        
        const moonGeometry = new THREE.SphereGeometry(moonRadius, 16, 16);
        
        // Create moon material with texture for Earth's moon
        const textureLoader = new THREE.TextureLoader();
        let moonMaterial;
        
        // Check if this is Earth's moon (first moon of Earth)
        if (planet.userData.name === 'Earth' && i === 0) {
            moonMaterial = new THREE.MeshPhongMaterial({
                color: 0xcccccc,
                shininess: 5
            });
            
            // Load moon texture
            const moonTexture = textureLoader.load(
                'textures/2k_moon.jpg',
                // onLoad
                function(texture) {
                    moonMaterial.map = texture;
                    moonMaterial.needsUpdate = true;
                    console.log('Moon texture loaded successfully');
                },
                // onProgress
                undefined,
                // onError
                function() {
                    console.log('Moon texture failed to load, using color fallback');
                }
            );
        } else {
            // Use gray material for other moons
            moonMaterial = new THREE.MeshPhongMaterial({
                color: 0xcccccc,
                shininess: 5
            });
        }
        
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.x = moonDistance;
        
        const moonGroup = new THREE.Group();
        moonGroup.add(moon);
        planet.add(moonGroup);
        
        planetMoons.push({
            group: moonGroup,
            mesh: moon,
            distance: moonDistance,
            angle: Math.random() * Math.PI * 2,
            orbitSpeed: 0.01 + Math.random() * 0.02
        });
    }
    
    moons.push(planetMoons);
}

// Create orbit lines
function createOrbitLines() {
    planetData.forEach(data => {
        const orbitGeometry = new THREE.BufferGeometry();
        // Use darker colors for grid background by default
        const orbitMaterial = new THREE.LineBasicMaterial({
            color: currentBackground === 'grid' ? 0x333333 : 0x444444,
            transparent: true,
            opacity: currentBackground === 'grid' ? 0.8 : 0.3
        });
        
        const orbitPoints = [];
        for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            const x = Math.cos(angle) * data.distance;
            const z = Math.sin(angle) * data.distance;
            orbitPoints.push(new THREE.Vector3(x, 0, z));
        }
        
        orbitGeometry.setFromPoints(orbitPoints);
        const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        scene.add(orbitLine);
    });
}

// Create asteroid belt between Mars and Jupiter
function createAsteroidBelt() {
    const asteroidCount = performanceMode ? 200 : 500;
    const innerRadius = 22; // Between Mars (18) and Jupiter (28)
    const outerRadius = 26;
    
    for (let i = 0; i < asteroidCount; i++) {
        const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 0.5; // Small vertical variation
        
        const asteroidGeometry = new THREE.SphereGeometry(0.02 + Math.random() * 0.08, 8, 8);
        const asteroidMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B7355,
            shininess: 1
        });
        
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        asteroid.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
        
        asteroid.userData = {
            radius: radius,
            angle: angle,
            orbitSpeed: 0.0001 + Math.random() * 0.0002,
            rotationSpeed: Math.random() * 0.01
        };
        
        scene.add(asteroid);
        asteroidBelt.push(asteroid);
    }
}

// Create comets with elliptical orbits
function createComets() {
    const cometData = [
        { name: 'Halley', perihelion: 8, aphelion: 80, period: 75, color: 0x87CEEB },
        { name: 'Hale-Bopp', perihelion: 10, aphelion: 100, period: 100, color: 0xADD8E6 }
    ];
    
    cometData.forEach(data => {
        const cometGroup = new THREE.Group();
        
        // Create comet head
        const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const headMaterial = new THREE.MeshPhongMaterial({
            color: data.color,
            emissive: data.color,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.8
        });
        
        const cometHead = new THREE.Mesh(headGeometry, headMaterial);
        cometGroup.add(cometHead);
        
        // Create comet tail
        const tailGeometry = new THREE.ConeGeometry(0.1, 3, 8);
        const tailMaterial = new THREE.MeshBasicMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.3
        });
        
        const cometTail = new THREE.Mesh(tailGeometry, tailMaterial);
        cometTail.position.z = 1.5;
        cometTail.rotation.x = Math.PI / 2;
        cometGroup.add(cometTail);
        
        scene.add(cometGroup);
        
        comets.push({
            group: cometGroup,
            head: cometHead,
            tail: cometTail,
            data: data,
            angle: Math.random() * Math.PI * 2,
            semiMajorAxis: (data.perihelion + data.aphelion) / 2,
            semiMinorAxis: Math.sqrt(data.perihelion * data.aphelion),
            period: data.period
        });
    });
}

// Set up event listeners
function setupEventListeners() {
    // Window resize
    window.addEventListener('resize', onWindowResize);
    
    // Mouse click for planet selection
    window.addEventListener('click', onMouseClick);
    
    // HUD controls
    $('#playPauseBtn').click(togglePlayPause);
    $('#speedSlider').on('input', updateSpeed);
    $('#realtimeToggle').change(toggleRealtime);
    $('#jumpNowBtn').click(jumpToNow);
    $('#resetCameraBtn').click(resetCamera);
    $('#closePanelBtn').click(closePlanetPanel);
    $('#backgroundToggle').change(toggleBackground);
    
    // Physics panel controls
    $('#togglePhysicsBtn').click(togglePhysicsPanel);
    
    // Keyboard controls
    document.addEventListener('keydown', onKeyDown);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle mouse click for planet selection
function onMouseClick(event) {
    // Prevent clicks on UI elements from triggering planet selection
    if (event.target.closest('#hud') || event.target.closest('#planetPanel') || event.target.closest('#legend') || event.target.closest('#help-modal')) {
        return;
    }
    
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Calculate objects intersecting the picking ray
    const planetMeshes = planets.map(p => p.mesh);
    const intersects = raycaster.intersectObjects(planetMeshes);
    
    console.log('Click detected, checking for planet intersections...', intersects.length);
    
    if (intersects.length > 0) {
        const selectedMesh = intersects[0].object;
        const planet = planets.find(p => p.mesh === selectedMesh);
        
        console.log('Planet clicked:', planet ? planet.data.name : 'Unknown');
        
        if (planet) {
            showPlanetInfo(planet);
        }
    }
}

// Show planet information panel
function showPlanetInfo(planet) {
    selectedPlanet = planet;
    
    $('#planetName').text(planet.data.name);
    $('#planetSize').text(planet.data.radius.toFixed(2) + ' Earth radii');
    $('#planetOrbit').text(planet.data.actualDistance + ' AU');
    $('#planetRotation').text(planet.data.rotationPeriod);
    $('#planetRevolution').text(planet.data.revolutionPeriod);
    $('#planetMoons').text(planet.data.moons);
    
    $('#planetPanel').removeClass('hidden');
}

// Close planet information panel
function closePlanetPanel() {
    $('#planetPanel').addClass('hidden');
    selectedPlanet = null;
}

// Toggle play/pause
function togglePlayPause() {
    isPaused = !isPaused;
    $('#playPauseBtn').text(isPaused ? '▶️ Play' : '⏸️ Pause');
}

// Update simulation speed
function updateSpeed() {
    speedMultiplier = parseFloat($('#speedSlider').val());
    $('#speedValue').text(speedMultiplier.toFixed(1) + 'x');
}

// Toggle real-time mode
function toggleRealtime() {
    isRealtime = $('#realtimeToggle').prop('checked');
    
    if (isRealtime) {
        simulationTime = new Date();
        $('#speedSlider').prop('disabled', true);
    } else {
        $('#speedSlider').prop('disabled', false);
    }
}

// Jump to current time
function jumpToNow() {
    simulationTime = new Date();
}

// Reset camera position
function resetCamera() {
    camera.position.set(20, 20, 40);
    camera.lookAt(0, 0, 0);
    controls.reset();
}

// Screenshot functionality
function takeScreenshot() {
    renderer.render(scene, camera);
    const dataURL = renderer.domElement.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.download = `solar-system-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
}

// Enhanced visual effects - planet glows
function addPlanetGlow(planet, color) {
    const glowGeometry = new THREE.SphereGeometry(planet.userData.radius * 1.2, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    planet.add(glow);
}

// Help modal functionality
function toggleHelp() {
    const helpModal = $('#help-modal');
    const modalOverlay = $('#modal-overlay');
    
    if (helpModal.is(':visible')) {
        helpModal.hide();
        modalOverlay.hide();
    } else {
        helpModal.show();
        modalOverlay.show();
    }
}

// Initialize help modal event listeners
function setupHelpModal() {
    $('#modal-overlay, #help-modal .close-btn').click(function() {
        $('#help-modal').hide();
        $('#modal-overlay').hide();
    });
    
    // Prevent clicks inside the modal from closing it
    $('#help-modal').click(function(e) {
        e.stopPropagation();
    });
}

// Accessibility features
function setupAccessibility() {
    // Add ARIA labels to interactive elements
    $('#playPauseBtn').attr('aria-label', 'Play or pause simulation');
    $('#speedSlider').attr('aria-label', 'Simulation speed control');
    $('#realtimeToggle').attr('aria-label', 'Toggle real-time mode');
    $('#jumpNowBtn').attr('aria-label', 'Jump to current time');
    $('#resetCameraBtn').attr('aria-label', 'Reset camera position');
    $('#closePanelBtn').attr('aria-label', 'Close planet information panel');
    $('#backgroundToggle').attr('aria-label', 'Toggle between starfield and grid background');
    
    // Add keyboard navigation for HUD controls
    $('#hud button, #hud input').attr('tabindex', '0');
    
    // Add live region for screen reader announcements
    if (!$('#announcer').length) {
        $('body').append('<div id="announcer" class="sr-only" aria-live="polite" aria-atomic="true"></div>');
    }
    
    // Announce planet selection
    const originalShowPlanetInfo = showPlanetInfo;
    showPlanetInfo = function(planet) {
        originalShowPlanetInfo(planet);
        $('#announcer').text(`Selected ${planet.data.name}. ${planet.data.moons} moons.`);
    };
    
    // Add focus indicators
    $('button, input').on('focus', function() {
        $(this).addClass('focused');
    }).on('blur', function() {
        $(this).removeClass('focused');
    });
}

// Handle keyboard events
function onKeyDown(event) {
    switch (event.code) {
        case 'Space':
            event.preventDefault();
            togglePlayPause();
            break;
        case 'Escape':
            closePlanetPanel();
            break;
        case 'KeyR':
            resetCamera();
            break;
        case 'KeyS':
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                takeScreenshot();
            }
            break;
        case 'KeyP':
            togglePerformance();
            break;
        case 'KeyH':
            toggleHelp();
            break;
    }
}

// Update Singapore time and date display
function updateSingaporeClock() {
    // Use simulationTime for consistent time display
    const displayTime = isRealtime ? new Date() : simulationTime;
    
    // Convert to Singapore timezone (UTC+8)
    const sgTime = new Date(displayTime.getTime() + (8 * 60 * 60 * 1000));
    
    // Format date (YYYY-MM-DD)
    const year = sgTime.getUTCFullYear();
    const month = String(sgTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(sgTime.getUTCDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    // Format time (HH:MM:SS)
    const hours = String(sgTime.getUTCHours()).padStart(2, '0');
    const minutes = String(sgTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(sgTime.getUTCSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    $('#sgDate').text(dateString);
    $('#sgClock').text(`${timeString} SGT`);
}

// Legacy UTC clock function for compatibility
function updateUTCClock() {
    const now = new Date();
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    $('#utcClock').text(`${hours}:${minutes}:${seconds} UTC`);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Get delta time
    const delta = clock.getDelta();
    
    // Update simulation time
    if (!isPaused) {
        if (isRealtime) {
            simulationTime = new Date();
        } else {
            // Advance simulation time based on speed multiplier
            simulationTime = new Date(simulationTime.getTime() + delta * speedMultiplier * 1000);
        }
    }
    
    // Update Singapore clock display
    updateSingaporeClock();
    
    // Rotate sun
    if (!isPaused) {
        sun.rotation.y += 0.001 * speedMultiplier;
    }
    
    // Make sun label face the camera
    sun.children.forEach(child => {
        if (child.isSprite) {
            child.quaternion.copy(camera.quaternion);
        }
    });
    
    // Update planets
    planets.forEach((planet, index) => {
        if (!isPaused) {
            // Rotate planet on its axis
            planet.mesh.rotation.y += planet.data.rotationSpeed * speedMultiplier;
            
            // Orbit planet around the sun (correct circular orbit)
            planet.angle += planet.data.orbitSpeed * speedMultiplier;
            planet.group.position.x = Math.cos(planet.angle) * planet.data.distance;
            planet.group.position.z = Math.sin(planet.angle) * planet.data.distance;
            planet.group.position.y = 0; // Ensure planets stay on the same plane
        }
        
        // Make planet labels face the camera
        if (planet.label) {
            planet.label.quaternion.copy(camera.quaternion);
        }
        
        // Update moons
        if (moons[index]) {
            moons[index].forEach(moon => {
                if (!isPaused) {
                    // Orbit moon around planet
                    moon.angle += moon.orbitSpeed * speedMultiplier;
                    moon.mesh.position.x = Math.cos(moon.angle) * moon.distance;
                    moon.mesh.position.z = Math.sin(moon.angle) * moon.distance;
                    moon.mesh.position.y = 0; // Ensure moons stay on the same plane
                }
            });
        }
    });
    
    // Update asteroid belt
    if (!isPaused) {
        asteroidBelt.forEach(asteroid => {
            asteroid.userData.angle += asteroid.userData.orbitSpeed * speedMultiplier;
            asteroid.position.x = Math.cos(asteroid.userData.angle) * asteroid.userData.radius;
            asteroid.position.z = Math.sin(asteroid.userData.angle) * asteroid.userData.radius;
            asteroid.rotation.y += asteroid.userData.rotationSpeed * speedMultiplier;
        });
    }
    
    // Update comets
    if (!isPaused) {
        comets.forEach(comet => {
            comet.angle += (0.001 / comet.period) * speedMultiplier;
            
            // Calculate elliptical orbit position
            const x = Math.cos(comet.angle) * comet.semiMajorAxis;
            const z = Math.sin(comet.angle) * comet.semiMinorAxis;
            
            comet.group.position.set(x, 0, z);
            
            // Rotate comet to face direction of travel
            const nextAngle = comet.angle + 0.01;
            const nextX = Math.cos(nextAngle) * comet.semiMajorAxis;
            const nextZ = Math.sin(nextAngle) * comet.semiMinorAxis;
            comet.group.lookAt(nextX, 0, nextZ);
            
            // Adjust tail opacity based on distance from sun
            const distanceFromSun = Math.sqrt(x * x + z * z);
            const tailOpacity = Math.max(0.1, 1 - (distanceFromSun / 100));
            comet.tail.material.opacity = tailOpacity * 0.5;
        });
    }
    
    // Update controls
    controls.update();
    
    // Render the scene
    renderer.render(scene, camera);
}

// Toggle physics panel visibility
function togglePhysicsPanel() {
    const physicsContent = $('#physicsContent');
    const toggleBtn = $('#togglePhysicsBtn');
    
    if (physicsContent.hasClass('collapsed')) {
        // Expand panel
        physicsContent.removeClass('collapsed');
        toggleBtn.removeClass('collapsed').text('▼');
    } else {
        // Collapse panel
        physicsContent.addClass('collapsed');
        toggleBtn.addClass('collapsed').text('▶');
    }
}

// Start the application
init();
