import * as Dat from 'dat.gui';
import {
    Scene,
    Color,
    Fog,
} from 'three';
// import { Flower, Land } from 'objects';
import { BasicLights } from 'lights';
import { Cylinders } from '../objects/Cylinders';
import { Platforms } from '../objects/Platforms';
import { Ceiling } from '../objects/Ceiling';
import { Particles } from '../objects/Particles';

class SeedScene extends Scene {
    constructor(controls, renderer, camera) {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 1,
            updateList: [],
        };

        // Background and fog
        let background_and_fog_color = new Color(0x062030);
        this.background =  background_and_fog_color;
        this.fog = new Fog(background_and_fog_color, 100, 250);

        // Lights
        const lights = new BasicLights();
        this.add(lights);

        // Cylinders
        const cylinders = new Cylinders(controls);
        this.add(cylinders);
        this.addToUpdateList(cylinders);

        // Ceiling
        const ceiling = new Ceiling(controls, renderer);
        this.add(ceiling);
        this.addToUpdateList(ceiling);
        this.ceiling = ceiling;

        // Platforms
        const platforms = new Platforms(controls, ceiling.ceiling);
        this.add(platforms);
        this.addToUpdateList(platforms);
        this.platforms = platforms.p;

        // Particles
        const particles = new Particles(controls);
        this.add(particles);
        this.addToUpdateList(particles);

        // Populate GUI
        // this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        // this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default SeedScene;
