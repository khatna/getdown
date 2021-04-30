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
import { Controller } from './controls';
import { Hud } from './hud';

// Initialize core ThreeJS components
const scene = new SeedScene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });

// Set up camera
camera.position.set(6, 3, -10);
camera.lookAt(new Vector3(0, 0, 0));

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
let prevTimeStamp = 0;

// Set up camera control - click mouse to lock cursor and go to FPS mode
const controls = new PointerLockControls(camera, canvas);

// Gameplay controller
const controller = new Controller(document, controls);

// HUD
const hud = new Hud();

document.body.addEventListener('mousedown', function () {
    if (pause) {
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
    prevTimeStamp = 0;
    window.requestAnimationFrame(onAnimationFrameHandler);
});

controls.addEventListener('unlock', function () {
    scene.state.gui.show();
    hud.pauseGame();
    pause = true;
});

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    if (prevTimeStamp > 0)
        gameTimeStamp += timeStamp - prevTimeStamp;
    prevTimeStamp = timeStamp;
    renderer.render(scene, camera);
    scene.update && scene.update(gameTimeStamp);
    controller.update(gameTimeStamp);
    if (!pause) {
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
