/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, Vector3 } from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { SeedScene } from 'scenes';
import { Controller } from './controller';
import { Hud } from './hud';

// Initialize core ThreeJS components
const camera = new PerspectiveCamera(60, 1, 0.001);
const renderer = new WebGLRenderer({ antialias: true });

// Set up camera
camera.position.set(0, 3, 0);
// camera.lookAt(new Vector3(0, 0, 0));

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
const scene = new SeedScene(controls);

// Gameplay controller
const controller = new Controller(document, controls, scene);

// HUD
const hud = new Hud();

document.body.addEventListener('mousedown', function () {
    if (gameOver) {
        location.reload();
    } else if (pause) {
        controls.lock();
    } else {
        controller.jump();
    }
});

document.body.addEventListener('mouseup', function () {
    controller.jumping = false;
});

controls.addEventListener('lock', function () {
    scene.state.gui.hide();
    hud.resumeGame();
    pause = false;
    prevTimeStamp = null;
    window.requestAnimationFrame(onAnimationFrameHandler);
});

controls.addEventListener('unlock', function () {
    scene.state.gui.show();
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
    if ((controller.landedHeight - controls.getObject().position.y - fallDamageThreshold) * fallDamageFactor >= 1.0) {
        adjustment = -1.0;
    }
    health = Math.max(0, Math.min(1, health + adjustment));
    if (health == 0) {
        gameOver = true;
        hud.gameOver();
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
        controller.update(gameTimeStamp);
    }
    hud.setDebugMsg(controller.fallDistance);
    calculateHealth();
    if (!gameOver && controller.fallDistance > 0) {
        hud.addFallDistanceToScore(controller.fallDistance);
    }
    controller.fallDistance = 0;
    hud.updateHealth(health);
    hud.updateCeilingDistance(scene.ceiling.position.y - (controls.getObject().position.y + 2));
    hud.setFallingCoverOpacity(Math.max(0, Math.min(
        1, (controller.landedHeight - controls.getObject().position.y - fallDamageThreshold) / 100)));
    if (!pause || gameTimeStamp - startTimeStamp < 200) {
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
