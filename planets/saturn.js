// Saturn 3D Planet Viewer
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Global variables
let scene, camera, renderer, controls;
let saturn, saturnGroup;
let ambientLight, directionalLight, pointLight;
let atmosphereClouds, ringSystem;
let showRings = true;
let isAutoRotating = true;
let rotationSpeed = 0.009;
let zoomLevel = 1;
let loadedTextures = 0;
let totalTextures = 2; // Saturn surface + atmosphere

// Saturn data
const saturnData = {
    name: 'Saturn',
    radius: 3.5, // Large but smaller than Jupiter
    distance: 0,
    rotationSpeed: 0.009, // Fast rotation
    hasAtmosphere: true,
    hasMoons: true
};

// Initialize the Saturn scene
function init() {
    createScene();
    createLights();
    createSaturn();
    createAtmosphere();
    createRingSystem();
    createStarfield();
    setupControls();
    setupEventListeners();
    animate();
}

// Create the 3D scene
function createScene() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a15); // Saturn-appropriate dark blue background

    // Camera setup
    const container = document.getElementById('planetScene');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 10);
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
    renderer.toneMappingExposure = 0.6;
    
    container.appendChild(renderer.domElement);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

// Create enhanced lighting system for Saturn
function createLights() {
    // Ambient light for large planet illumination
    ambientLight = new THREE.AmbientLight(0x404050, 0.4);
    scene.add(ambientLight);

    // Strong directional light (sunlight at Saturn's distance)
    directionalLight = new THREE.DirectionalLight(0xffffff, 1.4);
    directionalLight.position.set(10, 5, 10);
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

    // Point light with warm tint for Saturn's appearance
    pointLight = new THREE.PointLight(0xffebcd, 0.3, 100);
    pointLight.position.set(-6, 3, -6);
    scene.add(pointLight);

    // Additional rim light for edge definition
    const rimLight = new THREE.DirectionalLight(0xffebcd, 0.15);
    rimLight.position.set(-10, 2, -10);
    scene.add(rimLight);
}

