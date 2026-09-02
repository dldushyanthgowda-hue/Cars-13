// ==========================================
// CARS 13 — VERSION 2
// Improved driving + steering + camera
// ==========================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 80, 450);

// CAMERA
const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);

// RENDERER
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

// ==========================================
// LIGHTING
// ==========================================

const sun = new THREE.DirectionalLight(0xffffff, 2.2);

sun.position.set(100, 150, 80);
sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

scene.add(sun);

const ambient = new THREE.HemisphereLight(
    0x9ed8ff,
    0x385438,
    1.1
);

scene.add(ambient);

// ==========================================
// GROUND
// ==========================================

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshStandardMaterial({
        color: 0x438943,
        roughness: 1
    })
);

ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;

scene.add(ground);

// ==========================================
// ROAD
// ==========================================

const road = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 2000),
    new THREE.MeshStandardMaterial({
        color: 0x292929,
        roughness: 0.95
    })
);

road.rotation.x = -Math.PI / 2;
road.position.y = 0.02;
road.receiveShadow = true;

scene.add(road);

// ==========================================
// ROAD MARKINGS
// ==========================================

const whiteMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff
});

for (let z = -990; z < 1000; z += 12) {

    const line = new THREE.Mesh(
        new THREE.PlaneGeometry(0.3, 6),
        whiteMaterial
    );

    line.rotation.x = -Math.PI / 2;
    line.position.set(0, 0.05, z);

    scene.add(line);
}

// Road edges

for (const x of [-8.7, 8.7]) {

    const edge = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.08, 2000),
        whiteMaterial
    );

    edge.position.set(x, 0.07, 0);

    scene.add(edge);
}

// ==========================================
// CAR
// ==========================================

const car = new THREE.Group();

scene.add(car);

// Main body

const body = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.75, 5),
    new THREE.MeshStandardMaterial({
        color: 0xb90000,
        metalness: 0.45,
        roughness: 0.3
    })
);

body.position.y = 1;
body.castShadow = true;

car.add(body);

// Hood

const hood = new THREE.Mesh(
    new THREE.BoxGeometry(2.75, 0.35, 1.5),
    new THREE.MeshStandardMaterial({
        color: 0xc90000,
        metalness: 0.4,
        roughness: 0.3
    })
);

hood.position.set(0, 1.35, -1.55);
hood.castShadow = true;

car.add(hood);

// Cabin

const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.85, 2.3),
    new THREE.MeshStandardMaterial({
        color: 0x101820,
        metalness: 0.25,
        roughness: 0.12
    })
);

cabin.position.set(0, 1.65, 0.15);
cabin.castShadow = true;

car.add(cabin);

// ==========================================
// WHEELS
// ==========================================

const wheels = [];
const frontWheels = [];

function createWheel(x, z, front) {

    const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.58,
            0.58,
            0.42,
            24
        ),
        new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.9
        })
    );

    wheel.rotation.z = Math.PI / 2;

    wheel.position.set(x, 0.58, z);

    wheel.castShadow = true;

    car.add(wheel);

    wheels.push(wheel);

    if (front) {
        frontWheels.push(wheel);
    }
}

createWheel(-1.55, -1.55, true);
createWheel(1.55, -1.55, true);

createWheel(-1.55, 1.55, false);
createWheel(1.55, 1.55, false);

// ==========================================
// HEADLIGHTS
// ==========================================

const headlightMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffdd,
    emissive: 0xffffaa,
    emissiveIntensity: 2
});

for (const x of [-0.85, 0.85]) {

    const light = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.25, 0.12),
        headlightMaterial
    );

    light.position.set(x, 1.15, -2.53);

    car.add(light);
}

// ==========================================
// TREES
// ==========================================

function createTree(x, z) {

    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.4, 3, 8),
        new THREE.MeshStandardMaterial({
            color: 0x704522
        })
    );

    trunk.position.y = 1.5;
    trunk.castShadow = true;

    tree.add(trunk);

    const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 12, 12),
        new THREE.MeshStandardMaterial({
            color: 0x176b2c
        })
    );

    leaves.position.y = 3.7;
    leaves.castShadow = true;

    tree.add(leaves);

    tree.position.set(x, 0, z);

    scene.add(tree);
}

