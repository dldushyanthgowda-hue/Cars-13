// ======================================
// REALISTIC CAR GAME - VERSION 1
// ======================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87ceeb);

// --------------------------------------
// CAMERA
// --------------------------------------

const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);

camera.position.set(0, 5, 10);

// --------------------------------------
// RENDERER
// --------------------------------------

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

// --------------------------------------
// LIGHTING
// --------------------------------------

const sun = new THREE.DirectionalLight(0xffffff, 2);

sun.position.set(100, 150, 100);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

scene.add(sun);

const ambient = new THREE.HemisphereLight(
    0x87ceeb,
    0x446644,
    1
);

scene.add(ambient);

// --------------------------------------
// GROUND
// --------------------------------------

const groundGeometry = new THREE.PlaneGeometry(
    2000,
    2000
);

const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x3c8c3c
});

const ground = new THREE.Mesh(
    groundGeometry,
    groundMaterial
);

ground.rotation.x = -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);

// --------------------------------------
// ROAD
// --------------------------------------

const roadGeometry = new THREE.PlaneGeometry(
    16,
    2000
);

const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x303030,
    roughness: 0.9
});

const road = new THREE.Mesh(
    roadGeometry,
    roadMaterial
);

road.rotation.x = -Math.PI / 2;
road.position.y = 0.02;

road.receiveShadow = true;

scene.add(road);

// --------------------------------------
// ROAD LINES
// --------------------------------------

const lineMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff
});

for (let z = -990; z < 1000; z += 12) {

    const lineGeometry = new THREE.PlaneGeometry(
        0.35,
        6
    );

    const line = new THREE.Mesh(
        lineGeometry,
        lineMaterial
    );

    line.rotation.x = -Math.PI / 2;

    line.position.set(
        0,
        0.04,
        z
    );

    scene.add(line);
}

// --------------------------------------
// ROAD SIDES
// --------------------------------------

const sideMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff
});

for (const x of [-7.8, 7.8]) {

    const sideGeometry = new THREE.BoxGeometry(
        0.3,
        0.05,
        2000
    );

    const side = new THREE.Mesh(
        sideGeometry,
        sideMaterial
    );

    side.position.set(x, 0.05, 0);

    scene.add(side);
}

// --------------------------------------
// CAR
// --------------------------------------

const car = new THREE.Group();

scene.add(car);

// Body

const bodyGeometry = new THREE.BoxGeometry(
    3,
    0.8,
    5
);

const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xcc1111,
    metalness: 0.35,
    roughness: 0.35
});

const body = new THREE.Mesh(
    bodyGeometry,
    bodyMaterial
);

body.position.y = 1;

body.castShadow = true;

car.add(body);

// Cabin

const cabinGeometry = new THREE.BoxGeometry(
    2.5,
    0.8,
    2.4
);

const cabinMaterial = new THREE.MeshStandardMaterial({
    color: 0x111827,
    metalness: 0.1,
    roughness: 0.15
});

const cabin = new THREE.Mesh(
    cabinGeometry,
    cabinMaterial
);

cabin.position.set(
    0,
    1.65,
    -0.25
);

cabin.castShadow = true;

car.add(cabin);

// --------------------------------------
// WHEELS
// --------------------------------------

const wheels = [];

function createWheel(x, z) {

    const geometry = new THREE.CylinderGeometry(
        0.55,
        0.55,
        0.4,
        24
    );

    const material = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.8
    });

    const wheel = new THREE.Mesh(
        geometry,
        material
    );

    wheel.rotation.z = Math.PI / 2;

    wheel.position.set(
        x,
        0.6,
        z
    );

    wheel.castShadow = true;

    car.add(wheel);

    wheels.push(wheel);
}

createWheel(-1.55, 1.6);
createWheel(1.55, 1.6);
createWheel(-1.55, -1.6);
createWheel(1.55, -1.6);

// --------------------------------------
// TREES
// --------------------------------------

function createTree(x, z) {

    const tree = new THREE.Group();

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(
        0.3,
        0.4,
        3,
        8
    );

    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x6b4226
    });

    const trunk = new THREE.Mesh(
        trunkGeometry,
        trunkMaterial
    );

    trunk.position.y = 1.5;

    trunk.castShadow = true;

    tree.add(trunk);

    // Leaves
    const leavesGeometry = new THREE.SphereGeometry(
        1.5,
        12,
        12
    );

    const leavesMaterial = new THREE.MeshStandardMaterial({
        color: 0x176b2c
    });

    const leaves = new THREE.Mesh(
        leavesGeometry,
        leavesMaterial
    );

    leaves.position.y = 3.7;

    leaves.castShadow = true;

    tree.add(leaves);

    tree.position.set(x, 0, z);

    scene.add(tree);
}

