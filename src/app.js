/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, SpotLight } from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { SeedScene } from 'scenes';
import { Controller } from './controller';
import { Hud } from './hud';
import { animateDeath } from './controller/deathAnimation';

// Initialize core ThreeJS components
const camera = new PerspectiveCamera(60, 1);
const renderer = new WebGLRenderer({ antialias: true });

// Set up camera
camera.position.set(0, 3, 0);
// camera.lookAt(new Vector3(0, 0, 0));
// const spotlight = new SpotLight(0xffffff, 1.6, 7, 0.8, 1, 1);
// spotlight.position.set(0, 0, 10);
// camera.add(spotlight);

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

// Pause and timekeeping
let pause = true;
let gameTimeStamp = 0;
let prevTimeStamp = null;
let startTimeStamp = null;

// Set up camera control - click mouse to lock cursor and go to FPS mode
const controls = new PointerLockControls(camera, canvas);

// Set up scene
const scene = new SeedScene(controls, renderer);

// Gameplay controller
const controller = new Controller(document, controls, scene);

// HUD
const hud = new Hud();

document.body.addEventListener('mousedown', function () {
    if (pause) {
        controls.lock();
    } else if (!gameOver) {
        if (!controller.warp()) {
            controller.jump();
        }
    }
});

document.body.addEventListener('mouseup', function () {
    controller.jumping = false;
});

document.body.addEventListener('dblclick', function () {
    if (gameOver) {
        location.reload();
    }
});

controls.addEventListener('lock', function () {
    hud.resumeGame();
    pause = false;
    prevTimeStamp = null;
    scene.removeTutorial();
    window.requestAnimationFrame(onAnimationFrameHandler);
});

controls.addEventListener('unlock', function () {
    hud.pauseGame();
    pause = true;
});

// Health
let health = 1.0;
let gameOver = false;
const fallDamageFactor = 0.01;
const fallDamageThreshold = 5 * 8.29;
const calculateHealth = () => {
    let adjustment = 0;
    // Fall damage
    adjustment -= Math.max(0, fallDamageFactor * (controller.fallDistance - fallDamageThreshold));
    if (adjustment < 0) {
        hud.setDamageCoverOpacity(-adjustment * 4);
    }
    // Ceiling damage
    if (controller.landed && controls.getObject().position.y + 2 >= scene.ceiling.position.y) {
        adjustment = -1.0;
    }
    // Automatic game over
    if ((controller.landedHeight - controls.getObject().position.y - fallDamageThreshold) * fallDamageFactor >= 1.5) {
        adjustment = -1.0;
    }
    health = Math.max(0, Math.min(1, health + adjustment));
    if (health == 0) {
        gameOver = true;
        hud.gameOver();
        return;
    }
    // Health up
    if (controller.healthUp) {
        health = Math.min(1, health + 0.3);
        if (adjustment == 0)
            hud.setHealthUpCoverOpacity(0.5);
    }
}

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    if (startTimeStamp === null)
        startTimeStamp = timeStamp;
    if (prevTimeStamp !== null)
        gameTimeStamp += timeStamp - prevTimeStamp;
    prevTimeStamp = timeStamp;
    renderer.render(scene, camera);
    if (!gameOver) {
        scene.update && scene.update(gameTimeStamp);
        if (scene.ceiling.loaded)
            controller.update(gameTimeStamp);
    } else {
        animateDeath(camera);
    }

    // hud.setDebugMsg(controller.landed);
    calculateHealth();
    if (!gameOver && !controller.justWarped && controller.fallDistance > 0) {
        hud.addFallDistanceToScore(controller.fallDistance);
    }
    controller.fallDistance = 0;
    hud.updateHealth(health);
    if (!gameOver) {
        hud.updateCeilingDistance(scene.ceiling.position.y - (controls.getObject().position.y + 2));
    }
    hud.setFallingCoverOpacity(Math.max(0, Math.min(
        1, (controller.landedHeight - controls.getObject().position.y - fallDamageThreshold) / 150)));
    if (!pause || !scene.ceiling.loaded || !scene.tutorial.loaded) {
        window.requestAnimationFrame(onAnimationFrameHandler);
    }
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);
