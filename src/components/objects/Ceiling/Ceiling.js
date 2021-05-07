import {
    Group,
    CircleGeometry,
    MeshBasicMaterial,
    DoubleSide,
    Mesh
} from 'three';

class Ceiling extends Group {
    constructor(controls) {
        super();
        this.controls = controls;
        const geometry = new CircleGeometry(140, 32);
        const material = new MeshBasicMaterial({color: 0xff0000, side: DoubleSide});
        this.ceiling = new Mesh(geometry, material);
        this.ceiling.rotateX(Math.PI / 2);
        this.ceiling.position.y = 50; // Starting position
        this.add(this.ceiling);
        this.prevTimestamp = -1;
        this.distance = 0;
        this.speed = 0;

        // Parameters
        this.baseSpeed = 0.0001;
        this.timeStampFactor = 0.0002;
        this.distanceFactor = 0.001;
    }

    update(timeStamp) {
        if (this.prevTimestamp == -1) {
            this.prevTimestamp = timeStamp;
        }

        const delta = (timeStamp - this.prevTimestamp) / 5000;
        this.distance = this.ceiling.position.y - this.controls.getObject().position.y;

        this.speed =
            (this.baseSpeed +
            this.timeStampFactor * Math.sqrt(timeStamp) +
            this.distanceFactor * this.distance) * delta;
        
        this.ceiling.position.y -= this.speed;
    }
}

export default Ceiling;
