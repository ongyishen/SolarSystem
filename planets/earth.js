// Earth 3D Planet Viewer
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Global variables
let scene, camera, renderer, controls;
let earth, moon, earthGroup, moonGroup;
let ambientLight, directionalLight, pointLight;
let isAutoRotating = true;
let rotationSpeed = 0.005;
let zoomLevel = 1;
let loadedTextures = 0;
let totalTextures = 2; // Earth and Moon textures

// Earth data
const earthData = {
    name: 'Earth',
    radius: 2,
    distance: 0,
    rotationSpeed: 0.005,
    atmosphereRadius: 2.1,
    hasAtmosphere: true,
    hasMoon: true
};

// Moon data
const moonData = {
    name: 'Moon',
    radius: 0.27, // Relative to Earth
    distance: 6, // Distance from Earth
    rotationSpeed: 0.002,
    orbitSpeed: 0.01
};
// Grid background variables
let currentBackground = 'stars'; // 'stars' or 'grid'
let starField = null;
let gridBackground = null;

// Initialize the Earth scene
function init() {
    createScene();
    createLights();
    createEarth();
    createMoon();
    createAtmosphere();
    createStarfield();
    setupControls();
    setupEventListeners();
    animate();
}

// Create the 3D scene
function createScene() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000814);

    // Camera setup
    const container = document.getElementById('planetScene');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    
    container.appendChild(renderer.domElement);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

// Create enhanced lighting system
// Create enhanced lighting system with higher brightness
function createLights() {
    // Ambient light for base illumination - much brighter
    ambientLight = new THREE.AmbientLight(0xcccccc, 2.0);
    scene.add(ambientLight);

    // Primary directional light (sunlight) - much brighter
    directionalLight = new THREE.DirectionalLight(0xffffff, 8.0);
    directionalLight.position.set(5, 3, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    // Additional directional lights for better illumination
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight1.position.set(10, 10, 5);
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight2.position.set(-10, 5, -10);
    scene.add(directionalLight2);
    
    // Add hemisphere light for more natural lighting
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x4444ff, 0.5);
    scene.add(hemisphereLight);

    // Point light for atmospheric illumination
    pointLight = new THREE.PointLight(0x4a90e2, 0.5, 100);
    pointLight.position.set(-3, 2, -3);
    scene.add(pointLight);

    // Additional rim light
    const rimLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
    rimLight.position.set(-5, 1, -5);
    scene.add(rimLight);
}

// Create Earth with enhanced textures
function createEarth() {
   earthGroup = new THREE.Group();
    
    // Earth geometry
    const earthGeometry = new THREE.SphereGeometry(earthData.radius, 64, 64);
    
    // Create Earth material with texture
    const textureLoader = new THREE.TextureLoader();
    const earthMaterial = new THREE.MeshPhongMaterial({
        color: 0x2e7fff,
        shininess: 10,
        specular: 0x222222
    });

    // Load Earth texture
    const earthTexture = textureLoader.load(
        '../textures/2k_earth_daymap.jpg',
        function(texture) {
            console.log('Earth texture loaded successfully');
            earthMaterial.map = texture;
            earthMaterial.needsUpdate = true;
            onTextureLoaded();
        },
        function(progress) {
            console.log('Earth texture loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        function(error) {
            console.error('Error loading Earth texture:', error);
            onTextureLoaded(); // Continue even if texture fails
        }
    );

    // Create Earth mesh
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.castShadow = true;
    earth.receiveShadow = true;
    earthGroup.add(earth);
    
    scene.add(earthGroup);
}

// Create Moon
function createMoon() {
    moonGroup = new THREE.Group();
    
    // Moon geometry
    const moonGeometry = new THREE.SphereGeometry(moonData.radius, 32, 32);
    
    // Create Moon material with texture
    const textureLoader = new THREE.TextureLoader();
    const moonMaterial = new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        shininess: 5,
        specular: 0x111111
    });

    // Load Moon texture
    const moonTexture = textureLoader.load(
        '../textures/2k_moon.jpg',
        function(texture) {
            console.log('Moon texture loaded successfully');
            moonMaterial.map = texture;
            moonMaterial.needsUpdate = true;
            onTextureLoaded();
        },
        function(progress) {
            console.log('Moon texture loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        function(error) {
            console.error('Error loading Moon texture:', error);
            onTextureLoaded(); // Continue even if texture fails
        }
    );

    // Create Moon mesh
    moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(moonData.distance, 0, 0);
    moon.castShadow = true;
    moon.receiveShadow = true;
    moonGroup.add(moon);
    
    scene.add(moonGroup);
}

