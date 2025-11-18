// Mars 3D Planet Viewer
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Global variables
let scene, camera, renderer, controls;
let mars, phobos, deimos, marsGroup, phobosGroup, deimosGroup;
let ambientLight, directionalLight, pointLight;
let isAutoRotating = true;
let rotationSpeed = 0.004;
let zoomLevel = 1;
let loadedTextures = 0;
let totalTextures = 1; // Mars texture only (moons are too small to texture effectively)

// Mars data
const marsData = {
    name: 'Mars',
    radius: 2,
    distance: 0,
    rotationSpeed: 0.004,
    hasAtmosphere: true,
    hasMoons: true
};

// Phobos data
const phobosData = {
    name: 'Phobos',
    radius: 0.15, // Very small relative to Mars
    distance: 4, // Close orbit
    rotationSpeed: 0.02,
    orbitSpeed: 0.03
};

// Deimos data
const deimosData = {
    name: 'Deimos',
    radius: 0.08, // Even smaller
    distance: 6, // Farther orbit
    rotationSpeed: 0.01,
    orbitSpeed: 0.015
};

// Initialize the Mars scene
function init() {
    createScene();
    createLights();
    createMars();
    createMoons();
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
    scene.background = new THREE.Color(0x0a0806); // Mars-appropriate dark red background

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
    renderer.toneMappingExposure = 0.6; // Slightly higher for Mars coloring
    
    container.appendChild(renderer.domElement);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

// Create enhanced lighting system for Mars
function createLights() {
    // Ambient light for base illumination (more orange-tinted for Mars)
    ambientLight = new THREE.AmbientLight(0x403020, 0.4);
    scene.add(ambientLight);

    // Primary directional light (sunlight from Mars' distance)
    directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
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

    // Point light for atmospheric illumination (red tint for Mars)
    pointLight = new THREE.PointLight(0xcd5c5c, 0.3, 100);
    pointLight.position.set(-3, 2, -3);
    scene.add(pointLight);

    // Additional rim light (warm tone)
    const rimLight = new THREE.DirectionalLight(0xff6b35, 0.2);
    rimLight.position.set(-5, 1, -5);
    scene.add(rimLight);
}

// Create Mars with enhanced textures
function createMars() {
    marsGroup = new THREE.Group();
    
    // Mars geometry
    const marsGeometry = new THREE.SphereGeometry(marsData.radius, 64, 64);
    
    // Create Mars material with texture
    const textureLoader = new THREE.TextureLoader();
    const marsMaterial = new THREE.MeshPhongMaterial({
        color: 0xcd5c5c,
        shininess: 8,
        specular: 0x442222
    });

    // Load Mars texture
    const marsTexture = textureLoader.load(
        '../textures/2k_mars.jpg',
        function(texture) {
            console.log('Mars texture loaded successfully');
            marsMaterial.map = texture;
            marsMaterial.needsUpdate = true;
            onTextureLoaded();
        },
        function(progress) {
            console.log('Mars texture loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        function(error) {
            console.error('Error loading Mars texture:', error);
            onTextureLoaded(); // Continue even if texture fails
        }
    );

    // Create Mars mesh
    mars = new THREE.Mesh(marsGeometry, marsMaterial);
    mars.castShadow = true;
    mars.receiveShadow = true;
    marsGroup.add(mars);
    
    scene.add(marsGroup);
}

// Create Mars' moons (Phobos and Deimos)
function createMoons() {
    const textureLoader = new THREE.TextureLoader();
    
    // Create Phobos
    phobosGroup = new THREE.Group();
    const phobosGeometry = new THREE.SphereGeometry(phobosData.radius, 16, 16);
    const phobosMaterial = new THREE.MeshPhongMaterial({
        color: 0x888888,
        shininess: 3,
        specular: 0x222222
    });

    phobos = new THREE.Mesh(phobosGeometry, phobosMaterial);
    phobos.position.set(phobosData.distance, 0, 0);
    phobos.castShadow = true;
    phobosGroup.add(phobos);
    scene.add(phobosGroup);

    // Create Deimos
    deimosGroup = new THREE.Group();
    const deimosGeometry = new THREE.SphereGeometry(deimosData.radius, 12, 12);
    const deimosMaterial = new THREE.MeshPhongMaterial({
        color: 0x666666,
        shininess: 2,
        specular: 0x111111
    });

    deimos = new THREE.Mesh(deimosGeometry, deimosMaterial);
    deimos.position.set(deimosData.distance, 0, 0);
    deimos.castShadow = true;
    deimosGroup.add(deimos);
    scene.add(deimosGroup);
    
    onTextureLoaded(); // No textures for small moons, mark as loaded
}

// Create thin Martian atmosphere
function createAtmosphere() {
    // Mars has a very thin atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(marsData.radius * 1.05, 32, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0xffcccc,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide
    });
    
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    marsGroup.add(atmosphere);
    
    // Add a subtle dust haze effect
    const hazeGeometry = new THREE.SphereGeometry(marsData.radius * 1.1, 16, 16);
    const hazeMaterial = new THREE.MeshBasicMaterial({
        color: 0xcd5c5c,
        transparent: true,
        opacity: 0.03,
        side: THREE.BackSide
    });
    
    const haze = new THREE.Mesh(hazeGeometry, hazeMaterial);
    marsGroup.add(haze);
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
function setupEventListeners() {
    // Zoom controls
    document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
    document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);
    document.getElementById('resetViewBtn').addEventListener('click', resetView);
    
    // Rotation controls
    document.getElementById('autoRotateToggle').addEventListener('click', toggleAutoRotation);
    document.getElementById('rotationSpeed').addEventListener('input', updateRotationSpeed);
    
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
        controls.autoRotateSpeed = rotationSpeed * 80;
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
    link.download = `mars-3d-${Date.now()}.png`;
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
    const text = `Check out this amazing 3D view of Mars from our Solar System simulation!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Mars - 3D Planet View',
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
    
    // Rotate Mars
    if (mars && isAutoRotating) {
        mars.rotation.y += marsData.rotationSpeed;
    }
    
    // Orbit Phobos around Mars
    if (phobos) {
        phobosGroup.rotation.y += phobosData.orbitSpeed;
        phobos.rotation.y += phobosData.rotationSpeed;
    }
    
    // Orbit Deimos around Mars
    if (deimos) {
        deimosGroup.rotation.y += deimosData.orbitSpeed;
        deimos.rotation.y += deimosData.rotationSpeed;
    }
    
    // Animate lights for more dynamic lighting
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
