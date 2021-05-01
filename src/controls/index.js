// Controls and basic physics. Code adapted from
// https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html

import { Vector3, Raycaster, PerspectiveCamera } from 'three';

export class Controller {
    constructor(document, controls) {
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
        this.raycaster = new Raycaster(
            new Vector3(),
            new Vector3(0, -1, 0),
            0, 5
        );

        this.gravityEnabled = false;

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
    }

    jump() {
        if (!this.jumping && this.landed) this.velocity.y += 100;
        this.jumping = true;
        this.landed = false;
    }

    update(timeStamp, scene) {
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
                this.velocity.z -= this.direction.z * 100.0 * delta;
            }
            if (this.moveLeft || this.moveRight) {
                this.velocity.x -= this.direction.x * 100.0 * delta;
            }

            // gravity
            this.velocity.y -= 9.8 * 20.0 * delta; // Mass = 20.0

            // intersection
            this.raycaster.ray.origin.copy(player.position);
            let intersections = this.raycaster.intersectObjects(
                scene.platforms
            );
            if (intersections.length > 0 && this.velocity.y < 0) {
                this.velocity.y = 0;
                this.landed = true;
            }

            // movement
            this.controls.moveRight(-this.velocity.x * delta);
            this.controls.moveForward(-this.velocity.z * delta);
            player.position.y += this.velocity.y * delta;

            // Move up and down for debugging purposes
            if (this.moveUp) {
                this.controls.getObject().position.y += 5;
            } else if (this.moveDown) {
                this.controls.getObject().position.y -= 5;
            }

            this.prevTimestamp = timeStamp;
            return;
        }
    }
}
