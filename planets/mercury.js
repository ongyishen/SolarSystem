// Mercury 3D Planet Viewer
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Global variables
let scene, camera, renderer, controls;
let mercury, mercuryGroup;
let ambientLight, directionalLight, pointLight;
let isAutoRotating = true;
let rotationSpeed = 0.002;
let zoomLevel = 1;
let loadedTextures = 0;
let totalTextures = 1;

// Mercury data
const mercuryData = {
    name: 'Mercury',
    radius: 1.5,
    distance: 0,
    rotationSpeed: 0.002,
    hasAtmosphere: false,
    hasMoons: false
};

// Initialize the Mercury scene
function init() {
    createScene();
    createLights();
    createMercury();
    createStarfield();
    setupControls();
    setupEventListeners();
    animate();
}

// Create the 3D scene
function createScene() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080604); // Mercury-appropriate dark brown background

    // Camera setup
    const container = document.getElementById('planetScene');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 6);
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
    renderer.toneMappingExposure = 0.8; // Higher exposure for bright sunlight near Mercury
    
    container.appendChild(renderer.domElement);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

// Create enhanced lighting system for Mercury
function createLights() {
    // Stronger ambient light due to proximity to Sun
    ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Very strong directional light (intense sunlight)
    directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
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

    // Point light for additional illumination
    pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight.position.set(-3, 2, -3);
    scene.add(pointLight);

    // Additional rim light for edge definition
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(-5, 1, -5);
    scene.add(rimLight);
}

// Create Mercury with enhanced textures
function createMercury() {
    mercuryGroup = new THREE.Group();
    
    // Mercury geometry
    const mercuryGeometry = new THREE.SphereGeometry(mercuryData.radius, 64, 64);
    
    // Create Mercury material with texture
    const textureLoader = new THREE.TextureLoader();
    const mercuryMaterial = new THREE.MeshPhongMaterial({
        color: 0x8c7853,
        shininess: 5,
        specular: 0x222222
    });

    // Load Mercury texture
    const mercuryTexture = textureLoader.load(
        '../textures/2k_mercury.jpg',
        function(texture) {
            console.log('Mercury texture loaded successfully');
            mercuryMaterial.map = texture;
            mercuryMaterial.needsUpdate = true;
            onTextureLoaded();
        },
        function(progress) {
            console.log('Mercury texture loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        function(error) {
            console.error('Error loading Mercury texture:', error);
            onTextureLoaded(); // Continue even if texture fails
        }
    );

    // Create Mercury mesh
    mercury = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
    mercury.castShadow = true;
    mercury.receiveShadow = true;
    mercuryGroup.add(mercury);
    
    scene.add(mercuryGroup);
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
    controls.minDistance = 3;
    controls.maxDistance = 15;
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
    if (camera.position.length() > 3) {
        camera.position.multiplyScalar(0.9);
        zoomLevel *= 0.9;
    }
}

function zoomOut() {
    if (camera.position.length() < 15) {
        camera.position.multiplyScalar(1.1);
        zoomLevel *= 1.1;
    }
}

function resetView() {
    camera.position.set(0, 2, 6);
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
    link.download = `mercury-3d-${Date.now()}.png`;
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
    const text = `Check out this amazing 3D view of Mercury from our Solar System simulation!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Mercury - 3D Planet View',
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
    
    // Rotate Mercury
    if (mercury && isAutoRotating) {
        mercury.rotation.y += mercuryData.rotationSpeed;
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