// Create atmospheric effects
function createAtmosphere() {
    // Atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(earthData.atmosphereRadius, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x4a90e2,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide
    });
    
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earthGroup.add(atmosphere);
    
    // Outer atmosphere glow
    const outerAtmosphereGeometry = new THREE.SphereGeometry(earthData.atmosphereRadius * 1.1, 32, 32);
    const outerAtmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide
    });
    
    const outerAtmosphere = new THREE.Mesh(outerAtmosphereGeometry, outerAtmosphereMaterial);
    earthGroup.add(outerAtmosphere);
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
        const x = (Math.random() - 0.5) * 200;
        const y = (Math.random() - 0.5) * 200;
        const z = (Math.random() - 0.5) * 200;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
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
    const backgroundToggle = document.getElementById('backgroundToggle');
    const isGridMode = backgroundToggle.checked;
    
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
        scene.background = new THREE.Color(0x000814);
    }
}

// Setup orbital controls
function setupControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 4;
    controls.maxDistance = 20;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.zoomSpeed = 0.8;
    controls.rotateSpeed = 0.5;
}

// Setup event listeners
// Setup event listeners
function setupEventListeners() {
    // Zoom controls
    document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
    document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);
    document.getElementById('resetViewBtn').addEventListener('click', resetView);
    
    // Rotation controls
    document.getElementById('autoRotateToggle').addEventListener('click', toggleAutoRotation);
    document.getElementById('rotationSpeed').addEventListener('input', updateRotationSpeed);
    
    // Background toggle control
    const backgroundToggle = document.getElementById('backgroundToggle');
    if (backgroundToggle) {
        backgroundToggle.addEventListener('change', toggleBackground);
    }
    
    // Navigation
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = '../index.html';
    });
    
    document.getElementById('planetSelector').addEventListener('change', (e) => {
        const selectedPlanet = e.target.value;
        window.location.href = `${selectedPlanet}.html`;
    });
    
    // Tab functionality
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Footer buttons
    document.getElementById('screenshotBtn').addEventListener('click', takeScreenshot);
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);
    document.getElementById('shareBtn').addEventListener('click', sharePlanet);
    
    // Keyboard controls
    document.addEventListener('keydown', onKeyDown);
}

// Handle texture loading completion
function onTextureLoaded() {
    loadedTextures++;
    if (loadedTextures === totalTextures) {
        // Hide loading indicator
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        console.log('All textures loaded successfully');
    }
}

// Zoom functions
function zoomIn() {
    if (camera.position.length() > 4) {
        camera.position.multiplyScalar(0.9);
        zoomLevel *= 0.9;
    }
}

function zoomOut() {
    if (camera.position.length() < 20) {
        camera.position.multiplyScalar(1.1);
        zoomLevel *= 1.1;
    }
}

function resetView() {
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);
    zoomLevel = 1;
    controls.reset();
}

// Rotation controls
function toggleAutoRotation() {
    isAutoRotating = !isAutoRotating;
    const btn = document.getElementById('autoRotateToggle');
    if (isAutoRotating) {
        btn.classList.add('active');
        controls.autoRotate = true;
    } else {
        btn.classList.remove('active');
        controls.autoRotate = false;
    }
}

function updateRotationSpeed(e) {
    rotationSpeed = e.target.value / 10000;
    if (isAutoRotating) {
        controls.autoRotateSpeed = rotationSpeed * 100;
    }
}

// Tab switching
function switchTab(tabName) {
    // Update button states
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update content visibility
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
}

// Screenshot functionality
function takeScreenshot() {
    renderer.render(scene, camera);
    const dataURL = renderer.domElement.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.download = `earth-3d-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
}

// Fullscreen toggle
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Share functionality
function sharePlanet() {
    const url = window.location.href;
    const text = `Check out this amazing 3D view of Earth from our Solar System simulation!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Earth - 3D Planet View',
            text: text,
            url: url
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`${text} ${url}`).then(() => {
            alert('Link copied to clipboard!');
        });
    }
}

// Keyboard controls
function onKeyDown(event) {
    switch (event.code) {
        case 'KeyR':
            resetView();
            break;
        case 'Space':
            event.preventDefault();
            toggleAutoRotation();
            break;
        case 'Equal':
        case 'NumpadAdd':
            zoomIn();
            break;
        case 'Minus':
        case 'NumpadSubtract':
            zoomOut();
            break;
        case 'KeyS':
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                takeScreenshot();
            }
            break;
        case 'KeyF':
            toggleFullscreen();
            break;
    }
}

// Handle window resize
function onWindowResize() {
    const container = document.getElementById('planetScene');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update controls
    controls.update();
    
    // Rotate Earth
    if (earth && isAutoRotating) {
        earth.rotation.y += earthData.rotationSpeed;
    }
    
    // Orbit Moon around Earth
    if (moon) {
        moonGroup.rotation.y += moonData.orbitSpeed;
        moon.rotation.y += moonData.rotationSpeed;
    }
    
    // Animate lights
    if (directionalLight) {
        const time = Date.now() * 0.0005;
        directionalLight.position.x = Math.sin(time) * 5;
        directionalLight.position.z = Math.cos(time) * 5;
    }
    
    // Render the scene
    renderer.render(scene, camera);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
