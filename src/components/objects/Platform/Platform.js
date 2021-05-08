import {
    Group,
    BoxGeometry,
    Mesh,
    Vector3,
    ShaderMaterial,
    BackSide,
    FrontSide,
    MeshStandardMaterial,
    Shape,
    ExtrudeBufferGeometry,
    DoubleSide
} from 'three';

const PLATFORM_MAIN_LENGTH = 6;
const PLATFORM_THICKNESS = 1;

// SHADERS ADAPTED FROM EXAMPLE: https://discourse.threejs.org/t/how-to-render-geometry-edges/5745

const vertexShader = `
varying vec3 vPos;
void main()	{
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
`

const fragmentShader = `
varying vec3 vPos;
uniform vec3 size;
uniform float thickness;
uniform float smoothness;
uniform vec3 color;

void main() {
        
    float a = smoothstep(thickness, thickness + smoothness, length(abs(vPos.xy) - size.xy));
    a *= smoothstep(thickness, thickness + smoothness, length(abs(vPos.yz) - size.yz));
    a *= smoothstep(thickness, thickness + smoothness, length(abs(vPos.xz) - size.xz));
    
    vec3 c = mix(vec3(0), color, a);
    
    gl_FragColor = vec4(c, 1.0);
}
`

class Platform extends Group {
    constructor() {
        super();

        this.warpable = false;

        // Ref: https://discourse.threejs.org/t/round-edged-box/1402
        let shape = new Shape();
        let radius = 0.5;
        let frameWidth = 1;
        shape.absarc(0, 0, 0, -Math.PI / 2, -Math.PI, true);
        shape.absarc(0, PLATFORM_MAIN_LENGTH -  radius * 2, 0, Math.PI, Math.PI / 2, true);
        shape.absarc(PLATFORM_MAIN_LENGTH - radius * 2, PLATFORM_MAIN_LENGTH -  radius * 2, 0, Math.PI / 2, 0, true);
        shape.absarc(PLATFORM_MAIN_LENGTH - radius * 2, 0, 0, 0, -Math.PI / 2, true);
        let hole = new Shape();
        hole.absarc(frameWidth, frameWidth, 0, -Math.PI / 2, -Math.PI, true);
        hole.absarc(frameWidth, PLATFORM_MAIN_LENGTH - radius * 2 - frameWidth, 0, Math.PI, Math.PI / 2, true);
        hole.absarc(PLATFORM_MAIN_LENGTH - radius * 2 - frameWidth, PLATFORM_MAIN_LENGTH -  radius * 2 - frameWidth, 0, Math.PI / 2, 0, true);
        hole.absarc(PLATFORM_MAIN_LENGTH - radius * 2 - frameWidth, frameWidth, 0, 0, -Math.PI / 2, true);
        shape.holes = [hole];
        let platformMainGeometry = new ExtrudeBufferGeometry(shape, {
            depth: PLATFORM_THICKNESS - radius * 2,
            bevelEnabled: true,
            bevelSegments: 4,
            steps: 1,
            bevelSize: radius,
            bevelThickness: radius,
            curveSegments: 0
        });
        platformMainGeometry.rotateX(Math.PI / 2);
        
        platformMainGeometry.center();

        let platformCenterGeometry = new BoxGeometry(
            PLATFORM_MAIN_LENGTH,
            PLATFORM_THICKNESS - 0.25,
            PLATFORM_MAIN_LENGTH
        );

        // MATERIAL ADAPTED FROM EXAMPLE: 
        
        // let platformMaterial = new ShaderMaterial({
        //     uniforms: {
        //         size: {
        //             value: new Vector3(
        //                 platformMainGeometry.parameters.width, 
        //                 platformMainGeometry.parameters.height, 
        //                 platformMainGeometry.parameters.depth
        //             ).multiplyScalar(0.5)
        //         },
        //         thickness: {
        //             value: 0.05
        //         },
        //         smoothness: {
        //             value: 0.1
        //         },
        //         color: {
        //             value: new Vector3(0.8, 0.8, 0.8)
        //         }
        //     },
        //     vertexShader: vertexShader,
        //     fragmentShader: fragmentShader
        //   });
        // this.add(new Mesh(platformMainGeometry, platformMaterial));

        let platformMaterial = new MeshStandardMaterial({color: 0x8AC926, side: DoubleSide});
        let platformCenterMaterial = new MeshStandardMaterial({color: 0xffffff, side: FrontSide});
        let outlineMaterial = new MeshStandardMaterial({color:0x000000, side: BackSide});

        let group = new Group;
        
        let platform = new Mesh(platformMainGeometry, platformMaterial)
        platform.scale.multiplyScalar(0.95);
        group.add(platform);
        let center = new Mesh(platformCenterGeometry, platformCenterMaterial);
        group.add(center);
        let outline = new Mesh(platformMainGeometry, outlineMaterial);
        group.add(outline);
        this.add(group);

    }
}

export default Platform;
