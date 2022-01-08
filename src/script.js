import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import gsap from 'gsap';

/**
 * Base
-------------------------------------------------------------
 */
// Debug
const gui = new GUI({ width: 400 });

let guiShowToggle = false;
let guiControlToggle = false;
// gui.show(gui._hidden);
// gui.open(gui._closed);

window.addEventListener('keypress', (e) => {
    if ((e.key === 'h' || e.key === 'H') && guiShowToggle == false) {
        gui.show(guiShowToggle);
        guiShowToggle = true;
    } else if ((e.key === 'h' || e.key === 'H') && guiShowToggle == true) {
        gui.show(guiShowToggle);
        guiShowToggle = false;
    }
    if ((e.key === 'c' || e.key === 'C') && guiControlToggle == false) {
        gui.open(guiControlToggle);
        guiControlToggle = true;
    } else if ((e.key === 'c' || e.key === 'C') && guiControlToggle == true) {
        gui.open(guiControlToggle);
        guiControlToggle = false;
    }
});

let parameters = {
    night: () => {
        gsap.to(moonLight.position, { duration: 10, x: -10 });
        gsap.to(moonLight.position, { duration: 15, y: -2 });
    },
    reset: () => {
        gsap.to(moonLight.position, { duration: 5, x: 4 });
        gsap.to(moonLight.position, { duration: 5, y: 4 });
    },
    flick: () => {
        gsap.to(flicker.position, { duration: 1, y: 1 });
        gsap.to(flicker.position, { duration: 0.2, delay: 1.2, y: 1.5 });
        gsap.to(flicker.position, { duration: 1, delay: 1.5, y: 0.8 });
        gsap.to(flicker.position, { duration: 0.1, delay: 1.8, y: 4 });
        gsap.to(flicker.position, { duration: 0.2, delay: 2.2, y: 1.5 });
        gsap.to(flicker.position, { duration: 1, delay: 3.2, y: 0.8 });
        gsap.to(flicker.position, { duration: 0.1, delay: 4, y: 4 });
        gsap.to(flicker.position, { duration: 0.2, delay: 4.2, y: 1.5 });
        gsap.to(flicker.position, { duration: 0.1, delay: 4.8, y: 0 });
    },
    sunToggle: false,
};
gui.add(parameters, 'night');
gui.add(parameters, 'reset');
gui.add(parameters, 'flick');

let cloudParticles = [];

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Textures
-------------------------------------------------------------
 */
const textureLoader = new THREE.TextureLoader();
const doorColorTexture = textureLoader.load('/textures/door/color.jpg');
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg');
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg');
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg');
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg');
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg');
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg');

const bricksColorTexture = textureLoader.load('/textures/bricks/color.jpg');
const bricksAmbientOcclusionTexture = textureLoader.load('/textures/bricks/ambientOcclusion.jpg');
const bricksNormalTexture = textureLoader.load('/textures/bricks/normal.jpg');
const bricksRoughnessTexture = textureLoader.load('/textures/bricks/roughness.jpg');

const grassColorTexture = textureLoader.load('/textures/grass/color.jpg');
const grassAmbientOcclusionTexture = textureLoader.load('/textures/grass/ambientOcclusion.jpg');
const grassNormalTexture = textureLoader.load('/textures/grass/normal.jpg');
const grassRoughnessTexture = textureLoader.load('/textures/grass/roughness.jpg');

const particleTexture = textureLoader.load('/textures/particles/1.png');

grassColorTexture.repeat.set(8, 8);
grassAmbientOcclusionTexture.repeat.set(8, 8);
grassNormalTexture.repeat.set(8, 8);
grassRoughnessTexture.repeat.set(8, 8);

grassColorTexture.wrapS = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;

grassColorTexture.wrapT = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;

// Fog
const fog = new THREE.Fog('#262837', 1, 15);
scene.fog = fog;

/**
 * House
-------------------------------------------------------------
 */
const houseParameters = {
    width: 4,
    height: 2.5,
    depth: 4,
};

// Group
const house = new THREE.Group();
scene.add(house);

// Walls
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(houseParameters.width, houseParameters.height, houseParameters.depth),
    new THREE.MeshStandardMaterial({
        map: bricksColorTexture,
        aoMap: bricksAmbientOcclusionTexture,
        normalMap: bricksNormalTexture,
        roughnessMap: bricksRoughnessTexture,
    })
);
walls.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2));
walls.position.y = houseParameters.height / 2;
house.add(walls);

// Roof
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1, 4),
    new THREE.MeshStandardMaterial({ color: '#b35f45' })
);
roof.position.y = houseParameters.height + 0.5;
roof.rotation.y = Math.PI / 4;
house.add(roof);

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({
        map: grassColorTexture,
        aoMap: grassAmbientOcclusionTexture,
        normalMap: grassNormalTexture,
        roughnessMap: grassRoughnessTexture,
    })
);
floor.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2));
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
scene.add(floor);

