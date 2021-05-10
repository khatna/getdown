import {
    Group,
    CircleGeometry,
    MeshBasicMaterial,
    Mesh,
    PMREMGenerator,
    TextureLoader,
    CylinderGeometry,
    RepeatWrapping,
    MeshStandardMaterial,
    BackSide
} from 'three';

const CYLINDER_RADIUS = 150;

class Ceiling extends Group {
    constructor(controls, renderer) {
        super();

        this.controls = controls;
        const geometry = new CircleGeometry(CYLINDER_RADIUS - 10, 128);
        const texture = new TextureLoader().load('/src/components/assets/SheetMetal001_1K_Roughness.jpg');
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(10, 10);
        const material = new MeshBasicMaterial({
            color: 0xFF595E,
            map: texture
        });
        this.ceiling = new Mesh(geometry, material);
        this.ceiling.rotateX(Math.PI / 2);
        this.ceiling.position.y = 2.5;
        this.position.y = 50; // Starting position
        this.add(this.ceiling);
        this.prevTimestamp = -1;
        this.distance = 0;
        this.speed = 0;
        
        new TextureLoader().load('/src/components/assets/Pipe002_1K_Color.jpg', (function(em) {

            // Ref: https://stackoverflow.com/questions/65974012/three-js-how-to-add-envmap-correctly

            const pmremGenerator = new PMREMGenerator(renderer);
            pmremGenerator.compileEquirectangularShader();
            const envMap = pmremGenerator.fromEquirectangular(em).texture;
            pmremGenerator.dispose();
            // this.ceiling.material.envMap = envMap;
            // this.ceiling.material.needsUpdate = true;

            // Spike definition
            const geometry = new CylinderGeometry(2, 0, 4.25, 16, 1, true);
            const material = new MeshStandardMaterial({
                color: 0xFF595E,
                metalness: 1.0,
                envMapIntensity: 1.0,
                roughness: 0.0,
                envMap: envMap
            });
            const outlineMaterial = new MeshStandardMaterial({color:0x000000, side: BackSide});

            const spike = new Mesh(geometry, material);
            const spikeOutline = new Mesh(geometry, outlineMaterial);
            spikeOutline.scale.multiplyScalar(1.3)
            
            // Add spikes
            for (let x = -CYLINDER_RADIUS; x < CYLINDER_RADIUS; x += 5) {
                for (let z = -CYLINDER_RADIUS; z < CYLINDER_RADIUS; z += 5) {
                    if (x**2 + z ** 2 > (CYLINDER_RADIUS - 15) ** 2) continue;
                    let spikeClone = spike.clone();
                    spikeClone.position.set(x, 0, z);
                    this.add(spikeClone);
                    let spikeOutlineClone = spikeOutline.clone();
                    spikeOutlineClone.position.set(x, 0, z);
                    this.add(spikeOutlineClone);
                }
            }

            this.loaded = true;

        }).bind(this));

        // Parameters
        this.baseSpeed = 0.0001;
        this.timeStampFactor = 0.0002;
        this.distanceFactor = 0.001;
    }

    update(timeStamp) {
        if (this.prevTimestamp == -1) {
            this.prevTimestamp = timeStamp;
        }

        if (!this.loaded) return;

        const delta = (timeStamp - this.prevTimestamp) / 10;
        this.distance = this.position.y - this.controls.getObject().position.y;

        this.speed =
            (this.baseSpeed +
            this.timeStampFactor * Math.sqrt(timeStamp) +
            this.distanceFactor * this.distance) * delta;
        
        this.position.y -= this.speed;
        this.prevTimestamp = timeStamp;
    }
}

export default Ceiling;
