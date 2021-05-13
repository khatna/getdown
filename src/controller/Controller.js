// Controls and basic physics. Code adapted from
// https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html

import { Vector3, Raycaster } from 'three';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';

// constants
const BODY_SIZE = 2;
const WARPABLE_DIST = 20;

// Controller class
class Controller {
    constructor(document, controls, scene) {
        this.velocity = new Vector3();
        this.direction = new Vector3();
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;
        this.jumping = false;
        this.landed = true;
        this.document = document;
        this.controls = controls;
        this.prevTimestamp = -1;
        this.bottomRaycasters = [];
        this.topRaycasters = [];
        this.warpRaycaster = null;
        this.scene = scene;
        this.fallDistance = 0;
        this.warping = false;
        this.landedHeight = null;
        this.justWarped = false;
        this.highlightedPlatform = null;

        // Keyboard controls
        const onKeyDown = event => {
            switch (event.code) {
                case 'KeyW':
                    this.moveForward = true;
                    break;

                case 'KeyA':
                    this.moveLeft = true;
                    break;

                case 'KeyS':
                    this.moveBackward = true;
                    break;

                case 'KeyD':
                    this.moveRight = true;
                    break;

                case 'Space':
                    this.jump();
                    break;

                case 'ArrowUp':
                    this.moveUp = true;
                    break;

                case 'ArrowDown':
                    this.moveDown = true;
                    break;
            }
        };

        const onKeyUp = event => {
            switch (event.code) {
                case 'KeyW':
                    this.moveForward = false;
                    break;

                case 'KeyA':
                    this.moveLeft = false;
                    break;

                case 'KeyS':
                    this.moveBackward = false;
                    break;

                case 'KeyD':
                    this.moveRight = false;
                    break;

                case 'Space':
                    this.jumping = false;
                    break;

                case 'ArrowUp':
                    this.moveUp = false;
                    break;

                case 'ArrowDown':
                    this.moveDown = false;
                    break;
            }
        };

        this.document.addEventListener('keydown', onKeyDown);
        this.document.addEventListener('keyup', onKeyUp);
        this.document.addEventListener('mousedown', this.warp.bind(this));

        // Initialize raycasters
        this.initializeRaycasters();
    }

    initializeRaycasters() {
        // center bottom, top
        this.bottomRaycasters.push(
            new Raycaster(
                this.controls.getObject().position,
                new Vector3(0, -1, 0),
                0, 5
            )
        );

        this.topRaycasters.push(
            new Raycaster(
                this.controls.getObject().position,
                new Vector3(0, 1, 0),
                0, 1
            )
        );

        // corners of bounding box
        for (let i = 0; i < 5; i++) {
            this.bottomRaycasters.push(
                new Raycaster(
                    new Vector3(),
                    new Vector3(0, -1, 0),
                    0, 5
                )
            );
            this.topRaycasters.push(
                new Raycaster(
                    new Vector3(),
                    new Vector3(0, 1, 0),
                    0, 1
                )
            );
        }

        // forward raycaster (for warping)
        this.warpRaycaster = new Raycaster(
            this.controls.getObject().position,
            new Vector3(),
            0
        );
    }

