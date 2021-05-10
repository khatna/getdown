import { Group, AmbientLight, HemisphereLight } from 'three';

class BasicLights extends Group {
    constructor() {
        super();

        const ambi = new AmbientLight(0xffffff, 0.25);
        const hemi = new HemisphereLight(0xffffff, 0x000000, 0.5);

        // dir.position.set(5, 1, 2);
        // dir.target.position.set(0, 0, 0);

        this.add(ambi, hemi);
    }
}

export default BasicLights;
