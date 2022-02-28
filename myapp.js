// three.js
let camera, scene, renderer;
let isUserInteracting = false,
  lon = 0, lat = 0,
  phi = 0, theta = 0,
  onPointerDownPointerX = 0,
  onPointerDownPointerY = 0,
  onPointerDownLon = 0,
  onPointerDownLat = 0;
const distance = 50;
// three.js end

// const manifestUri ='https://bitmovin-a.akamaihd.net/content/playhouse-vr/m3u8s/105560.m3u8';
const manifestUri = "http://123.30.172.11:2290/origin01/360/master.m3u8";

function initApp() {
  // Install built-in polyfills to patch browser incompatibilities.
  shaka.polyfill.installAll();

  // Check to see if the browser supports the basic APIs Shaka needs.
  if (shaka.Player.isBrowserSupported()) {
    // Everything looks good!
    initPlayer();
  } else {
    // This browser does not have the minimum set of APIs we need.
    console.error('Browser not supported!');
  }
}

async function initPlayer() {
  // Create a Player instance.
  const video = document.getElementById('video');
  const container = document.getElementById('container');
  const player = new shaka.Player(video);

  // threejs
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
  scene = new THREE.Scene();
  const geometry = new THREE.SphereGeometry(500, 60, 40);
  // invert the geometry on the x-axis so that all of the faces point inward
  geometry.scale(- 1, 1, 1);
  const texture = new THREE.VideoTexture(video);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  renderer = new THREE.WebGLRenderer();
  console.log("ykuta", container);
  renderer.setSize(640, 480);
  container.appendChild(renderer.domElement);
  document.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);
  window.addEventListener('resize', onWindowResize);
  animate();
  // three.js end

  // Attach player to the window to make it easy to access in the JS console.
  window.player = player;

  // Listen for error events.
  player.addEventListener('error', onErrorEvent);

  // Try to load a manifest.
  // This is an asynchronous process.
  try {
    await player.load(manifestUri);
    // This runs if the asynchronous load is successful.
    console.log('The video has now been loaded!');
  } catch (e) {
    // onError is executed if the asynchronous load fails.
    onError(e);
  }
}

function playVideo() {
  const video = document.getElementById('video');
  video.play();
}

function pauseVideo() {
  const video = document.getElementById('video');
  video.pause();
}

function onErrorEvent(event) {
  // Extract the shaka.util.Error object from the event.
  onError(event.detail);
}

function onError(error) {
  // Log the error.
  console.error('Error code', error.code, 'object', error);
}

// threejs
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerDown(event) {
  isUserInteracting = true;
  onPointerDownPointerX = event.clientX;
  onPointerDownPointerY = event.clientY;
  onPointerDownLon = lon;
  onPointerDownLat = lat;
}

function onPointerMove(event) {
  if (isUserInteracting === true) {
    lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
    lat = (onPointerDownPointerY - event.clientY) * 0.1 + onPointerDownLat;
  }

}

function onPointerUp() {
  isUserInteracting = false;
}

function animate() {
  requestAnimationFrame(animate);
  update();
}

function update() {
  lat = Math.max(- 85, Math.min(85, lat));
  phi = THREE.MathUtils.degToRad(90 - lat);
  theta = THREE.MathUtils.degToRad(lon);
  camera.position.x = distance * Math.sin(phi) * Math.cos(theta);
  camera.position.y = distance * Math.cos(phi);
  camera.position.z = distance * Math.sin(phi) * Math.sin(theta);
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}
document.addEventListener('DOMContentLoaded', initApp);
// three.js end