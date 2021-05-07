// Controls and basic physics. Code adapted from
// https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html

import { Vector3, Raycaster, Box3 } from 'three';

// size of player's body
const BODY_SIZE = 2;

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
        this.scene = scene;
        this.fallDistance = 0;
        this.landedHeight = null;

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
    }

    // update the origin of each corner raycaster properly
    updateRaycasters() {
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

    jump() {
        if (!this.jumping && this.landed) this.velocity.y += 40;
        this.jumping = true;
        this.landed = false;
    }

    update(timeStamp) {
        if (this.prevTimestamp == -1) {
            this.prevTimestamp = timeStamp;
        }

        if (this.controls.isLocked) {
            const delta = (timeStamp - this.prevTimestamp) / 1000;
            let player = this.controls.getObject();

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
            this.velocity.y -= 9.8 * 10.0 * delta; // Mass = 30.0

            // intersection - bottom
            this.updateRaycasters();
            let intersects = this.getIntersections();
            if (intersects.length > 0 && this.velocity.y < 0) {
                let dist = intersects[0].distance;
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
            return;
        }
    }
}

export default Controller;