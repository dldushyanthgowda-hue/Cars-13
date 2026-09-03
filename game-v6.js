// ============================================================
// CARS 13 — V6
// Landscape / Endless Road / Improved Driving
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 140, 900);

// ------------------------------------------------------------
// CAMERA
// ------------------------------------------------------------

const camera = new THREE.PerspectiveCamera(
    68,
    window.innerWidth / window.innerHeight,
    0.1,
    3000
);

camera.position.set(0, 5, 12);

// ------------------------------------------------------------
// RENDERER
// ------------------------------------------------------------

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

// ------------------------------------------------------------
// LIGHTING
// ------------------------------------------------------------

const sun = new THREE.DirectionalLight(
    0xffffff,
    2.2
);

sun.position.set(
    80,
    120,
    60
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -120;
sun.shadow.camera.right = 120;
sun.shadow.camera.top = 120;
sun.shadow.camera.bottom = -120;

scene.add(sun);

const hemi = new THREE.HemisphereLight(
    0xbfe8ff,
    0x527a35,
    1.4
);

scene.add(hemi);

// ------------------------------------------------------------
// WORLD
// ------------------------------------------------------------

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(5000, 5000),
    new THREE.MeshStandardMaterial({
        color: 0x4f8f3b,
        roughness: 1
    })
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.05;

ground.receiveShadow = true;

scene.add(ground);

// ------------------------------------------------------------
// ROAD
// ------------------------------------------------------------

const ROAD_WIDTH = 18;
const ROAD_LENGTH = 5000;

function roadX(z) {

    return (
        Math.sin(z * 0.0035) * 25 +
        Math.sin(z * 0.008) * 10 +
        Math.sin(z * 0.018) * 4
    );
}

const roadMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x292929,
        roughness: 0.95
    });

const road = new THREE.Mesh(
    new THREE.PlaneGeometry(
        ROAD_WIDTH,
        ROAD_LENGTH
    ),
    roadMaterial
);

road.rotation.x = -Math.PI / 2;

road.position.y = 0;

scene.add(road);

// ------------------------------------------------------------
// ROAD MARKINGS
// ------------------------------------------------------------

const markingMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffffff
    });

const markings = [];

for (let z = -2400; z < 2400; z += 18) {

    const line = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.35,
            0.05,
            7
        ),
        markingMaterial
    );

    line.position.set(
        roadX(z),
        0.04,
        z
    );

    scene.add(line);
    markings.push(line);
}

// ------------------------------------------------------------
// ROAD EDGE LINES
// ------------------------------------------------------------

const edgeMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xf5f5f5
    });

for (const side of [-1, 1]) {

    const edge = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.25,
            0.06,
            ROAD_LENGTH
        ),
        edgeMaterial
    );

    edge.position.y = 0.05;

    edge.position.x =
        side * (ROAD_WIDTH / 2 - 0.5);

    edge.position.z = 0;

    scene.add(edge);
}

// ------------------------------------------------------------
// MOUNTAINS
// ------------------------------------------------------------

const mountainMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x687d55,
        roughness: 1
    });

for (let i = -20; i < 20; i++) {

    const height =
        35 + Math.random() * 45;

    const mountain = new THREE.Mesh(
        new THREE.ConeGeometry(
            25 + Math.random() * 20,
            height,
            8
        ),
        mountainMaterial
    );

    const side =
        i % 2 === 0 ? -1 : 1;

    mountain.position.x =
        side * (45 + Math.random() * 45);

    mountain.position.z =
        i * 230;

    mountain.position.y =
        height / 2;

    mountain.castShadow = true;

    scene.add(mountain);
}

// ------------------------------------------------------------
// TREES
// ------------------------------------------------------------

function createTree(x, z) {

    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.35,
            0.5,
            4,
            8
        ),
        new THREE.MeshStandardMaterial({
            color: 0x654321
        })
    );

    trunk.position.y = 2;

    tree.add(trunk);

    const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(
            2.5,
            6,
            8
        ),
        new THREE.MeshStandardMaterial({
            color: 0x176b2c
        })
    );

    leaves.position.y = 6;

    tree.add(leaves);

    tree.position.set(
        x,
        0,
        z
    );

    tree.castShadow = true;

    scene.add(tree);

    return tree;
}

for (let z = -2400; z < 2400; z += 35) {

    const center = roadX(z);

    createTree(
        center - 20 - Math.random() * 10,
        z
    );

    createTree(
        center + 20 + Math.random() * 10,
        z
    );
}

// ------------------------------------------------------------
// PLAYER CAR
// ------------------------------------------------------------

const car = new THREE.Group();

scene.add(car);

// Body