for (let z = -950; z < 1000; z += 30) {

    createTree(-15 - Math.random() * 8, z);
    createTree(15 + Math.random() * 8, z + 15);
}

// ==========================================
// START POSITION
// ==========================================

car.position.set(0, 0, 20);

// ==========================================
// DRIVING PHYSICS
// ==========================================

let speed = 0;

let steering = 0;

const MAX_SPEED = 1.7;
const ACCELERATION = 0.014;
const BRAKING = 0.045;
const FRICTION = 0.006;

let gasPressed = false;
let brakePressed = false;
let leftPressed = false;
let rightPressed = false;

// ==========================================
// KEYBOARD
// ==========================================

window.addEventListener("keydown", event => {

    if (event.key === "ArrowUp" || event.key.toLowerCase() === "w")
        gasPressed = true;

    if (event.key === "ArrowDown" || event.key.toLowerCase() === "s")
        brakePressed = true;

    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a")
        leftPressed = true;

    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d")
        rightPressed = true;
});

window.addEventListener("keyup", event => {

    if (event.key === "ArrowUp" || event.key.toLowerCase() === "w")
        gasPressed = false;

    if (event.key === "ArrowDown" || event.key.toLowerCase() === "s")
        brakePressed = false;

    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a")
        leftPressed = false;

    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d")
        rightPressed = false;
});

// ==========================================
// MOBILE CONTROLS
// ==========================================

function setupButton(id, press, release) {

    const button = document.getElementById(id);

    button.addEventListener("pointerdown", e => {
        e.preventDefault();
        press();
    });

    button.addEventListener("pointerup", e => {
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

// ==========================================
// UPDATE CAR
// ==========================================

function updateCar() {

    // Acceleration
    if (gasPressed) {
        speed += ACCELERATION;
    }

    // Braking
    if (brakePressed) {
        speed -= BRAKING;
    }

    // Friction
    if (!gasPressed && !brakePressed) {

        if (speed > 0)
            speed -= FRICTION;

        if (speed < 0)
            speed += FRICTION;
    }

    speed = THREE.MathUtils.clamp(
        speed,
        0,
        MAX_SPEED
    );

    // Steering
    if (leftPressed) {
        steering = 1;
    } 
    else if (rightPressed) {
        steering = -1;
    } 
    else {
        steering = 0;
    }

    // Smooth steering
    car.rotation.y +=
        steering *
        speed *
        0.020;

    // Move forward
    car.translateZ(-speed);

    // Road boundaries
    car.position.x = THREE.MathUtils.clamp(
        car.position.x,
        -6.2,
        6.2
    );

    // Front-wheel steering
    frontWheels.forEach(wheel => {

        wheel.rotation.y =
            -steering * 0.35;

        wheel.rotation.x -=
            speed * 1.5;
    });

    // Rear wheel rotation
    wheels.forEach(wheel => {

        if (!frontWheels.includes(wheel)) {
            wheel.rotation.x -= speed * 1.5;
        }
    });

    // Speedometer
    const kmh = Math.round(speed * 70);

    document.getElementById("speed").textContent = kmh;

    // Gear
    let gear = "N";

    if (speed > 0.05) gear = "1";
    if (speed > 0.55) gear = "2";
    if (speed > 1.0) gear = "3";
    if (speed > 1.4) gear = "4";

    document.getElementById("gear").textContent = gear;
}

// ==========================================
// CAMERA
// ==========================================

const cameraTarget = new THREE.Vector3();

function updateCamera() {

    const desiredPosition = new THREE.Vector3(
        0,
        4.5,
        10
    );

    desiredPosition.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        car.rotation.y
    );

    desiredPosition.add(car.position);

    camera.position.lerp(
        desiredPosition,
        0.08
    );

    cameraTarget.set(
        car.position.x,
        car.position.y + 1,
        car.position.z - 10
    );

    cameraTarget.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        car.rotation.y
    );

    cameraTarget.add(car.position);

    camera.lookAt(cameraTarget);
}

// ==========================================
// GAME LOOP
// ==========================================

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

// ==========================================
// RESIZE
// ==========================================

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
