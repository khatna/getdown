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
        this.cylinderOriginal = new Mesh(geometry, material);
        this.controls = controls;
        this.initialized = false;
    }

    update(timeStamp) {
        if (!this.initialized) {
            // Set up cylinders
            this.cylinderCenter = this.cylinderOriginal.clone();
            this.cylinderBottom = this.cylinderOriginal.clone();
            this.cylinderTop = this.cylinderOriginal.clone();
            this.cylinderBottom.position.y = -1000;
            this.cylinderTop.position.y = 1000;
            this.add(this.cylinderCenter, this.cylinderBottom, this.cylinderTop);
            this.thresholdBottom = -500;
            this.thresholdTop = 500;
            this.initialized = true;
        }
        if (this.controls.getObject().position.y < this.thresholdBottom) {
            this.remove(this.cylinderTop);
            this.cylinderTop = this.cylinderCenter;
            this.cylinderCenter = this.cylinderBottom;
            this.cylinderBottom = this.cylinderOriginal.clone();
            this.cylinderBottom.position.y = this.thresholdBottom - 1500;
            this.add(this.cylinderBottom);
            this.thresholdBottom -= 1000;
            this.thresholdTop -= 1000;
        }
        // Shouldn't be applicable in this game, but here for completeness:
        if (this.controls.getObject().position.y > this.thresholdTop) {
            this.remove(this.cylinderBottom);
            this.cylinderBottom = this.cylinderCenter;
            this.cylinderCenter = this.cylinderTop;
            this.cylinderTop = this.cylinderOriginal.clone();
            this.cylinderTop.position.y = this.thresholdTop + 1500;
            this.add(this.cylinderTop);
            this.thresholdBottom += 1000;
            this.thresholdTop += 1000;
        }
    }
}

export default Cylinder;
