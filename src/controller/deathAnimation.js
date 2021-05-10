import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';

let animationStarted = false;

export function animateDeath(camera) {
    if (!animationStarted) {
        // const tilt = new TWEEN.tween(camera.position)
        //     .to({})

        const fallDown = new TWEEN.Tween(camera.position)
            .to({ y: camera.position.y - 2.75 }, 500)
            .easing(TWEEN.Easing.Quadratic.Out);
        
        fallDown.start();
    
        animationStarted = true;
    } else {
        TWEEN.update();
    }
}