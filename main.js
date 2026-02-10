import * as THREE from 'three';

const content = document.getElementById('content');
const toggleButton = document.getElementById('toggle-visibility');
const topicPanel = document.getElementById('topic-panel');
const topicTitle = document.getElementById('topic-title');
const topicBody = document.getElementById('topic-body');
const topicClose = document.getElementById('topic-close');
const topicContent = document.querySelector('.topic-panel__content');
let contentHidden = false;

if (content && toggleButton) {
    toggleButton.addEventListener('click', () => {
        const isHidden = content.classList.toggle('is-hidden');
        contentHidden = isHidden;
        toggleButton.textContent = isHidden ? 'Show text' : 'Hide text';
        toggleButton.setAttribute('aria-pressed', String(isHidden));
    });
}
if (content) {
    contentHidden = content.classList.contains('is-hidden');
}

const topics = [
    {
        title: 'The Exit Moment',
        body: 'You experience death as a transition, not a collapse. The story frames it as a quiet step into a wider conversation about what you truly are.'
    },
    {
        title: 'One Life, Many Lives',
        body: 'Every person you meet is another version of you. The joys and harms you create echo back through the same shared soul.'
    },
    {
        title: 'The Universe as a Classroom',
        body: 'Reality becomes a training ground. Each life is a lesson that grows empathy, perspective, and depth.'
    },
    {
        title: 'Kindness Is Self-Recognition',
        body: 'Compassion is not charity, it is memory. Every loving act is an act of recognizing yourself in another face.'
    },
    {
        title: 'Time Is a Spiral',
        body: 'Lives are not linear chapters. They are a looping, spiraling journey that teaches you to hold all of humanity at once.'
    },
    {
        title: 'The Next Hatch',
        body: 'When the lessons are complete, you are ready to be born into something larger. The egg cracks into a bigger universe.'
    }
];

// Scene Setup
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas,
    antialias: true,
    alpha: true 
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
camera.position.z = 5;

// Cosmic Background Gradient
scene.background = new THREE.Color(0x0a0a1a);
scene.fog = new THREE.FogExp2(0x0a0a1a, 0.05);

// Create Egg Shape (Ellipsoid)
const eggGeometry = new THREE.SphereGeometry(1, 64, 64);
eggGeometry.scale(1.35, 1.55, 1.35);

const eggCoreMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b0d1a,
    emissive: 0x0b0d1a,
    roughness: 0.8,
    metalness: 0.1
});

const egg = new THREE.Mesh(eggGeometry, eggCoreMaterial);
scene.add(egg);

// Fresnel glow shell for the bright rim
const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
        glowColor: { value: new THREE.Color(0x66ccff) },
        intensity: { value: 1.1 },
        power: { value: 2.2 }
    },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
    `,
    fragmentShader: `
        uniform vec3 glowColor;
        uniform float intensity;
        uniform float power;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        void main() {
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);
            float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), power);
            float alpha = fresnel * intensity;
            gl_FragColor = vec4(glowColor, alpha);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const glowShell = new THREE.Mesh(eggGeometry.clone(), glowMaterial);
glowShell.scale.multiplyScalar(1.02);
scene.add(glowShell);

// Soft outer aura
function createRadialTexture() {
    const size = 256;
    const canvasTex = document.createElement('canvas');
    canvasTex.width = size;
    canvasTex.height = size;
    const ctx = canvasTex.getContext('2d');
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0.0, 'rgba(90, 190, 255, 0.9)');
    grad.addColorStop(0.35, 'rgba(50, 140, 255, 0.4)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvasTex);
    texture.needsUpdate = true;
    return texture;
}