    // update the origin of each raycaster properly
    updateRaycasters() {
        // collision raycasters
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                let dx = (2 * i - 1) * BODY_SIZE / 2;
                let dz = (2 * j - 1) * BODY_SIZE / 2;
                let brc = this.bottomRaycasters[1 + i * 2 + j];
                let trc = this.topRaycasters[1 + i * 2 + j];
                brc.ray.origin.copy(this.controls.getObject().position);
                trc.ray.origin.copy(this.controls.getObject().position);
                brc.ray.origin.x += dx;
                brc.ray.origin.z += dz;
                trc.ray.origin.x += dx;
                trc.ray.origin.z += dz;
            }
        }

        // warp raycaster
        let quaternion = this.controls.getObject().quaternion;
        let lookAtVector = new Vector3(0, 0, -1);
        lookAtVector.applyQuaternion(quaternion);
        this.warpRaycaster.ray.direction = lookAtVector;
    }

    // check whether there is a collision (-y direction)
    getIntersections(top = false) {
        let rcs;
        if (top)
            rcs = this.topRaycasters;
        else
            rcs = this.bottomRaycasters;
        
        let intersects = [];
        for (let i = 0; i < 5; i++) {
            let rc = rcs[i];
            let collision = [...this.scene.platforms.collision];
            collision.push(this.scene.ceiling.ceiling);
            intersects = rc.intersectObjects(collision);
            if (intersects.length > 0) {
                break;
            }
        }
        return intersects;
    }

    warp() {
        if (this.controls.isLocked && this.landed) {
            this.warping = true;
            let rc = this.warpRaycaster;
            let objs = this.scene.platforms.collision;
            let intersects = rc.intersectObjects(objs);
            if (intersects.length > 0) {
                let p = intersects[0].object;
                let pPos = p.position;
                let currPos = this.controls.getObject().position;
                if (p.warpable && Math.abs(currPos.y - pPos.y) < WARPABLE_DIST) {
                    let warpTween = new TWEEN.Tween(this.controls.getObject().position)
                    .to({
                        x: p.position.x,
                        y: p.position.y + 3.5,
                        z: p.position.z
                    }, 100)
                    .easing(TWEEN.Easing.Quadratic.Out);
                    warpTween.start();
                    warpTween.onComplete(() => {
                        this.landedHeight = p.position.y + 3.5;
                        this.landed = true;
                        this.warping = false;
                        this.scene.platformsObj.updateWarpablePlatforms(currPos, WARPABLE_DIST);
                    });
                    return true;
                }
            }
        }
        return false;
    }

    jump() {
        if (!this.jumping && this.landed) this.velocity.y += 40;
        this.jumping = true;
        this.landed = false;
    }

    update(timeStamp) {
        let player = this.controls.getObject();

        if (this.prevTimestamp == -1) {
            this.prevTimestamp = timeStamp;
        }

        // check if crosshair is on warpable platform, color accordingly
        let rc = this.warpRaycaster;
        let objs = this.scene.platforms.collision;
        let intersects = rc.intersectObjects(objs);

        // check if previously highlighted platform is no longer highlighted
        if (intersects.length == 0 && this.highlightedPlatform != null) {
            if (!intersects.some(obj => obj.uuid === this.highlightedPlatform.uuid)) {
                this.highlightedPlatform.main.updateUnhighlightedPlatform();
                this.highlightedPlatform = null;
            }
        }

        if (intersects.length > 0) {;
            let obj = intersects[0].object;

            if (obj.warpable && Math.abs(obj.position.y - player.position.y) < WARPABLE_DIST) {
                this.document.querySelector("#crosshair img").style.filter = "none";
                let main = obj.main;
                main.updateHighlightedPlatform();
                this.highlightedPlatform = obj;
            }
            else {
                this.document.querySelector("#crosshair img").style.filter = "grayscale(100%)";
            }
        }
        else {
            this.document.querySelector("#crosshair img").style.filter = "grayscale(100%)";
        }

        if (this.controls.isLocked) {
            const delta = (timeStamp - this.prevTimestamp) / 1000;

            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;

            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize(); // this ensures consistent movements in all directions

            if (this.moveForward || this.moveBackward) {
                this.velocity.z -= this.direction.z * 200.0 * delta;
            }
            if (this.moveLeft || this.moveRight) {
                this.velocity.x -= this.direction.x * 200.0 * delta;
            }

            // gravity
            this.velocity.y -= 9.8 * 10.0 * delta;

            // intersection - bottom
            this.updateRaycasters();
            let intersects = this.getIntersections();
            if (intersects.length > 0 && this.velocity.y < 0) {
                let intersect = intersects[0];
                let dist = intersect.distance;
                let diff = 3 - dist;
                player.position.y += diff;
                this.velocity.y = 0;
                if (this.landedHeight === null) {
                    this.landedHeight = player.position.y;
                }
                if (!this.landed) {
                    this.fallDistance = this.landedHeight - player.position.y;
                    this.landedHeight = player.position.y;
                    this.landed = true;
                    this.justWarped = this.warping;

                    if (intersect.object.health) {
                        intersect.object.health = false;
                        intersect.object.main.updateNormalPlatform();
                    }

                    // show warpable platforms after landing
                    this.scene.platformsObj.updateWarpablePlatforms(player.position, WARPABLE_DIST);

                }
            } else if (intersects.length == 0) {
                this.landed = false;
            }

            // intersection - top
            intersects = this.getIntersections(true);
            if (intersects.length > 0 && this.velocity.y > 0) {
                this.velocity.y *= -1; // perfect bounce
            }

            // movement
            this.controls.moveRight(-this.velocity.x * delta);
            this.controls.moveForward(-this.velocity.z * delta);
            player.position.y += this.velocity.y * delta;

            // Move up and down for debugging purposes
            // if (this.moveUp) {
            //     this.controls.getObject().position.y += 5;
            // } else if (this.moveDown) {
            //     this.controls.getObject().position.y -= 5;
            // }

            this.prevTimestamp = timeStamp;

            // update tweens
            TWEEN.update();

            return;
        }
    }
}

export default Controller;