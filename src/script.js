// Importing necessary modules from the THREE.js library
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene(); // Create a new scene to hold objects
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // Set up a camera with a field of view of 75 degrees
const renderer = new THREE.WebGLRenderer(); // Initialize WebGL renderer
renderer.setSize(window.innerWidth, window.innerHeight); // Set the size of the renderer to match the window size
document.body.appendChild(renderer.domElement); // Append the renderer to the body of the HTML document

// Camera positioning to zoom in slightly and view the objects in the scene
camera.position.z = 10;

// Define custom shaders for the light cube (a glowing cube) material
const cubeVertexShader = `
varying vec3 vPosition; // Pass the vertex position to the fragment shader

void main() {
  vPosition = position; // Store the vertex position
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); // Standard transformation to screen space
}
`;

const cubeFragmentShader = `
varying vec3 vPosition; // Receive the vertex position from the vertex shader

void main() {
  float intensity = 1.5 / length(vPosition); // The intensity of the glow is inversely proportional to the distance from the origin
  gl_FragColor = vec4(vec3(1.0), intensity); // Set the color to white with varying intensity
}
`;

// Create a glowing light cube using the defined shaders
const lightCubeMaterial = new THREE.ShaderMaterial({
    vertexShader: cubeVertexShader,
    fragmentShader: cubeFragmentShader,
    blending: THREE.AdditiveBlending, // Make the light blend additively, so it appears as a glow
    transparent: true, // Make the cube material transparent for a glowing effect
});
const pointLight = new THREE.PointLight(0xffffff, 1, 10); // Create a point light with white color and a distance of 10
pointLight.position.set(0, 0, 5); // Set the point light's position
scene.add(pointLight); // Add the light to the scene

// Define the geometry of the light cube and add it to the scene
const lightCubeGeometry = new THREE.BoxGeometry(1, 1, 1); // Create a 1x1x1 cube geometry
const lightCube = new THREE.Mesh(lightCubeGeometry, lightCubeMaterial); // Create a mesh with the geometry and material
lightCube.position.set(0, 0, 1); // Position the light cube slightly off-center
scene.add(lightCube); // Add the light cube to the scene

// Initialize variables for alphabet and digit shader materials
let shaderMaterialAlphabet, shaderMaterialDigit;

