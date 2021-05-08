import {
    Group,
    Vector3,
    Raycaster,
    BoxGeometry,
    Mesh,
    MeshPhongMaterial,
    DoubleSide
} from 'three';
import { Platform } from '../Platform';

const PLATFORM_COLLISION_LENGTH = 8;
const PLATFORM_THICKNESS = 1;

class Platforms extends Group {
    constructor(controls, ceiling) {
        super();

        // Properties of platforms
        this.playAreaLength = 120;
        this.platformsPerIteration = 7;
        this.minSpawnDistXZ = 10;
        this.maxSpawnDistXZ = 20;
        this.minSpawnDistDown = 10;
        this.maxSpawnDistDown = 80;
        this.probSpawnBeyondHeightDamage = 0.2;
        this.heightDamageThreshold = 30;
        this.maxNumRetries = 5;
        this.platformSpaceLength = 20;
        this.platformSpaceHeight = 20;
        this.initialSpawnBoxHeight = 60;
        this.spawnUntilY = -500;
        this.spawnMoreTriggerY = -250;
        this.spawnIntervalY = 500;
        this.warpableProb = 0.2;

        this.controls = controls;
        this.ceiling = ceiling;
        this.initialized = false;

        this.platformMainOriginal = new Platform();
        
        let platformMaterial = new MeshPhongMaterial({side: DoubleSide});

        let platformCollisionGeometry = new BoxGeometry(
            PLATFORM_COLLISION_LENGTH,
            PLATFORM_THICKNESS,
            PLATFORM_COLLISION_LENGTH
        );
        this.platformCollisionOriginal = new Mesh(platformCollisionGeometry, platformMaterial);

        let platformSpaceGeometry = new BoxGeometry(
            this.platformSpaceLength,
            this.platformSpaceHeight,
            this.platformSpaceLength
        );
        this.platformSpaceOriginal = new Mesh(platformSpaceGeometry, platformMaterial);

        this.p = {
            main: [],
            collision: [],
            space: []
        }
    }

    addPlatform(platformMain, platformCollision, platformSpace) {
        this.p.main.push(platformMain);
        this.p.collision.push(platformCollision);
        this.p.space.push(platformSpace);
        this.add(platformMain);
    }

    spawnPlatform(x, z, minY, maxY, minSpawnDistXZ, maxSpawnDistXZ, warpable) {
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
                let platformMain = this.platformMainOriginal.clone();
                let platformCollision = this.platformCollisionOriginal.clone();
                let platformSpace = this.platformSpaceOriginal.clone();
                platformMain.position.set(
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
                if (warpable) {
                    platformMain.warpable = true;
                }
                this.addPlatform(platformMain, platformCollision, platformSpace);
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
                        this.playAreaLength / 2,
                        false
                    );
                } else {
                    this.spawnPlatform(0, 0, 0, 0, 0, 0, false);
                }
            }
        }
        // Remove platforms
        for (let i = this.p.main.length - this.platformsPerIteration - 1; i >= 0; i--) {
            if (this.p.main[i].position.y > this.ceiling.position.y) {
                this.remove(this.p.main[i]);
                this.p.main.splice(i, 1);
                this.p.collision.splice(i, 1);
                this.p.space.splice(i, 1);
            }
        }
        // Add platforms
        if (!this.initialized || this.controls.getObject().position.y < this.spawnMoreTriggerY) {
            let stop = false;
            while (!stop) {
                let startIndex = this.p.main.length - this.platformsPerIteration;
                let endIndex = this.p.main.length;
                for (let i = startIndex; i < endIndex; i++) {
                    let actualMaxSpawnDistDown = this.maxSpawnDistDown;
                    let warpable = false;
                    if (Math.random() >= this.probSpawnBeyondHeightDamage) {
                        actualMaxSpawnDistDown = this.heightDamageThreshold;
                        if (Math.random() < this.warpableProb) {
                            warpable = true;
                        }
                    }
                    let spawnedPlatformPosition = this.spawnPlatform(
                        this.p.main[i].position.x,
                        this.p.main[i].position.z,
                        this.p.main[i].position.y - actualMaxSpawnDistDown,
                        this.p.main[i].position.y - this.minSpawnDistDown,
                        this.minSpawnDistXZ,
                        this.maxSpawnDistXZ,
                        warpable
                    );
                    if (spawnedPlatformPosition === null) {
                        this.spawnPlatform(
                            0,
                            0,
                            this.p.main[i].position.y - this.maxSpawnDistDown,
                            this.p.main[i].position.y - this.minSpawnDistDown,
                            0,
                            this.playAreaLength / 2,
                            false
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