// Create Saturn with enhanced textures
function createSaturn() {
    saturnGroup = new THREE.Group();
    
    // Saturn geometry
    const saturnGeometry = new THREE.SphereGeometry(saturnData.radius, 96, 96);
    
    // Create Saturn material with texture
    const textureLoader = new THREE.TextureLoader();
    const saturnMaterial = new THREE.MeshPhongMaterial({
        color: 0xfad5a5,
        shininess: 12,
        specular: 0x444433
    });

    // Load Saturn texture
    const saturnTexture = textureLoader.load(
        '../textures/2k_saturn.jpg',
        function(texture) {
            console.log('Saturn texture loaded successfully');
            saturnMaterial.map = texture;
            saturnMaterial.needsUpdate = true;
            onTextureLoaded();
        },
        function(progress) {
            console.log('Saturn texture loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        function(error) {
            console.error('Error loading Saturn texture:', error);
            onTextureLoaded(); // Continue even if texture fails
        }
    );

    // Create Saturn mesh
    saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
    saturn.castShadow = true;
    saturn.receiveShadow = true;
    saturnGroup.add(saturn);
    
    scene.add(saturnGroup);
}

// Create thick Saturnian atmosphere with bands
function createAtmosphere() {
    const textureLoader = new THREE.TextureLoader();
    
    // Create atmospheric bands
    const atmosphereGeometry = new THREE.SphereGeometry(saturnData.radius * 1.05, 32, 32);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
        color: 0xffebcd,
        transparent: true,
        opacity: 0.15,
        shininess: 35,
        specular: 0xffffff
    });

    // Load atmosphere texture
    const atmosphereTexture = textureLoader.load(
        '../textures/2k_saturn.jpg',
        function(texture) {
            atmosphereMaterial.map = texture;
            atmosphereMaterial.needsUpdate = true;
            onTextureLoaded();
        },
        function(progress) {
            console.log('Saturn atmosphere texture loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        function(error) {
            console.error('Error loading Saturn atmosphere texture:', error);
            onTextureLoaded(); // Continue even if texture fails
        }
    );

    atmosphereClouds = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    saturnGroup.add(atmosphereClouds);
    
    // Add outer atmospheric glow
    const glowGeometry = new THREE.SphereGeometry(saturnData.radius * 1.1, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffebcd,
        transparent: true,
        opacity: 0.04,
        side: THREE.BackSide
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    saturnGroup.add(glow);
}

// Create Saturn's magnificent ring system
function createRingSystem() {
    // Create multiple ring groups for realistic appearance
    const ringGroup = new THREE.Group();
    
    // Main ring parameters
    const ringInnerRadius = saturnData.radius * 1.2;
    const ringOuterRadius = saturnData.radius * 2.3;
    
    // Create individual ring segments
    const ringCount = 8;
    
    for (let i = 0; i < ringCount; i++) {
        const innerRadius = ringInnerRadius + (i * (ringOuterRadius - ringInnerRadius) / ringCount);
        const outerRadius = ringInnerRadius + ((i + 1) * (ringOuterRadius - ringInnerRadius) / ringCount);
        
        const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
        
        // Vary opacity and color for different rings
        const opacity = 0.8 - (i * 0.08);
        const color = i % 2 === 0 ? 0xd4af37 : 0xffebcd;
        
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: color,
            transparent: true,
            opacity: opacity,
            side: THREE.DoubleSide,
            shininess: 20,
            specular: 0xffffff
        });
        
        // Add some texture variation
        if (i === 3) {
            // Cassini Division - darker ring
            ringMaterial.opacity = 0.3;
            ringMaterial.color = 0x8b7355;
        }
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        
        // Tilt the rings to match Saturn's axial tilt
        ring.rotation.x = Math.PI / 2;
        
        // Add slight rotation offset for each ring
        ring.rotation.z = (i * 0.1);
        
        ringGroup.add(ring);
    }
    
    ringSystem = ringGroup;
    saturnGroup.add(ringSystem);
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
    controls.minDistance = 7;
    controls.maxDistance = 25;
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
    
    // Ring toggle
    document.getElementById('ringsToggle').addEventListener('change', (e) => {
        showRings = e.target.checked;
        if (ringSystem) {
            ringSystem.visible = showRings;
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
    if (camera.position.length() > 7) {
        camera.position.multiplyScalar(0.9);
        zoomLevel *= 0.9;
    }
}

function zoomOut() {
    if (camera.position.length() < 25) {
        camera.position.multiplyScalar(1.1);
        zoomLevel *= 1.1;
    }
}

function resetView() {
    camera.position.set(0, 4, 10);
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
    link.download = `saturn-3d-${Date.now()}.png`;
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
    const text = `Check out this amazing 3D view of Saturn from our Solar System simulation!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Saturn - 3D Planet View',
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
    
    // Rotate Saturn (very fast rotation)
    if (saturn && isAutoRotating) {
        saturn.rotation.y += saturnData.rotationSpeed;
    }
    
    // Rotate atmosphere clouds at different speed (differential rotation)
    if (atmosphereClouds) {
        atmosphereClouds.rotation.y += saturnData.rotationSpeed * 0.98;
    }
    
    // Animate ring system
    if (ringSystem && showRings) {
        // Rings don't rotate with the planet (they maintain their orientation)
        // But we can add subtle animations
        const time = Date.now() * 0.0001;
        
        // Make individual rings rotate slightly
        ringSystem.children.forEach((ring, index) => {
            ring.rotation.z += (index % 2 === 0 ? 0.0001 : -0.0001);
        });
    }
    
    // Animate lights for more dynamic lighting
    if (directionalLight) {
        const time = Date.now() * 0.0005;
        directionalLight.position.x = Math.sin(time) * 10;
        directionalLight.position.z = Math.cos(time) * 10;
    }
    
    // Render the scene
    renderer.render(scene, camera);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
