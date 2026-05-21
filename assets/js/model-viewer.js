import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

const container = document.getElementById('model-viewer');
if (!container) throw new Error('找不到 #model-viewer');

const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
camera.position.set(0, 0, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1.2));
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(3, 5, 3);
scene.add(dirLight);
const fillLight = new THREE.DirectionalLight(0x8888ff, 0.5);
fillLight.position.set(-3, -1, 2);
scene.add(fillLight);

let model = null;
const loader = new GLTFLoader();
loader.load(
  'assets/img/Hitem3d-1779088523732.glb',
  (gltf) => {
    model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const scale = 2 / Math.max(size.x, size.y, size.z);
    model.scale.setScalar(scale);
    model.position.sub(center.multiplyScalar(scale));
    scene.add(model);
  },
  undefined,
  (error) => console.error('GLB 載入失敗：', error)
);

const targetRotation = { x: 0, y: 0 };
const currentRotation = { x: 0, y: 0 };
const maxAngle = 0.3;

document.addEventListener('mousemove', (e) => {
  targetRotation.y = ((e.clientX / window.innerWidth) * 2 - 1) * maxAngle;
  targetRotation.x = ((e.clientY / window.innerHeight) * 2 - 1) * maxAngle * 0.5;
});

window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

function animate() {
  requestAnimationFrame(animate);
  if (model) {
    currentRotation.x += (targetRotation.x - currentRotation.x) * 0.06;
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.06;
    model.rotation.x = currentRotation.x;
    model.rotation.y = currentRotation.y;
  }
  renderer.render(scene, camera);
}
animate();