// Create trees along road

for (let z = -950; z < 1000; z += 25) {

    createTree(-15 - Math.random() * 8, z);
    createTree(15 + Math.random() * 8, z + 10);
}

// --------------------------------------
// CAR POSITION
// --------------------------------------

car.position.set(
    0,
    0,
    20
);

// --------------------------------------
// PHYSICS
// --------------------------------------

let speed = 0;

let steering = 0;

const maxSpeed = 1.4;
const acceleration = 0.018;
const braking = 0.05;
const friction = 0.008;

let gasPressed = false;
let brakePressed = false;
let leftPressed = false;
let rightPressed = false;

// --------------------------------------
// KEYBOARD CONTROLS
// --------------------------------------

window.addEventListener("keydown", (event) => {

    if (event.key === "ArrowUp" || event.key === "w") {
        gasPressed = true;
    }

    if (event.key === "ArrowDown" || event.key === "s") {
        brakePressed = true;
    }

    if (event.key === "ArrowLeft" || event.key === "a") {
        leftPressed = true;
    }

    if (event.key === "ArrowRight" || event.key === "d") {
        rightPressed = true;
    }
});

window.addEventListener("keyup", (event) => {

    if (event.key === "ArrowUp" || event.key === "w") {
        gasPressed = false;
    }

    if (event.key === "ArrowDown" || event.key === "s") {
        brakePressed = false;
    }

    if (event.key === "ArrowLeft" || event.key === "a") {
        leftPressed = false;
    }

    if (event.key === "ArrowRight" || event.key === "d") {
        rightPressed = false;
    }
});

// --------------------------------------
// MOBILE BUTTONS
// --------------------------------------

function setupButton(id, press, release) {

    const button = document.getElementById(id);

    button.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        press();
    });

    button.addEventListener("pointerup", (e) => {
        e.preventDefault();
        release();
    });

    button.addEventListener("pointerleave", release);
    button.addEventListener("pointercancel", release);
}

setupButton(
    "gas",
    () => gasPressed = true,
    () => gasPressed = false
);

setupButton(
    "brake",
    () => brakePressed = true,
    () => brakePressed = false
);

setupButton(
    "left",
    () => leftPressed = true,
    () => leftPressed = false
);

setupButton(
    "right",
    () => rightPressed = true,
    () => rightPressed = false
);

// --------------------------------------
// GAME LOOP
// --------------------------------------

function updateCar() {

    // Acceleration
    if (gasPressed) {
        speed += acceleration;
    }

    // Braking
    if (brakePressed) {
        speed -= braking;
    }

    // Natural friction
    if (!gasPressed && !brakePressed) {

        if (speed > 0) {
            speed -= friction;
        }

        if (speed < 0) {
            speed += friction;
        }
    }

    // Prevent reverse in Version 1
    speed = Math.max(0, speed);

    // Maximum speed
    speed = Math.min(speed, maxSpeed);

    // Steering
    steering = 0;

    if (leftPressed) {
        steering = 1;
    }

    if (rightPressed) {
        steering = -1;
    }

    // Steering becomes stronger at speed
    car.rotation.y +=
        steering *
        speed *
        0.018;

    // Move car forward
    car.translateZ(-speed);

    // Keep car on road
    car.position.x = THREE.MathUtils.clamp(
        car.position.x,
        -6,
        6
    );

    // Wheel rotation
    wheels.forEach(wheel => {
        wheel.rotation.x -= speed * 1.5;
    });

    // Speedometer
    const kmh = Math.round(
        speed * 65
    );

    document.getElementById("speed").textContent = kmh;

    // Gear
    let gear = "N";

    if (speed > 0.05) gear = "D";

    if (speed > 0.7) gear = "2";

    if (speed > 1.1) gear = "3";

    document.getElementById("gear").textContent = gear;
}

// --------------------------------------
// CAMERA
// --------------------------------------

function updateCamera() {

    const targetPosition = new THREE.Vector3(
        car.position.x,
        car.position.y + 4,
        car.position.z + 9
    );

    targetPosition.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        car.rotation.y
    );

    camera.position.lerp(
        targetPosition,
        0.08
    );

    const lookAt = new THREE.Vector3(
        car.position.x,
        car.position.y + 1,
        car.position.z - 8
    );

    lookAt.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        car.rotation.y
    );

    lookAt.add(car.position);

    camera.lookAt(lookAt);
}

// --------------------------------------
// ANIMATION
// --------------------------------------

function animate() {

    requestAnimationFrame(animate);

    updateCar();

    updateCamera();

    renderer.render(
        scene,
        camera
    );
}

animate();

// --------------------------------------
// RESIZE
// --------------------------------------

window.addEventListener("resize", () => {

    camera.aspect =
        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});
