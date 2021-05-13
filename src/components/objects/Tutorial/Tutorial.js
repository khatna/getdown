import {
    Group,
    PlaneGeometry,
    MeshBasicMaterial,
    Mesh,
    TextureLoader
} from 'three';

class Tutorial extends Group {
    constructor() {
        super();
        this.loaded = false;
        const geometry = new PlaneGeometry(14, 8);
        const texture = new TextureLoader().load('/src/components/assets/tutorial.jpg', (function(em) {
            this.loaded = true;
        }).bind(this));
        const material = new MeshBasicMaterial({map: texture});
        const plane = new Mesh(geometry, material);
        plane.position.set(0, 3, -5);
        plane.scale.multiplyScalar(0.5);
        this.add(plane);
    }
}

export default Tutorial;