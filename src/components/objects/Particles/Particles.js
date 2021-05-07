import {
    Group,
    TextureLoader,
    SpriteMaterial,
    Sprite,
    Vector3
} from 'three';

const MAX_NUM_PARTICLES = 200;
const GENERATION_PROB = 1;
const MIN_PARTICLE_DIST = 10;
const MAX_PARTICLE_DIST = 30;
const GENERATION_BOX_LEN = 50;
const MIN_PARTICLE_LIFETIME = 1000;
const MAX_PARTICLE_LIFETIME = 2000;
const PARTICLE_SIZE = 0.2;

class Particles extends Group {
    constructor(controls) {
        super();
        this.controls = controls;
        const map = new TextureLoader().load('/src/components/assets/glowCircle.png');
        const material = new SpriteMaterial({map: map});
        this.particleSpriteOriginal = new Sprite(material);
        this.particleSpriteOriginal.material.transparent = true;
        this.particleSpriteOriginal.scale.set(PARTICLE_SIZE, PARTICLE_SIZE, 1)
        this.particles = {
            sprites: [],
            startTimes: [],
            startPos: [],
            directions: [],
            distances: [],
            lifetimes: [],
        }
    }

    randFromTo(from, to) {
        return from + Math.random() * (to - from);
    }

    update(timeStamp) {
        // Create new particles
        if (this.particles.sprites.length < MAX_NUM_PARTICLES) {
            let pos = this.controls.getObject().position;
            // if (Math.random() < GENERATION_PROB) {
                let particleSprite = this.particleSpriteOriginal.clone();
                particleSprite.material = this.particleSpriteOriginal.material.clone();
                let startTime = timeStamp;
                let startPos = new Vector3(
                    this.randFromTo(pos.x - GENERATION_BOX_LEN / 2, pos.x + GENERATION_BOX_LEN / 2),
                    this.randFromTo(pos.y - GENERATION_BOX_LEN / 2, pos.y + GENERATION_BOX_LEN / 2),
                    this.randFromTo(pos.z - GENERATION_BOX_LEN / 2, pos.z + GENERATION_BOX_LEN / 2)
                );
                let direction = new Vector3(
                    this.randFromTo(-1, 1),
                    this.randFromTo(-1, 1),
                    this.randFromTo(-1, 1)
                ).normalize();
                let distance = this.randFromTo(MIN_PARTICLE_DIST, MAX_PARTICLE_DIST);
                let lifetime = this.randFromTo(MIN_PARTICLE_LIFETIME, MAX_PARTICLE_LIFETIME);
                this.particles.sprites.push(particleSprite);
                this.particles.startTimes.push(startTime);
                this.particles.startPos.push(startPos);
                this.particles.directions.push(direction);
                this.particles.distances.push(distance);
                this.particles.lifetimes.push(lifetime);
                this.add(particleSprite);
            // }
        }

        let toDelete = [];

        // Move particles
        for (let i = 0; i < this.particles.sprites.length; i++) {
            let progress = (timeStamp - this.particles.startTimes[i]) / this.particles.lifetimes[i];
            if (progress > 1) {
                toDelete.push(i);
            } else {
                let opacity = (Math.sin(2 * Math.PI * progress - Math.PI / 2) + 1) / 2;
                this.particles.sprites[i].material.opacity = opacity;
                let pos = this.particles.startPos[i]
                    .clone()
                    .add(
                        this.particles.directions[i].clone().multiplyScalar(progress)
                    );
                this.particles.sprites[i].position.set(
                    pos.x,
                    pos.y,
                    pos.z
                );
            }
        }

        // Delete particles
        for (let i = this.particles.sprites.length - 1; i >= 0; i--) {
            if (toDelete.indexOf(i) != -1) {
                this.remove(this.particles.sprites[i]);
                this.particles.sprites.splice(i, 1);
                this.particles.startTimes.splice(i, 1);
                this.particles.startPos.splice(i, 1);
                this.particles.directions.splice(i, 1);
                this.particles.distances.splice(i, 1);
                this.particles.lifetimes.splice(i, 1);
            }
        }

    }
}

export default Particles;