function createRingTexture() {
    const size = 256;
    const canvasTex = document.createElement('canvas');
    canvasTex.width = size;
    canvasTex.height = size;
    const ctx = canvasTex.getContext('2d');
    const center = size / 2;
    const outer = size * 0.48;
    const inner = size * 0.3;
    const grad = ctx.createRadialGradient(center, center, inner, center, center, outer);
    grad.addColorStop(0.0, 'rgba(120, 200, 255, 0)');
    grad.addColorStop(0.55, 'rgba(120, 200, 255, 0.2)');
    grad.addColorStop(0.75, 'rgba(170, 230, 255, 0.95)');
    grad.addColorStop(1.0, 'rgba(120, 200, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvasTex);
    texture.needsUpdate = true;
    return texture;
}

function createCircleTexture() {
    const size = 128;
    const canvasTex = document.createElement('canvas');
    canvasTex.width = size;
    canvasTex.height = size;
    const ctx = canvasTex.getContext('2d');
    const center = size / 2;
    const radius = size * 0.45;
    const grad = ctx.createRadialGradient(center, center, radius * 0.2, center, center, radius);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();
    const texture = new THREE.CanvasTexture(canvasTex);
    texture.needsUpdate = true;
    return texture;
}

const auraMaterial = new THREE.SpriteMaterial({
    map: createRadialTexture(),
    color: 0x5fb7ff,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const aura = new THREE.Sprite(auraMaterial);
aura.scale.set(8.4, 8.4, 1);
scene.add(aura);


// Particle System - Representing Souls/Connections
const particleCount = 1400;
const particlesGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleVelocities = [];

for (let i = 0; i < particleCount; i++) {
    // Random positions in a sphere
    const radius = Math.random() * 24 + 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    particlePositions[i * 3 + 2] = radius * Math.cos(phi);
    
    // Random velocities
    particleVelocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
    });
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

const particlesMaterial = new THREE.PointsMaterial({
    color: 0xbfd9ff,
    size: 0.065,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Constellation pattern inside the egg - ordered step-by-step
const constellationBaseStars = [
    new THREE.Vector3(-0.7, 0.45, 0.42),    // Star 1 (top left)
    new THREE.Vector3(-0.35, 0.2, 0.42),    // Star 2 (left middle)
    new THREE.Vector3(0.0, 0.5, 0.42),      // Star 3 (top center)
    new THREE.Vector3(0.35, 0.25, 0.42),    // Star 4 (right middle)
    new THREE.Vector3(0.65, 0.42, 0.42),    // Star 5 (top right)
    new THREE.Vector3(0.0, -0.45, 0.42)     // Star 6 (bottom center)
];

const constellationStarData = constellationBaseStars.map((star) => ({
    position: star.clone(),
    velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.0032,
        (Math.random() - 0.5) * 0.003,
        (Math.random() - 0.5) * 0.0032
    )
}));

const constellationStars = constellationStarData.map((star) => star.position);
const constellationDriftBounds = new THREE.Vector3(1.25, 1.45, 1.25);

const constellationGroup = new THREE.Group();
constellationGroup.position.z = 0.85;
egg.add(constellationGroup);

const shineMaterial = new THREE.SpriteMaterial({
    map: createRingTexture(),
    color: 0xbfe9ff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false
});
shineMaterial.alphaTest = 0.08;

const shineSprite = new THREE.Sprite(shineMaterial);
shineSprite.visible = false;
shineSprite.scale.set(0.7, 0.7, 1);
constellationGroup.add(shineSprite);

const constellationGeometry = new THREE.BufferGeometry().setFromPoints(constellationStars);
const constellationStarTexture = createCircleTexture();
const constellationMaterial = new THREE.PointsMaterial({
    color: 0xf1f6ff,
    size: 0.085,
    map: constellationStarTexture,
    transparent: true,
    opacity: 0.9,
    alphaTest: 0.2,
    depthTest: false,
    depthWrite: false
});

const constellationPoints = new THREE.Points(constellationGeometry, constellationMaterial);
constellationPoints.renderOrder = 10;
constellationGroup.add(constellationPoints);

const constellationGlowMaterial = new THREE.PointsMaterial({
    color: 0x7fc7ff,
    size: 0.18,
    map: constellationStarTexture,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    alphaTest: 0.2,
    depthTest: false,
    depthWrite: false
});

const constellationGlowPoints = new THREE.Points(constellationGeometry, constellationGlowMaterial);
constellationGlowPoints.renderOrder = 8;
constellationGroup.add(constellationGlowPoints);

const constellationLineIndices = [2, 0, 2, 1, 2, 3, 2, 4, 2, 5];
const constellationLinePositions = new Float32Array(constellationLineIndices.length * 3);
const constellationLineGeometry = new THREE.BufferGeometry();
constellationLineGeometry.setAttribute('position', new THREE.BufferAttribute(constellationLinePositions, 3));

function updateConstellationLines() {
    const linePositionAttr = constellationLineGeometry.attributes.position;
    for (let i = 0; i < constellationLineIndices.length; i++) {
        const starPos = constellationStarData[constellationLineIndices[i]].position;
        linePositionAttr.setXYZ(i, starPos.x, starPos.y, starPos.z);
    }
    linePositionAttr.needsUpdate = true;
}

updateConstellationLines();

const constellationLineMaterial = new THREE.LineBasicMaterial({
    color: 0x93c7ff,
    transparent: true,
    opacity: 0.45,
    depthTest: false
});

const constellationLines = new THREE.LineSegments(constellationLineGeometry, constellationLineMaterial);
constellationLines.renderOrder = 9;
constellationGroup.add(constellationLines);

const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.08;
const pointer = new THREE.Vector2(2, 2);
let hoveredStarIndex = null;
let panelOpen = false;
let panelClosing = false;
let closeTimer = null;
let hoverStartTime = 0;
let pendingHoverIndex = null;
const hoverOpenDelay = 1200;

function openTopic(index) {
    if (!topicPanel || !topicTitle || !topicBody) {
        return;
    }

    if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
    }
    panelClosing = false;

    const topic = topics[index] || topics[0];
    topicTitle.textContent = topic.title;
    topicBody.textContent = topic.body;
    if (topicContent) {
        topicContent.classList.remove('animate-in', 'animate-out', 'zoom-in');
        void topicContent.offsetWidth;
        topicContent.classList.add('animate-in', 'zoom-in');
    }
    topicPanel.classList.add('is-open');
    topicPanel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('panel-open');
    panelOpen = true;
}

function closeTopic() {
    if (!topicPanel) {
        return;
    }

    if (panelClosing || !panelOpen) {
        return;
    }

    panelClosing = true;
    if (topicContent) {
        topicContent.classList.remove('animate-in');
        void topicContent.offsetWidth;
        topicContent.classList.add('animate-out');
    }

    closeTimer = setTimeout(() => {
        topicPanel.classList.remove('is-open');
        topicPanel.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('panel-open');
        hoveredStarIndex = null;
        renderer.domElement.style.cursor = 'default';
        shineSprite.visible = false;
        panelOpen = false;
        panelClosing = false;
        closeTimer = null;
    }, 600);
}

if (topicClose) {
    topicClose.addEventListener('click', () => {
        closeTopic();
    });
}

if (topicPanel) {
    topicPanel.addEventListener('click', (event) => {
        if (event.target === topicPanel) {
            closeTopic();
        }
    });
}

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeTopic();
    }
});

