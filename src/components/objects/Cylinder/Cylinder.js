import {
    Group,
    CylinderGeometry,
    MeshBasicMaterial,
    MeshStandardMaterial,
    Mesh,
    BackSide,
    TextureLoader,
    RepeatWrapping,
} from 'three';

const NUM_NEON_TUBES = 16;

class Cylinder extends Group {
    constructor() {
        super();
        const geometry = new CylinderGeometry(150, 150, 1000, 32, 1, true);
        const texture = new TextureLoader().load('/src/components/assets/Pipe002_1K_Roughness.jpg');
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(24, 24);
        const material = new MeshStandardMaterial({
            side: BackSide,
            map: texture,
            color: 0x1982C4
        });
        this.add(new Mesh(geometry, material));

        // Neon tubes
        for (let i = 0; i < NUM_NEON_TUBES; i++) {
            let geometry = new CylinderGeometry(1, 1, 1000, 16, 1, true);
            const material = new MeshBasicMaterial({
                color: 0x1982C4
            });
            let neonTube = new Mesh(geometry, material);
            let angle = 2 * Math.PI / NUM_NEON_TUBES * i;
            neonTube.position.set(140 * Math.cos(angle), 0, 140 * Math.sin(angle));
            this.add(neonTube);
        }

        // return this;
    }
}

export default Cylinder;
