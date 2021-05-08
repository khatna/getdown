import {
    Group,
    BoxGeometry,
    MeshToonMaterial,
    Mesh,
    DoubleSide
} from 'three';

const PLATFORM_MAIN_LENGTH = 6;
const PLATFORM_THICKNESS = 0.5;

class Platform extends Group {
    constructor() {
        super();

        this.warpable = false;

        let platformMainGeometry = new BoxGeometry(
            PLATFORM_MAIN_LENGTH,
            PLATFORM_THICKNESS,
            PLATFORM_MAIN_LENGTH
        );
        let platformMaterial = new MeshToonMaterial({color: 0x333333, side: DoubleSide});

        this.add(new Mesh(platformMainGeometry, platformMaterial));

    }
}

export default Platform;