const body = new THREE.Mesh(
    new THREE.BoxGeometry(
        2.8,
        0.65,
        5.2
    ),
    new THREE.MeshStandardMaterial({
        color: 0xd71920,
        metalness: 0.25,
        roughness: 0.3
    })
);

body.position.y = 0.75;

body.castShadow = true;

car.add(body);

// Cabin

const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(
        2.2,
        0.75,
        2.4
    ),
    new THREE.MeshStandardMaterial({
        color: 0x17202a,
        metalness: 0.15,
        roughness: 0.2
    })
);

cabin.position.set(
    0,
    1.35,
    0.25
);

cabin.castShadow = true;

car.add(cabin);

// Hood

const hood = new THREE.Mesh(
    new THREE.BoxGeometry(
        2.5,
        0.18,
        1.5
    ),
    new THREE.MeshStandardMaterial({
        color: 0xc51218,
        metalness: 0.25,
        roughness: 0.3
    })
);

hood.position.set(
    0,
    1.05,
    -1.65
);

car.add(hood);

// ------------------------------------------------------------
// WHEELS
// ------------------------------------------------------------

const wheels = [];
const frontWheels = [];

function createWheel(x, z, front) {

    const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.48,
            0.48,
            0.32,
            20
        ),
        new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.8
        })
    );

    wheel.rotation.z =
        Math.PI / 2;

    wheel.position.set(
        x,
        0.48,
        z
    );

    wheel.castShadow = true;

    car.add(wheel);

    wheels.push(wheel);

    if (front) {
        frontWheels.push(wheel);
    }
}

createWheel(-1.45, -1.65, true);
createWheel(1.45, -1.65, true);

createWheel(-1.45, 1.65, false);
createWheel(1.45, 1.65, false);

// ------------------------------------------------------------
// PLAYER START
// ------------------------------------------------------------

car.position.set(
    roadX(0),
    0,
    0
);

// ------------------------------------------------------------
// TRAFFIC
// ------------------------------------------------------------

const traffic = [];

function createTrafficCar(z, lane) {

    const trafficCar =
        new THREE.Group();

    const trafficBody =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.5,
                0.65,
                4.5
            ),
            new THREE.MeshStandardMaterial({
                color:
                    Math.random() > 0.5
                        ? 0x1d5fd1
                        : 0xf2c300,
                metalness: 0.15,
                roughness: 0.4
            })
        );

    trafficBody.position.y = 0.75;

    trafficBody.castShadow = true;

    trafficCar.add(trafficBody);

    trafficCar.position.set(
        roadX(z) + lane,
        0,
        z
    );

    scene.add(trafficCar);

    traffic.push({
        mesh: trafficCar,
        lane: lane,
        speed:
            0.55 +
            Math.random() * 0.45
    });
}

for (let i = 0; i < 12; i++) {

    createTrafficCar(
        -120 - i * 100,
        i % 2 === 0 ? -4 : 4
    );
}

// ------------------------------------------------------------
// PHYSICS
// ------------------------------------------------------------

let speed = 0;

let steering = 0;
let steeringInput = 0;

let rpm = 900;
let currentGear = 1;

const MAX_SPEED = 3.2;
const ACCELERATION = 0.018;
const BRAKING = 0.065;
const FRICTION = 0.004;

const MAX_STEERING = 0.028;

// ------------------------------------------------------------
// CONTROLS
// ------------------------------------------------------------

let gasPressed = false;
let brakePressed = false;
let leftPressed = false;
let rightPressed = false;