// Door
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
    new THREE.MeshStandardMaterial({
        map: doorColorTexture,
        transparent: true,
        alphaMap: doorAlphaTexture,
        aoMap: doorAmbientOcclusionTexture,
        displacementMap: doorHeightTexture,
        displacementScale: 0.1,
        normalMap: doorNormalTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture,
    })
);
door.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2));
door.position.y = 1;
door.position.z = houseParameters.depth / 2 + 0.01;
house.add(door);

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' });

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(0.5, 0.5, 0.5);
bush1.position.set(0.8, 0.2, 2.2);

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(0.25, 0.25, 0.25);
bush2.position.set(1.4, 0.1, 2.1);

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.set(0.4, 0.4, 0.4);
bush3.position.set(-0.8, 0.1, 2.2);

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
bush4.scale.set(0.15, 0.15, 0.15);
bush4.position.set(-1, 0.05, 2.6);

const flicker = new THREE.Mesh(bushGeometry, bushMaterial);
flicker.position.set(0, 0, 0);
house.add(bush1, bush2, bush3, bush4);

// Graves
const graves = new THREE.Group();
scene.add(graves);

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({ color: '#b2b6b1' });

for (let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 5 + Math.random() * 9;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;

    const grave = new THREE.Mesh(graveGeometry, graveMaterial);
    grave.position.set(x, 0.3, z);
    grave.rotation.y = (Math.random() - 0.5) * 0.4;
    grave.rotation.z = (Math.random() - 0.5) * 0.4;
    grave.castShadow = true;
    graves.add(grave);
}

// Rain
const rainGui = gui.addFolder('rain');
let rainParameters = {
    rainCount: 400000,
};

const rainGeo = new THREE.BufferGeometry();

const rainDrop = new Float32Array(rainParameters.rainCount * 3);

for (let i = 0; i < rainParameters.rainCount; i++) {
    rainDrop[i] = (Math.random() - 0.5) * 150;
}
rainGeo.setAttribute('position', new THREE.BufferAttribute(rainDrop, 3));

const rainMaterial = new THREE.PointsMaterial();
rainMaterial.color = new THREE.Color('#aaaaaa');
rainMaterial.size = 0.05;
rainMaterial.sizeAttenuation = true;
rainMaterial.transparent = true;
rainMaterial.alphaMap = particleTexture;

const rain = new THREE.Points(rainGeo, rainMaterial);
rain.position.z = -60;
scene.add(rain);

rainGui.add(rainParameters, 'rainCount').min(1000).max(1000000).step(1000);

/**
 * Lights
-------------------------------------------------------------
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12);
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001);
gui.add(ambientLight, 'visible');
scene.add(ambientLight);

// Directional light
const moonLight = new THREE.DirectionalLight('#ffffff', 0.5);
moonLight.position.set(4, 5, -2);
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001);
gui.add(moonLight.position, 'x').min(-10).max(10).step(0.001);
gui.add(moonLight.position, 'y').min(-10).max(10).step(0.001);
gui.add(moonLight.position, 'z').min(-10).max(10).step(0.001);
scene.add(moonLight);

const moonLightHelper = new THREE.DirectionalLightHelper(moonLight, 0.2);
scene.add(moonLightHelper);
moonLightHelper.visible = false;
gui.add(moonLight, 'visible').name('moon light');
gui.add(moonLightHelper, 'visible').name('helper');
// Door Light
const doorLight = new THREE.PointLight('#ff7d46', 1, 7);
doorLight.position.set(0, 2.2, 2.7);
house.add(doorLight);

gui.add(doorLight, 'intensity').min(0).max(5).step(0.001);
gui.add(doorLight, 'visible').name('door light');

/**
 * Ghost
 */
const ghost1 = new THREE.PointLight('#ff00ff', 2, 3);
scene.add(ghost1);

const ghost2 = new THREE.PointLight('#00ffff', 2, 3);
scene.add(ghost2);

const ghost3 = new THREE.PointLight('#ffff00', 2, 3);
scene.add(ghost3);

/**
 * Sizes
-------------------------------------------------------------
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
-------------------------------------------------------------
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
-------------------------------------------------------------
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor('#262837');

/**
 * Shadows
-------------------------------------------------------------
 */
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

moonLight.castShadow = true;
doorLight.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;

walls.castShadow = true;
bush1.castShadow = true;
bush2.castShadow = true;
bush3.castShadow = true;
bush4.castShadow = true;
// grave shadow on grave loop

floor.receiveShadow = true;

doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.mapSize.far = 7;

ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.mapSize.far = 7;

ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.mapSize.far = 7;

ghost3.shadow.mapSize.width = 256;
ghost3.shadow.mapSize.height = 256;
ghost3.shadow.mapSize.far = 7;

/**
 * Animate
-------------------------------------------------------------
 */
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    rain.rotation.x = elapsedTime * 0.2;

    // Update ghosts
    const ghost1Angle = elapsedTime * 0.5;
    ghost1.position.x = Math.cos(ghost1Angle) * 4;
    ghost1.position.z = Math.sin(ghost1Angle) * 4;
    ghost1.position.y = Math.sin(elapsedTime * 3);

    const ghost2Angle = -elapsedTime * 0.32;
    ghost2.position.x = Math.cos(ghost2Angle) * 6;
    ghost2.position.z = Math.sin(ghost2Angle) * 6;
    ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);

    const ghost3Angle = -elapsedTime * 0.18;
    ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32));
    ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5));
    ghost3.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);

    doorLight.intensity = flicker.position.y;

    // Update controls
    controls.update();
    rain.geometry.attributes.position.needsUpdate = true;
    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
