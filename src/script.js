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
  float intensity = 1.5 / length(vPosition); // Increased intensity multiplier
  gl_FragColor = vec4(vec3(1.0), intensity);
}
`;

const lightCubeMaterial = new THREE.ShaderMaterial({
    vertexShader: cubeVertexShader,
    fragmentShader: cubeFragmentShader,
    blending: THREE.AdditiveBlending,
    transparent: true,
});
const pointLight = new THREE.PointLight(0xffffff, 1, 10);
pointLight.position.set(0, 0, 5);
scene.add(pointLight);

const lightCubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const lightCube = new THREE.Mesh(lightCubeGeometry, lightCubeMaterial);
lightCube.position.set(0, 0, 1);
scene.add(lightCube);

let shaderMaterialAlphabet, shaderMaterialDigit;

// Load font and create 3D text
const fontLoader = new FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    const abc = 314; // Last three digits + 200
    const ambientIntensity = abc / 1000;

    const alphabetVertexShader = `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
        vNormal = normalize(normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `;

    const alphabetFragmentShader = `
    uniform vec3 lightPosition;
    uniform vec3 baseColor;
    uniform float ambientIntensity;

    varying vec3 vNormal;
    varying vec3 vWorldPosition; // Posisi dunia objek

    void main() {
        vec3 lightDir = normalize(lightPosition - vWorldPosition);
        float diffuse = max(dot(vNormal, lightDir), 0.0);
        vec3 viewDir = normalize(-vWorldPosition);
        vec3 reflectDir = reflect(-lightDir, vNormal);
        float specular = pow(max(dot(viewDir, reflectDir), 0.0), 16.0); // Shininess lebih rendah
        vec3 ambient = baseColor * ambientIntensity;
        vec3 diffuseColor = baseColor * diffuse;
        vec3 specularColor = vec3(1.0) * specular;
        gl_FragColor = vec4(ambient + diffuseColor + specularColor, 1.0);
    }
    `;

    const digitVertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
        vNormal = normalize(normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `;


    const digitFragmentShader = `
    uniform vec3 lightPosition;
    uniform vec3 baseColor;
    uniform float ambientIntensity;

    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
        vec3 lightDir = normalize(lightPosition - vPosition);
        float diffuse = max(dot(vNormal, lightDir), 0.0);
        vec3 viewDir = normalize(-vPosition);
        vec3 reflectDir = reflect(-lightDir, vNormal); 
        float specular = pow(max(dot(viewDir, reflectDir), 0.0), 64.0);
        vec3 ambient = baseColor * ambientIntensity;
        vec3 diffuseColor = baseColor * diffuse;
        vec3 specularColor = baseColor * specular;
        gl_FragColor = vec4(ambient + diffuseColor + specularColor, 1.0);
    }
    `;


    shaderMaterialAlphabet = new THREE.ShaderMaterial({
        uniforms: {
            lightPosition: { value: lightCube.position },
            baseColor: { value: new THREE.Color(0, 0.455, 0.455) },
            ambientIntensity: { value: ambientIntensity },
        },
        vertexShader: alphabetVertexShader,
        fragmentShader: alphabetFragmentShader,
    });

    shaderMaterialDigit = new THREE.ShaderMaterial({
        uniforms: {
            lightPosition: { value: lightCube.position },
            baseColor: { value: new THREE.Color(1, 0.545, 0.545) },
            ambientIntensity: { value: ambientIntensity },
        },
        vertexShader: digitVertexShader,
        fragmentShader: digitFragmentShader,
    });


    const textGeometryLeft = new TextGeometry('S', {
        font: font,
        size: 2.5,
        height: 0.5,
    });

    const textGeometryRight = new TextGeometry('4', {
        font: font,
        size: 2.5,
        height: 0.5,
    });

    const textMeshLeft = new THREE.Mesh(textGeometryLeft, shaderMaterialAlphabet);
    textMeshLeft.position.set(-4, 0, 0);
    scene.add(textMeshLeft);

    const textMeshRight = new THREE.Mesh(textGeometryRight, shaderMaterialDigit);
    textMeshRight.position.set(2, 0, 0);
    scene.add(textMeshRight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update shader uniforms for light position
    if (shaderMaterialAlphabet && shaderMaterialDigit) {
        shaderMaterialAlphabet.uniforms.lightPosition.value.copy(lightCube.position);
        shaderMaterialDigit.uniforms.lightPosition.value.copy(lightCube.position);
    }

    renderer.render(scene, camera);
}
animate();

// Add interactivity
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w': // Move cube up
            lightCube.position.y += 0.5;
            break;
        case 's': // Move cube down
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
