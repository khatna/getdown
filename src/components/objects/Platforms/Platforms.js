import {
    Group,
    BoxGeometry,
    MeshPhongMaterial,
    Mesh
} from 'three';

class Platforms extends Group {
    constructor(controls) {
        super();
        this.playAreaLength = 120;
        this.platformLength = 6;
        this.controls = controls;
        this.initialized = false;
        const geometry = new BoxGeometry(this.platformLength, 0.1, this.platformLength);
        const material = new MeshPhongMaterial({color: 0x333333});
        this.platformOriginal = new Mesh(geometry, material);
        this.platforms = [];
    }

    update(timeStamp) {
        if (!this.initialized) {
            let platform0 = this.platformOriginal.clone();
            this.add(platform0);
            this.platforms.push(platform0);
            let platform1 = this.platformOriginal.clone();
            platform1.position.x -= 6;
            platform1.position.y -= 20;
            this.add(platform1);
            this.platforms.push(platform1);
            let platform1b = this.platformOriginal.clone();
            platform1b.position.z -= 6;
            platform1b.position.y += 3;
            this.add(platform1b);
            this.platforms.push(platform1b);
            let platform2 = this.platformOriginal.clone();
            platform2.position.x += 12;
            this.add(platform2);
            this.platforms.push(platform2);
            let platform3 = this.platformOriginal.clone();
            platform3.position.z += 12;
            this.add(platform3);
            this.platforms.push(platform3);
            let platform4 = this.platformOriginal.clone();
            platform4.position.z += 18;
            this.add(platform4);
            this.platforms.push(platform4);
            let platform5 = this.platformOriginal.clone();
            platform5.position.z += 18;
            platform5.position.y += 7;
            this.add(platform5);
            this.platforms.push(platform5);
            let platform6 = this.platformOriginal.clone();
            platform6.position.x += 6;
            platform6.position.z += 12;
            platform6.position.y += 4;
            this.add(platform6);
            this.platforms.push(platform6);
            this.initialized = true;
        }
    }
}

export default Platforms;