// Lighting
const ambientLight = new THREE.AmbientLight(0x6fb5ff, 0.2);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0x4fa8ff, 1.4, 100);
pointLight1.position.set(5, 5, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x8fd3ff, 0.6, 100);
pointLight2.position.set(-5, -4, -5);
scene.add(pointLight2);

// Animation Loop
let time = 0;

function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    
    // Keep egg static
    glowShell.rotation.copy(egg.rotation);
    
    // Pulsing effect
    const scale = 1.15 + Math.sin(time) * 0.06;
    egg.scale.set(scale * 1.35, scale * 1.55, scale * 1.35);
    glowShell.scale.set(scale * 1.35 * 1.02, scale * 1.55 * 1.02, scale * 1.35 * 1.02);
    aura.scale.set(8.4 + Math.sin(time * 0.6) * 0.4, 8.4 + Math.sin(time * 0.6) * 0.4, 1);
    
    // Animate particles
    const positions = particlesGeometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += particleVelocities[i].x;
        positions[i * 3 + 1] += particleVelocities[i].y;
        positions[i * 3 + 2] += particleVelocities[i].z;
        
        // Boundary check - wrap around
        if (Math.abs(positions[i * 3]) > 20) particleVelocities[i].x *= -1;
        if (Math.abs(positions[i * 3 + 1]) > 20) particleVelocities[i].y *= -1;
        if (Math.abs(positions[i * 3 + 2]) > 20) particleVelocities[i].z *= -1;
    }
    particlesGeometry.attributes.position.needsUpdate = true;
    
    // Rotate particle system slowly
    particles.rotation.y += 0.0004;
    
    // Animate lights
    pointLight1.position.x = Math.sin(time * 0.7) * 4.5;
    pointLight1.position.z = Math.cos(time * 0.7) * 4.5;

    // Subtle constellation twinkle
    const twinkle = 0.75 + Math.sin(time * 1.8) * 0.2;
    constellationMaterial.opacity = twinkle;
    constellationLineMaterial.opacity = 0.25 + Math.sin(time * 1.3) * 0.15;
    constellationMaterial.size = 0.085 + Math.sin(time * 1.6) * 0.01;
    const baseGlow = 0.18 + Math.sin(time * 1.1) * 0.015;
    const hoverBoost = hoveredStarIndex !== null ? 0.04 : 0;
    constellationGlowMaterial.size = baseGlow + hoverBoost;
    constellationGlowMaterial.opacity = hoveredStarIndex !== null ? 0.45 : 0.12;

    const positionAttr = constellationGeometry.attributes.position;
    for (let i = 0; i < constellationStarData.length; i++) {
        const star = constellationStarData[i];
        star.position.add(star.velocity);

        const testX = star.position.x + constellationGroup.position.x;
        const testY = star.position.y + constellationGroup.position.y;
        const testZ = star.position.z + constellationGroup.position.z;
        const normalized =
            (testX * testX) / (constellationDriftBounds.x * constellationDriftBounds.x) +
            (testY * testY) / (constellationDriftBounds.y * constellationDriftBounds.y) +
            (testZ * testZ) / (constellationDriftBounds.z * constellationDriftBounds.z);

        if (normalized > 1) {
            star.velocity.multiplyScalar(-1);
            star.position.add(star.velocity);
        }

        positionAttr.setXYZ(i, star.position.x, star.position.y, star.position.z);
    }
    positionAttr.needsUpdate = true;
    updateConstellationLines();

    if (panelOpen || panelClosing || !contentHidden) {
        hoveredStarIndex = null;
        pendingHoverIndex = null;
        hoverStartTime = 0;
        renderer.domElement.style.cursor = 'default';
    } else {
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObject(constellationPoints, false);
        if (hits.length > 0) {
            const hitIndex = hits[0].index;
            renderer.domElement.style.cursor = 'pointer';
            if (hitIndex !== hoveredStarIndex) {
                hoveredStarIndex = hitIndex;
                pendingHoverIndex = hitIndex;
                hoverStartTime = performance.now();
            }
        } else {
            hoveredStarIndex = null;
            pendingHoverIndex = null;
            hoverStartTime = 0;
            renderer.domElement.style.cursor = 'default';
        }
    }

    if (
        !panelOpen &&
        !panelClosing &&
        pendingHoverIndex !== null &&
        performance.now() - hoverStartTime >= hoverOpenDelay
    ) {
        openTopic(pendingHoverIndex);
        pendingHoverIndex = null;
        hoverStartTime = 0;
    }

    if (!panelOpen && !panelClosing && hoveredStarIndex !== null) {
        const starPos = constellationStarData[hoveredStarIndex].position;
        shineSprite.visible = true;
        shineSprite.position.set(starPos.x, starPos.y, starPos.z + 0.02);
        const shinePulse = 0.72 + Math.sin(time * 6) * 0.06;
        shineSprite.scale.set(shinePulse, shinePulse, 1);
        shineMaterial.opacity = 0.85;
    } else {
        shineSprite.visible = false;
        shineMaterial.opacity = 0;
    }
    
    renderer.render(scene, camera);
}

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('pointermove', (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Start Animation
animate();
