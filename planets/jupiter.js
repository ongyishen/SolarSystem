// Jupiter 3D Planet Viewer
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Global variables
let scene, camera, renderer, controls;
let jupiter, jupiterGroup;
let ambientLight, directionalLight, pointLight;
let atmosphereClouds, greatRedSpot;
let showStorms = true;
let isAutoRotating = true;
let rotationSpeed = 0.01;
let zoomLevel = 1;
let loadedTextures = 0;
let totalTextures = 2; // Jupiter surface + atmosphere

// Jupiter data
const jupiterData = {
    name: 'Jupiter',
    radius: 4, // Much larger than other planets
    distance: 0,
    rotationSpeed: 0.01, // Fast rotation
    hasAtmosphere: true,
    hasMoons: true
};

// Initialize the Jupiter scene
function init() {
    createScene();
    createLights();
    createJupiter();
    createAtmosphere();
    createGreatRedSpot();
    createStarfield();
    setupControls();
    setupEventListeners();
    animate();
}

// Create the 3D scene
function createScene() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080810); // Jupiter-appropriate dark purplish background

    // Camera setup
    const container = document.getElementById('planetScene');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 12);
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
    renderer.toneMappingExposure = 0.6; // Adjusted for Jupiter's appearance
    
    container.appendChild(renderer.domElement);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

// Create enhanced lighting system for Jupiter
function createLights() {
    // Ambient light for large planet illumination
    ambientLight = new THREE.AmbientLight(0x404050, 0.4);
    scene.add(ambientLight);

    // Strong directional light (sunlight at Jupiter's distance)
    directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(8, 5, 8);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -15;
    directionalLight.shadow.camera.right = 15;
    directionalLight.shadow.camera.top = 15;
    directionalLight.shadow.camera.bottom = -15;
    scene.add(directionalLight);

    // Point light with warm tint for Jupiter's appearance
    pointLight = new THREE.PointLight(0xffd4a3, 0.3, 100);
    pointLight.position.set(-5, 3, -5);
    scene.add(pointLight);

    // Additional rim light for edge definition on large planet
    const rimLight = new THREE.DirectionalLight(0xffd4a3, 0.2);
    rimLight.position.set(-8, 2, -8);
    scene.add(rimLight);
}

// Create Jupiter with enhanced textures
function createJupiter() {
    jupiterGroup = new THREE.Group();
    
    // Jupiter geometry
    const jupiterGeometry = new THREE.SphereGeometry(jupiterData.radius, 128, 128);
    
    // Create Jupiter material with texture
    const textureLoader = new THREE.TextureLoader();
    const jupiterMaterial = new THREE.MeshPhongMaterial({
        color: 0xc88b3a,
        shininess: 15,
        specular: 0x444433
    });

    // Load Jupiter texture
    const jupiterTexture = textureLoader.load(
        '../textures/2k_jupiter.jpg',
        function(texture) {
            console.log('Jupiter texture loaded successfully');
            jupiterMaterial.map = texture;
            jupiterMaterial.needsUpdate = true;
            onTextureLoaded();
        },
        function(progress) {
            console.log('Jupiter texture loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        function(error) {
            console.error('Error loading Jupiter texture:', error);
            onTextureLoaded(); // Continue even if texture fails
        }
    );

    // Create Jupiter mesh
    jupiter = new THREE.Mesh(jupiterGeometry, jupiterMaterial);
    jupiter.castShadow = true;
    jupiter.receiveShadow = true;
    jupiterGroup.add(jupiter);
    
    scene.add(jupiterGroup);
}

// Create thick Jovian atmosphere with bands
function createAtmosphere() {
    const textureLoader = new THREE.TextureLoader();
    
    // Create atmospheric bands
    const atmosphereGeometry = new THREE.SphereGeometry(jupiterData.radius * 1.05, 32, 32);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
        color: 0xffd4a3,
        transparent: true,
        opacity: 0.2,
        shininess: 40,
        specular: 0xffffff
    });

    // Load atmosphere texture
    const atmosphereTexture = textureLoader.load(
        '../textures/2k_jupiter.jpg',
        function(texture) {
            atmosphereMaterial.map = texture;
            atmosphereMaterial.needsUpdate = true;
            onTextureLoaded();
        },
        function(progress) {
            console.log('Jupiter atmosphere texture loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        function(error) {
            console.error('Error loading Jupiter atmosphere texture:', error);
            onTextureLoaded(); // Continue even if texture fails
        }
    );

    atmosphereClouds = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    jupiterGroup.add(atmosphereClouds);
    
    // Add outer atmospheric glow
    const glowGeometry = new THREE.SphereGeometry(jupiterData.radius * 1.1, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd4a3,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    jupiterGroup.add(glow);
}

// Create Great Red Spot
function createGreatRedSpot() {
    const spotGeometry = new THREE.SphereGeometry(jupiterData.radius * 0.15, 32, 16);
    const spotMaterial = new THREE.MeshPhongMaterial({
        color: 0xcc2222,
        transparent: true,
        opacity: 0.7,
        shininess: 20
    });
    
    greatRedSpot = new THREE.Mesh(spotGeometry, spotMaterial);
    greatRedSpot.position.set(jupiterData.radius * 0.7, jupiterData.radius * 0.2, 0);
    
    // Flatten the spot against the surface
    greatRedSpot.scale.set(1, 0.3, 0.7);
    
    jupiter.add(greatRedSpot);
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
    controls.minDistance = 8;
    controls.maxDistance = 30;
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
    
    // Storm toggle
    document.getElementById('stormsToggle').addEventListener('change', (e) => {
        showStorms = e.target.checked;
        if (greatRedSpot) {
            greatRedSpot.visible = showStorms;
        }
    });
    
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
    if (camera.position.length() > 8) {
        camera.position.multiplyScalar(0.9);
        zoomLevel *= 0.9;
    }
}

function zoomOut() {
    if (camera.position.length() < 30) {
        camera.position.multiplyScalar(1.1);
        zoomLevel *= 1.1;
    }
}

function resetView() {
    camera.position.set(0, 5, 12);
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
    link.download = `jupiter-3d-${Date.now()}.png`;
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
    const text = `Check out this amazing 3D view of Jupiter from our Solar System simulation!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Jupiter - 3D Planet View',
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
    
    // Rotate Jupiter (very fast rotation)
    if (jupiter && isAutoRotating) {
        jupiter.rotation.y += jupiterData.rotationSpeed;
    }
    
    // Rotate atmosphere clouds at different speed (differential rotation)
    if (atmosphereClouds) {
        atmosphereClouds.rotation.y += jupiterData.rotationSpeed * 1.05;
    }
    
    // Animate Great Red Spot position
    if (greatRedSpot && showStorms) {
        const time = Date.now() * 0.0001;
        greatRedSpot.rotation.y = time * 0.2;
        // Subtle pulsing effect
        greatRedSpot.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
    }
    
    // Animate lights for more dynamic lighting
    if (directionalLight) {
        const time = Date.now() * 0.0005;
        directionalLight.position.x = Math.sin(time) * 8;
        directionalLight.position.z = Math.cos(time) * 8;
    }
    
    // Render the scene
    renderer.render(scene, camera);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
