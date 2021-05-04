import {
    Group,
    BoxGeometry,
    MeshPhongMaterial,
    Mesh,
    Vector3,
    Raycaster,
    DoubleSide
} from 'three';

class Platforms extends Group {
    constructor(controls, ceiling) {
        super();

        // Properties of platforms
        this.playAreaLength = 120;
        this.platformDisplayLength = 6;
        this.platformCollisionLength = 7;
        this.platformsPerIteration = 8;
        this.minSpawnDistXZ = 10;
        this.maxSpawnDistXZ = 20;
        this.minSpawnDistDown = 10;
        this.maxSpawnDistDown = 80;
        this.probSpawnBeyondHeightDamage = 0.2;
        this.heightDamageThreshold = 30;
        this.maxNumRetries = 5;
        this.platformSpaceLength = 10;
        this.platformSpaceHeight = 10;
        this.initialSpawnBoxHeight = 60;
        this.spawnUntilY = -1000;
        this.spawnMoreTriggerY = -500;
        this.spawnIntervalY = 1000;

        this.controls = controls;
        this.ceiling = ceiling;
        this.initialized = false;

        let platformMaterial = new MeshPhongMaterial({color: 0x333333, side: DoubleSide});

        let platformDisplayGeometry = new BoxGeometry(
            this.platformDisplayLength,
            0.1,
            this.platformDisplayLength
        );
        this.platformDisplayOriginal = new Mesh(platformDisplayGeometry, platformMaterial);
        
        let platformCollisionGeometry = new BoxGeometry(
            this.platformCollisionLength,
            0.1,
            this.platformCollisionLength
        );
        this.platformCollisionOriginal = new Mesh(platformCollisionGeometry, platformMaterial);

        let platformSpaceGeometry = new BoxGeometry(
            this.platformSpaceLength,
            this.platformSpaceHeight,
            this.platformSpaceLength
        );
        this.platformSpaceOriginal = new Mesh(platformSpaceGeometry, platformMaterial);

        this.p = {
            display: [],
            collision: [],
            space: []
        }
    }

    addPlatform(platformDisplay, platformCollision, platformSpace) {
        this.p.display.push(platformDisplay);
        this.p.collision.push(platformCollision);
        this.p.space.push(platformSpace);
        this.add(platformDisplay);
    }

    spawnPlatform(x, z, minY, maxY, minSpawnDistXZ, maxSpawnDistXZ) {
        // Ref: https://stackoverflow.com/questions/33883843/threejs-raycasting-does-not-work#
        for (let i = 0; i < this.maxNumRetries; i++) {
            let spawnedPlatformPosition = new Vector3(
                x - maxSpawnDistXZ + Math.random() * maxSpawnDistXZ * 2,
                minY + Math.random() * (maxY - minY),
                z - maxSpawnDistXZ + Math.random() * maxSpawnDistXZ * 2
            );
            if (spawnedPlatformPosition.x > x - minSpawnDistXZ &&
                spawnedPlatformPosition.x < x + minSpawnDistXZ &&
                spawnedPlatformPosition.z > z - minSpawnDistXZ &&
                spawnedPlatformPosition.z < z + minSpawnDistXZ) {
                    continue;
            }
            if (spawnedPlatformPosition.x > this.playAreaLength / 2 ||
                spawnedPlatformPosition.x < -this.playAreaLength / 2 ||
                spawnedPlatformPosition.z > this.playAreaLength / 2 ||
                spawnedPlatformPosition.z < -this.playAreaLength / 2) {
                    continue;
            }
            let raycaster = new Raycaster();
            raycaster.set(spawnedPlatformPosition, new Vector3(0, -1, 0))
            const intersects = raycaster.intersectObjects(this.p.space);
            if (intersects.length % 2 == 0) {
                let platformDisplay = this.platformDisplayOriginal.clone();
                let platformCollision = this.platformCollisionOriginal.clone();
                let platformSpace = this.platformSpaceOriginal.clone();
                platformDisplay.position.set(
                    spawnedPlatformPosition.x,
                    spawnedPlatformPosition.y,
                    spawnedPlatformPosition.z
                );
                platformCollision.position.set(
                    spawnedPlatformPosition.x,
                    spawnedPlatformPosition.y,
                    spawnedPlatformPosition.z
                );
                platformSpace.position.set(
                    spawnedPlatformPosition.x,
                    spawnedPlatformPosition.y,
                    spawnedPlatformPosition.z
                );
                platformCollision.updateMatrixWorld();
                platformSpace.updateMatrixWorld();
                this.addPlatform(platformDisplay, platformCollision, platformSpace);
                return spawnedPlatformPosition;
            }
        }
        return null;
    }

    update(timeStamp) {
        if (!this.initialized) {
            // Initial platform at (0, 0, 0) and additional platforms
            for (let i = 0; i < this.platformsPerIteration; i++) {
                if (i > 0) {
                    this.spawnPlatform(
                        0,
                        0,
                        -this.playAreaLength / 2,
                        this.playAreaLength / 2,
                        0,
                        this.playAreaLength / 2
                    );
                } else {
                    this.spawnPlatform(0, 0, 0, 0, 0, 0);
                }
            }
        }
        // Remove platforms
        for (let i = this.p.display.length - this.platformsPerIteration - 1; i >= 0; i--) {
            if (this.p.display[i].position.y > this.ceiling.position.y) {
                this.remove(this.p.display[i]);
                this.p.display.splice(i, 1);
                this.p.collision.splice(i, 1);
                this.p.space.splice(i, 1);
            }
        }
        // Add platforms
        if (!this.initialized || this.controls.getObject().position.y < this.spawnMoreTriggerY) {
            let stop = false;
            while (!stop) {
                let startIndex = this.p.display.length - this.platformsPerIteration;
                let endIndex = this.p.display.length;
                for (let i = startIndex; i < endIndex; i++) {
                    let actualMaxSpawnDistDown = this.heightDamageThreshold;
                    if (Math.random() < this.probSpawnBeyondHeightDamage) {
                        actualMaxSpawnDistDown = this.maxSpawnDistDown;
                    }
                    let spawnedPlatformPosition = this.spawnPlatform(
                        this.p.display[i].position.x,
                        this.p.display[i].position.z,
                        this.p.display[i].position.y - actualMaxSpawnDistDown,
                        this.p.display[i].position.y - this.minSpawnDistDown,
                        this.minSpawnDistXZ,
                        this.maxSpawnDistXZ
                    );
                    if (spawnedPlatformPosition === null) {
                        this.spawnPlatform(
                            0,
                            0,
                            this.p.display[i].position.y - this.maxSpawnDistDown,
                            this.p.display[i].position.y - this.minSpawnDistDown,
                            0,
                            this.playAreaLength / 2
                        );
                    } else if (spawnedPlatformPosition.y <= this.spawnUntilY) {
                        stop = true;
                    }
                }
            }
            if (this.initialized) {
                this.spawnMoreTriggerY -= this.spawnIntervalY;
            }
            this.initialized = true;
            this.spawnUntilY -= this.spawnIntervalY;
        }
    }
}

export default Platforms;
