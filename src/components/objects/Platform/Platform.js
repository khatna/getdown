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

const drawRoundedSquare = (a, b) => {
    let shape = new Shape();
    shape.absarc(a, a, 0, -Math.PI / 2, -Math.PI, true);
    shape.absarc(a, b, 0, Math.PI, Math.PI / 2, true);
    shape.absarc(b, b, 0, Math.PI / 2, 0, true);
    shape.absarc(b, a, 0, 0, -Math.PI / 2, true);
    return shape;
}

class Platform extends Group {
    constructor() {
        super();

        // Ref: https://discourse.threejs.org/t/round-edged-box/1402
        let radius = 0.5;
        let frameWidth = 1;
        let shape = drawRoundedSquare(0, PLATFORM_MAIN_LENGTH -  radius * 2);
        let hole = drawRoundedSquare(frameWidth, PLATFORM_MAIN_LENGTH - radius * 2 - frameWidth);
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

        this.platformMaterial = new MeshStandardMaterial({color: 0xFFCA3A, side: DoubleSide});
        this.platformCenterMaterial = new MeshStandardMaterial({color: 0xffffff, side: FrontSide});
        this.outlineMaterial = new MeshStandardMaterial({color:0x000000, side: BackSide});

        let group = new Group;
        
        let platform = new Mesh(platformMainGeometry, this.platformMaterial)
        platform.scale.multiplyScalar(0.95);
        group.add(platform);
        let center = new Mesh(platformCenterGeometry, this.platformCenterMaterial);
        group.add(center);
        let outline = new Mesh(platformMainGeometry, this.outlineMaterial);
        group.add(outline);

        this.add(group);

        this.collapsing = false;
    }

    collapse(timeStamp) {
        if (!this.collapsing) {
            this.remove.apply(this, this.children);
            let shape = drawRoundedSquare(0, 2);
            let geometry = new ExtrudeBufferGeometry(shape, {
                depth: 3,
                bevelEnabled: true,
                bevelSegments: 4,
                steps: 1,
                bevelSize: 1,
                bevelThickness: 1,
                curveSegments: 0
            });
            this.pieces = [];
            this.fallSpeed = [];
            this.rotateSpeedX = [];
            this.rotateSpeedY = [];
            this.rotateSpeedZ = [];
            for (let x = -1; x <= 1; x++) {
                for (let z = -1; z <= 1; z++) {
                    let piece = new Mesh(
                        geometry,
                        Math.random() > 0.5
                            ? this.platformMaterial
                            : this.platformCenterMaterial
                    );
                    piece.position.x = x * 3;
                    piece.position.z = z * 3;
                    piece.rotateX(Math.random());
                    piece.rotateY(Math.random());
                    piece.rotateZ(Math.random());
                    piece.scale.multiplyScalar(0.5);
                    piece.material.transparent = true;
                    this.pieces.push(piece);
                    this.fallSpeed.push(0.2 + Math.random());
                    this.rotateSpeedX.push(Math.random() / 50);
                    this.rotateSpeedY.push(Math.random() / 50);
                    this.rotateSpeedZ.push(Math.random() / 50);
                    this.add(piece);
                }
            }
            this.collapsing = true;
            this.prevTimestamp = timeStamp;
        } else {
            const delta = (timeStamp - this.prevTimestamp) / 300;
            for (let i = 0; i < this.pieces.length; i++) {
                this.pieces[i].position.y -= this.fallSpeed[i] * delta;
                this.pieces[i].rotateX(this.rotateSpeedX[i] * delta);
                this.pieces[i].rotateY(this.rotateSpeedY[i] * delta);
                this.pieces[i].rotateZ(this.rotateSpeedZ[i] * delta);
                this.pieces[i].material.opacity -= 0.005 * delta;
            }
        }
    }

    updateColorWarpable() {
        this.children[0].children[1].material.color.setHex(0x8AC926);
    }
}

export default Platform;