function setupButton(id, down, up) {

    const button =
        document.getElementById(id);

    if (!button) return;

    button.addEventListener(
        "pointerdown",
        e => {
            e.preventDefault();
            down();
        }
    );

    button.addEventListener(
        "pointerup",
        e => {
            e.preventDefault();
            up();
        }
    );

    button.addEventListener(
        "pointercancel",
        up
    );

    button.addEventListener(
        "pointerleave",
        up
    );
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

// Keyboard

window.addEventListener(
    "keydown",
    e => {

        if (
            e.key === "ArrowUp" ||
            e.key.toLowerCase() === "w"
        ) {
            gasPressed = true;
        }

        if (
            e.key === "ArrowDown" ||
            e.key.toLowerCase() === "s"
        ) {
            brakePressed = true;
        }

        if (
            e.key === "ArrowLeft" ||
            e.key.toLowerCase() === "a"
        ) {
            leftPressed = true;
        }

        if (
            e.key === "ArrowRight" ||
            e.key.toLowerCase() === "d"
        ) {
            rightPressed = true;
        }
    }
);

window.addEventListener(
    "keyup",
    e => {

        if (
            e.key === "ArrowUp" ||
            e.key.toLowerCase() === "w"
        ) {
            gasPressed = false;
        }

        if (
            e.key === "ArrowDown" ||
            e.key.toLowerCase() === "s"
        ) {
            brakePressed = false;
        }

        if (
            e.key === "ArrowLeft" ||
            e.key.toLowerCase() === "a"
        ) {
            leftPressed = false;
        }

        if (
            e.key === "ArrowRight" ||
            e.key.toLowerCase() === "d"
        ) {
            rightPressed = false;
        }
    }
);

// ------------------------------------------------------------
// PLAYER UPDATE
// ------------------------------------------------------------

function updateCar() {

    // Acceleration

    if (gasPressed) {

        const factor =
            1 -
            (speed / MAX_SPEED) * 0.45;

        speed +=
            ACCELERATION *
            Math.max(
                factor,
                0.35
            );
    }

    // Braking

    if (brakePressed) {

        speed -= BRAKING;
    }

    // Friction

    if (
        !gasPressed &&
        !brakePressed
    ) {

        speed -= FRICTION;
    }

    speed = THREE.MathUtils.clamp(
        speed,
        0,
        MAX_SPEED
    );

    // Steering

    let target = 0;

    if (leftPressed) {
        target = 1;
    }

    if (rightPressed) {
        target = -1;
    }

    steeringInput =
        THREE.MathUtils.lerp(
            steeringInput,
            target,
            0.13
        );

    steering =
        steeringInput *
        MAX_STEERING;

    car.rotation.y +=
        steering * speed;

    // Move

    car.translateZ(-speed);

    // Keep car close to road

    const center =
        roadX(car.position.z);

    const offset =
        car.position.x - center;

    if (
        Math.abs(offset) >
        ROAD_WIDTH / 2
    ) {

        speed *= 0.97;
    }

    // Wheel rotation

    wheels.forEach(
        wheel => {

            wheel.rotation.x -=
                speed * 1.7;
        }
    );

    frontWheels.forEach(
        wheel => {

            wheel.rotation.y =
                -steeringInput * 0.5;
        }
    );

    // RPM

    rpm =
        900 +
        (speed / MAX_SPEED) * 6500;

    // Gear

    if (speed < 0.55) {
        currentGear = 1;
    }
    else if (speed < 1.15) {
        currentGear = 2;
    }
    else if (speed < 1.8) {
        currentGear = 3;
    }
    else if (speed < 2.5) {
        currentGear = 4;
    }
    else {
        currentGear = 5;
    }

    // UI

    const speedDisplay =
        document.getElementById("speed");

    if (speedDisplay) {

        speedDisplay.textContent =
            Math.round(speed * 70);
    }

    const gearDisplay =
        document.getElementById("gear");

    if (gearDisplay) {

        gearDisplay.textContent =
            speed < 0.03
                ? "N"
                : currentGear;
    }
}

// ------------------------------------------------------------
// TRAFFIC UPDATE
// ------------------------------------------------------------

function updateTraffic() {

    traffic.forEach(
        trafficCar => {

            trafficCar.mesh.position.z +=
                trafficCar.speed;

            const z =
                trafficCar.mesh.position.z;

            trafficCar.mesh.position.x =
                roadX(z) +
                trafficCar.lane;

            // Recycle traffic

            if (
                trafficCar.mesh.position.z >
                car.position.z + 80
            ) {

                trafficCar.mesh.position.z =
                    car.position.z - 900 -
                    Math.random() * 500;

                trafficCar.speed =
                    0.55 +
                    Math.random() * 0.45;
            }
        }
    );
}

// ------------------------------------------------------------
// COLLISION
// ------------------------------------------------------------

function checkCollisions() {

    const playerBox =
        new THREE.Box3().setFromObject(car);

    traffic.forEach(
        trafficCar => {

            const box =
                new THREE.Box3()
                    .setFromObject(
                        trafficCar.mesh
                    );

            if (
                playerBox.intersectsBox(box)
            ) {

                speed *= 0.35;
            }
        }
    );
}

// ------------------------------------------------------------
// CAMERA
// ------------------------------------------------------------

function updateCamera() {

    const desired =
        new THREE.Vector3(
            car.position.x,
            car.position.y + 5.2,
            car.position.z + 11
        );

    desired.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        car.rotation.y
    );

    camera.position.lerp(
        desired,
        0.08
    );

    const look =
        new THREE.Vector3(
            car.position.x,
            car.position.y + 1,
            car.position.z - 12
        );

    look.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        car.rotation.y
    );

    camera.lookAt(look);
}

// ------------------------------------------------------------
// RESIZE
// ------------------------------------------------------------

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);

// ------------------------------------------------------------
// GAME LOOP
// ------------------------------------------------------------

function animate() {

    requestAnimationFrame(
        animate
    );

    updateCar();
    updateTraffic();
    checkCollisions();
    updateCamera();

    renderer.render(
        scene,
        camera
    );
}

animate();
