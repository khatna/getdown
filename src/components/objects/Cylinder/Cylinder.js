import {
    Group,
    CylinderGeometry,
    MeshStandardMaterial,
    Mesh,
    BackSide,
    TextureLoader,
    RepeatWrapping
} from 'three';

class Cylinder extends Group {
    constructor() {
        super();
        const geometry = new CylinderGeometry(150, 150, 1000, 32, 1, true);
        const texture = new TextureLoader().load('/src/components/assets/MetalPlates005_1K_Color.jpg');
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(12, 12);
        const material = new MeshStandardMaterial({
            side: BackSide,
            map: texture,
            color: 0x6A4C93
        });
        return new Mesh(geometry, material);
    }
}

export default Cylinder;
