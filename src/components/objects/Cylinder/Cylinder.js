import {
    Group,
    CylinderGeometry,
    MeshBasicMaterial,
    Mesh,
    BackSide,
    TextureLoader,
    RepeatWrapping
} from 'three';

class Cylinder extends Group {
    constructor(controls) {
        super();
        const geometry = new CylinderGeometry(80, 80, 1000, 32, 1, true);
        const texture = new TextureLoader().load('/src/components/assets/wall.jpg')
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(6, 12);
        const material = new MeshBasicMaterial({color:0x003080, side: BackSide, map: texture});
        this.cylinder_original = new Mesh(geometry, material);
        this.controls = controls;
        this.initialized = false;
    }

    update(timeStamp) {
        if (!this.initialized) {
            // Set up cylinders
            this.cylinder_center = this.cylinder_original.clone();
            this.cylinder_bottom = this.cylinder_original.clone();
            this.cylinder_bottom.position.y = -1000;
            this.add(this.cylinder_center, this.cylinder_bottom);
            this.threshold_bottom = -500;
            this.initialized = true;
        }
        if (this.controls.getObject().position.y < this.threshold_bottom) {
            this.cylinter_center = this.cylinder_bottom;
            this.cylinder_bottom = this.cylinder_original.clone();
            this.cylinder_bottom.position.y = this.threshold_bottom - 1500;
            this.add(this.cylinder_bottom);
            this.threshold_bottom -= 1000;
        }
    }
}

export default Cylinder;