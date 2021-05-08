import {
    Group,
    BoxGeometry,
    MeshToonMaterial,
    Mesh,
    Vector3,
    ShaderMaterial,
    BackSide,
    FrontSide,
    MeshPhongMaterial
} from 'three';

const PLATFORM_MAIN_LENGTH = 6;
const PLATFORM_THICKNESS = 0.5;

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

        let platformMainGeometry = new BoxGeometry(
            PLATFORM_MAIN_LENGTH,
            PLATFORM_THICKNESS,
            PLATFORM_MAIN_LENGTH
        );
        // MATERIAL ADAPTED FROM EXAMPLE: 
        /*
        let platformMaterial = new ShaderMaterial({
            uniforms: {
                size: {
                    value: new Vector3(
                        platformMainGeometry.parameters.width, 
                        platformMainGeometry.parameters.height, 
                        platformMainGeometry.parameters.depth
                    ).multiplyScalar(0.5)
                },
                thickness: {
                    value: 0.05
                },
                smoothness: {
                    value: 0
                },
                color: {
                    value: new Vector3(0.2, 0.2, 0.2)
                }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
          });
        this.add(new Mesh(platformMainGeometry, platformMaterial));*/

        let platformMaterial = new MeshToonMaterial({color: 0x000000, side: BackSide});
        let outlineMaterial = new MeshPhongMaterial({color:0x333333, side: FrontSide});

        let group = new Group;
        
        let platform = new Mesh(platformMainGeometry, platformMaterial)
        const s = 1.03
        platform.scale.set(s,s,s)
        group.add(platform);
        let outline = new Mesh(platformMainGeometry, outlineMaterial);
        group.add(outline);
        this.add(group)

    }
}

export default Platform;