// Load a font to use for 3D text
const fontLoader = new FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    const abc = 314; // The last three digits + 200 for ambient intensity calculation
    const ambientIntensity = abc / 1000; // Set ambient intensity based on a custom calculation

    // Vertex shader for alphabetic characters (e.g., plastic-like appearance)
    const alphabetVertexShader = `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
        vNormal = normalize(normal); // Normalize the vertex normal for lighting calculations
        vec4 worldPosition = modelMatrix * vec4(position, 1.0); // Transform position to world space
        vWorldPosition = worldPosition.xyz;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); // Apply model-view-projection transformation
    }
    `;

    // Fragment shader for alphabetic characters (simulating a plastic material)
    const alphabetFragmentShader = `
    uniform vec3 lightPosition;
    uniform vec3 baseColor;
    uniform float ambientIntensity;

    varying vec3 vNormal;
    varying vec3 vWorldPosition; // The world position of the fragment

    void main() {
        vec3 lightDir = normalize(lightPosition - vWorldPosition); // Direction of the light source
        float diffuse = max(dot(vNormal, lightDir), 0.0); // Diffuse lighting (Lambert's Law)
        vec3 viewDir = normalize(-vWorldPosition);
        vec3 reflectDir = reflect(-lightDir, vNormal); // Reflection vector for specular highlight
        float specular = pow(max(dot(viewDir, reflectDir), 0.0), 16.0); // Specular reflection with shininess of 16
        vec3 ambient = baseColor * ambientIntensity; // Ambient lighting effect
        vec3 diffuseColor = baseColor * diffuse; // Diffuse color based on light direction
        vec3 specularColor = vec3(1.0) * specular; // Specular highlight (shininess)
        gl_FragColor = vec4(ambient + diffuseColor + specularColor, 1.0); // Combine lighting effects
    }
    `;

    // Vertex shader for numeric characters (e.g., metal-like appearance)
    const digitVertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
        vNormal = normalize(normal); // Normalize the vertex normal for lighting
        vPosition = position; // Store the position of the vertex
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); // Apply transformations
    }
    `;

    // Fragment shader for numeric characters (simulating a metallic material)
    const digitFragmentShader = `
    uniform vec3 lightPosition;
    uniform vec3 baseColor;
    uniform float ambientIntensity;

    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
        vec3 lightDir = normalize(lightPosition - vPosition); // Light direction
        float diffuse = max(dot(vNormal, lightDir), 0.0); // Diffuse component
        vec3 viewDir = normalize(-vPosition);
        vec3 reflectDir = reflect(-lightDir, vNormal); // Specular reflection
        float specular = pow(max(dot(viewDir, reflectDir), 0.0), 64.0); // Shininess of the metal
        vec3 ambient = baseColor * ambientIntensity; // Ambient light contribution
        vec3 diffuseColor = baseColor * diffuse; // Diffuse light
        vec3 specularColor = baseColor * specular; // Specular highlights for metallic effect
        gl_FragColor = vec4(ambient + diffuseColor + specularColor, 1.0); // Combine all components
    }
    `;

    // Create ShaderMaterials for alphabetic and numeric text
    shaderMaterialAlphabet = new THREE.ShaderMaterial({
        uniforms: {
            lightPosition: { value: lightCube.position }, // Light position for shading
            baseColor: { value: new THREE.Color(0, 0.455, 0.455) }, // Base color for alphabet (plastic-like greenish tone)
            ambientIntensity: { value: ambientIntensity }, // Ambient lighting intensity
        },
        vertexShader: alphabetVertexShader,
        fragmentShader: alphabetFragmentShader,
    });

    shaderMaterialDigit = new THREE.ShaderMaterial({
        uniforms: {
            lightPosition: { value: lightCube.position }, // Light position for shading
            baseColor: { value: new THREE.Color(1, 0.545, 0.545) }, // Base color for digit (metal-like red tone)
            ambientIntensity: { value: ambientIntensity }, // Ambient lighting intensity
        },
        vertexShader: digitVertexShader,
        fragmentShader: digitFragmentShader,
    });

    // Create and position the 3D text meshes for 'S' (plastic-like) and '4' (metal-like)
    const textGeometryLeft = new TextGeometry('S', {
        font: font,
        size: 2.5, // Set the size of the text
        height: 0.5, // Set the depth of the text
    });

    const textGeometryRight = new TextGeometry('4', {
        font: font,
        size: 2.5, // Set the size of the text
        height: 0.5, // Set the depth of the text
    });

    const textMeshLeft = new THREE.Mesh(textGeometryLeft, shaderMaterialAlphabet); // Create the mesh for 'S'
    textMeshLeft.position.set(-4, 0, 0); // Position the 'S' to the left
    scene.add(textMeshLeft); // Add the text mesh to the scene

    const textMeshRight = new THREE.Mesh(textGeometryRight, shaderMaterialDigit); // Create the mesh for '4'
    textMeshRight.position.set(2, 0, 0); // Position the '4' to the right
    scene.add(textMeshRight); // Add the text mesh to the scene
});

// Animation loop to render the scene continuously
function animate() {
    requestAnimationFrame(animate); // Request the next animation frame

    // Update shader materials to reflect the light position change
    if (shaderMaterialAlphabet && shaderMaterialDigit) {
        shaderMaterialAlphabet.uniforms.lightPosition.value.copy(lightCube.position);
        shaderMaterialDigit.uniforms.lightPosition.value.copy(lightCube.position);
    }

    renderer.render(scene, camera); // Render the scene from the camera's perspective
}
animate();

// Add interactivity with keydown events to control light cube and camera movement
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w': // Move the light cube up
            lightCube.position.y += 0.5;
            break;
        case 's': // Move the light cube down
            lightCube.position.y -= 0.5;
            break;
        case 'a': // Move the camera left
            camera.position.x -= 0.5;
            break;
        case 'd': // Move the camera right
            camera.position.x += 0.5;
            break;
    }
});
