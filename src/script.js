import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

// Set up scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 10;

// Light cube shader materials
const cubeVertexShader = `
varying vec3 vPosition;

void main() {
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const cubeFragmentShader = `
varying vec3 vPosition;

void main() {
  float intensity = 1.0 / length(vPosition) * 0.8;
  gl_FragColor = vec4(vec3(1.0), intensity);
}
`;

const lightCubeMaterial = new THREE.ShaderMaterial({
    vertexShader: cubeVertexShader,
    fragmentShader: cubeFragmentShader,
    blending: THREE.AdditiveBlending,
    transparent: true,
});

const lightCubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const lightCube = new THREE.Mesh(lightCubeGeometry, lightCubeMaterial);
lightCube.position.set(0, 0, 0);
scene.add(lightCube);

// Load font and create 3D text
const fontLoader = new FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    // Vertex and fragment shaders for characters
    const charVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal = normal;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `;

    const charFragmentShader = `
  uniform vec3 lightPosition;
  uniform vec3 baseColor;
  uniform float ambientIntensity;

  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 lightDir = normalize(lightPosition - vPosition);
    float diffuse = max(dot(vNormal, lightDir), 0.0);
    
    vec3 ambient = baseColor * ambientIntensity;
    vec3 diffuseColor = baseColor * diffuse;
    
    gl_FragColor = vec4(ambient + diffuseColor, 1.0);
  }
  `;

    const lightPosition = new THREE.Vector3(0, 0, 0); // Posisi cube sebagai sumber cahaya
    const abc = 314; // Last ID + 200
    const ambientIntensity = abc / 1000;

    const shaderMaterialAlphabet = new THREE.ShaderMaterial({
        uniforms: {
            lightPosition: { value: lightPosition },
            baseColor: { value: new THREE.Color(0, 0.455, 0.455) },
            ambientIntensity: { value: ambientIntensity },
        },
        vertexShader: charVertexShader,
        fragmentShader: charFragmentShader,
    });

    const shaderMaterialDigit = new THREE.ShaderMaterial({
        uniforms: {
            lightPosition: { value: lightPosition },
            baseColor: { value: new THREE.Color(1, 0.545, 0.545) },
            ambientIntensity: { value: ambientIntensity },
        },
        vertexShader: charVertexShader,
        fragmentShader: charFragmentShader,
    });

    // Create text geometries
    const textGeometryLeft = new TextGeometry('S', {
        font: font,
        size: 1,
        height: 0.2,
    });

    const textGeometryRight = new TextGeometry('4', {
        font: font,
        size: 1,
        height: 0.2,
    });

    const textMeshLeft = new THREE.Mesh(textGeometryLeft, shaderMaterialAlphabet);
    textMeshLeft.position.set(-5, 0, 0);
    scene.add(textMeshLeft);

    const textMeshRight = new THREE.Mesh(textGeometryRight, shaderMaterialDigit);
    textMeshRight.position.set(5, 0, 0);
    scene.add(textMeshRight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update light position for shaders
    lightCube.position.x += 0; // Change if moving light dynamically
    renderer.render(scene, camera);
}
animate();

// Add interactivity (step 6)
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w': // Move light cube up
            lightCube.position.y += 0.5;
            break;
        case 's': // Move light cube down
            lightCube.position.y -= 0.5;
            break;
        case 'a': // Move camera left
            camera.position.x -= 0.5;
            break;
        case 'd': // Move camera right
            camera.position.x += 0.5;
            break;
    }
});