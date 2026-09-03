// ============================================================
// CARS 13 — V7
// Better car, driving, camera, environment and game foundation
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x8fc9f2);
scene.fog = new THREE.Fog(0x8fc9f2, 700, 5000);

// ------------------------------------------------------------
// CAMERA
// ------------------------------------------------------------

const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    7000
);

camera.position.set(0, 5, 12);

// ------------------------------------------------------------
// RENDERER
// ------------------------------------------------------------

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

// ------------------------------------------------------------
// LIGHTING
// ------------------------------------------------------------

const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(-200, 500, 200);

sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -500;
sun.shadow.camera.right = 500;
sun.shadow.camera.top = 500;
sun.shadow.camera.bottom = -500;

scene.add(sun);

const hemi = new THREE.HemisphereLight(
    0xbfe7ff,
    0x527044,
    1.3
);

scene.add(hemi);

// ------------------------------------------------------------
// WORLD
// ------------------------------------------------------------

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(16000, 16000),
    new THREE.MeshStandardMaterial({
        color: 0x3d7d38,
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
const ROAD_START = 1200;
const ROAD_END = -6000;
const ROAD_SEGMENTS = 600;

function roadX(z) {

    return (
        Math.sin(z * 0.0025) * 28 +
        Math.sin(z * 0.006) * 12 +
        Math.sin(z * 0.014) * 4
    );

}

function roadDirection(z) {

    const x1 = roadX(z - 2);
    const x2 = roadX(z + 2);

    return Math.atan2(x2 - x1, 4);

}

// ------------------------------------------------------------
// ROAD SURFACE
// ------------------------------------------------------------

const roadVertices = [];
const roadIndices = [];

for (let i = 0; i <= ROAD_SEGMENTS; i++) {

    const t = i / ROAD_SEGMENTS;

    const z = ROAD_START +
        (ROAD_END - ROAD_START) * t;

    const x = roadX(z);

    roadVertices.push(
        x - ROAD_WIDTH / 2, 0, z,
        x + ROAD_WIDTH / 2, 0, z
    );

}

for (let i = 0; i < ROAD_SEGMENTS; i++) {

    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;

    roadIndices.push(
        a, b, c,
        b, d, c
    );

}

const roadGeometry = new THREE.BufferGeometry();

roadGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
        roadVertices,
        3
    )
);

roadGeometry.setIndex(roadIndices);
roadGeometry.computeVertexNormals();

const road = new THREE.Mesh(
    roadGeometry,
    new THREE.MeshStandardMaterial({
        color: 0x292929,
        roughness: 0.9
    })
);

road.receiveShadow = true;

scene.add(road);

// ------------------------------------------------------------
// ROAD STRIPS
// ------------------------------------------------------------

function createRoadStrip(offset, width, color) {

    const vertices = [];

    for (let i = 0; i <= ROAD_SEGMENTS; i++) {

        const t = i / ROAD_SEGMENTS;

        const z = ROAD_START +
            (ROAD_END - ROAD_START) * t;

        const x = roadX(z);
        const angle = roadDirection(z);

        const nx = Math.cos(angle);
        const nz = Math.sin(angle);

        const centerX =
            x + nx * offset;

        const centerZ =
            z + nz * offset;

        const half = width / 2;

        vertices.push(
            centerX - nx * half,
            0.025,
            centerZ - nz * half,

            centerX + nx * half,
            0.025,
            centerZ + nz * half
        );

    }

    const indices = [];

    for (let i = 0; i < ROAD_SEGMENTS; i++) {

        const a = i * 2;

        indices.push(
            a,
            a + 1,
            a + 2,

            a + 1,
            a + 3,
            a + 2
        );

    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
            vertices,
            3
        )
    );

    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.8
        })
    );

    scene.add(mesh);

    return mesh;

}

// White road edges
createRoadStrip(
    -ROAD_WIDTH / 2 + 0.15,
    0.25,
    0xffffff
);

createRoadStrip(
    ROAD_WIDTH / 2 - 0.15,
    0.25,
    0xffffff
);

// ------------------------------------------------------------
// CENTER ROAD MARKINGS
// ------------------------------------------------------------

const dashMaterial = new THREE.MeshBasicMaterial({
    color: 0xffe27a
});

for (let z = ROAD_END + 40; z < ROAD_START; z += 55) {

    const x = roadX(z);

    const dash = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.035, 22),
        dashMaterial
    );

    dash.position.set(
        x,
        0.035,
        z
    );

    dash.rotation.y = roadDirection(z);

    scene.add(dash);

}

// ------------------------------------------------------------
// MOUNTAINS
// ------------------------------------------------------------

function createMountain(x, z, scale) {

    const mountain = new THREE.Mesh(
        new THREE.ConeGeometry(
            180,
            500,
            7
        ),
        new THREE.MeshStandardMaterial({
            color: 0x526b54,
            roughness: 1
        })
    );

    mountain.position.set(
        x,
        250 * scale,
        z
    );

    mountain.scale.set(
        scale,
        scale,
        scale
    );

    mountain.castShadow = true;
    mountain.receiveShadow = true;

    scene.add(mountain);

}

for (let z = -5000; z < 1500; z += 450) {

    createMountain(
        roadX(z) - 330 - Math.random() * 180,
        z,
        0.8 + Math.random() * 0.7
    );

    createMountain(
        roadX(z) + 330 + Math.random() * 180,
        z,
        0.8 + Math.random() * 0.7
    );

}

// ------------------------------------------------------------
// TREES
// ------------------------------------------------------------

function createTree(x, z, scale = 1) {

    const group = new THREE.Group();

    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.7,
            1,
            7,
            8
        ),
        new THREE.MeshStandardMaterial({
            color: 0x70472c
        })
    );

    trunk.position.y = 3.5;

    const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(
            4.5,
            11,
            8
        ),
        new THREE.MeshStandardMaterial({
            color: 0x225c2a
        })
    );

    leaves.position.y = 10;

    trunk.castShadow = true;
    leaves.castShadow = true;

    group.add(trunk);
    group.add(leaves);

    group.position.set(
        x,
        0,
        z
    );

    group.scale.setScalar(scale);

    scene.add(group);

}

for (let z = -5800; z < 1200; z += 80) {

    const center = roadX(z);

    createTree(
        center - 40 - Math.random() * 55,
        z + Math.random() * 30,
        0.7 + Math.random() * 0.7
    );

    createTree(
        center + 40 + Math.random() * 55,
        z + Math.random() * 30,
        0.7 + Math.random() * 0.7
    );

}

// ============================================================
// PLAYER CAR
// ============================================================

const playerCar = new THREE.Group();

const carBodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xc41616,
    metalness: 0.55,
    roughness: 0.28
});

const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.3,
    roughness: 0.3
});

const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x162b3a,
    metalness: 0.1,
    roughness: 0.1,
    transparent: true,
    opacity: 0.78
});

const headlightMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffdd,
    emissive: 0xffffaa,
    emissiveIntensity: 1.5
});

const tailLightMaterial = new THREE.MeshStandardMaterial({
    color: 0xff1111,
    emissive: 0xff0000,
    emissiveIntensity: 1.2
});

// Main body
const body = new THREE.Mesh(
    new THREE.BoxGeometry(4.6, 0.85, 8.2),
    carBodyMaterial
);

body.position.y = 1.05;
body.castShadow = true;

playerCar.add(body);

// Lower body
const lowerBody = new THREE.Mesh(
    new THREE.BoxGeometry(4.9, 0.45, 7.5),
    darkMaterial
);

lowerBody.position.y = 0.72;
lowerBody.castShadow = true;

playerCar.add(lowerBody);

// Hood
const hood = new THREE.Mesh(
    new THREE.BoxGeometry(4.3, 0.35, 2.1),
    carBodyMaterial
);

hood.position.set(
    0,
    1.55,
    -2.35
);

hood.castShadow = true;

playerCar.add(hood);

// Cabin
const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(3.65, 1.15, 3.55),
    glassMaterial
);

cabin.position.set(
    0,
    2.05,
    0.45
);

cabin.castShadow = true;

playerCar.add(cabin);

// Roof frame
const roof = new THREE.Mesh(
    new THREE.BoxGeometry(3.75, 0.18, 3.65),
    carBodyMaterial
);

roof.position.set(
    0,
    2.65,
    0.45
);

playerCar.add(roof);

// Front bumper
const frontBumper = new THREE.Mesh(
    new THREE.BoxGeometry(4.7, 0.35, 0.35),
    darkMaterial
);

frontBumper.position.set(
    0,
    0.72,
    -4.1
);

playerCar.add(frontBumper);

// Rear bumper
const rearBumper = new THREE.Mesh(
    new THREE.BoxGeometry(4.7, 0.35, 0.35),
    darkMaterial
);

rearBumper.position.set(
    0,
    0.72,
    4.1
);

playerCar.add(rearBumper);

// ------------------------------------------------------------
// SPOILER
// ------------------------------------------------------------

const spoilerBar = new THREE.Mesh(
    new THREE.BoxGeometry(4.3, 0.18, 0.35),
    darkMaterial
);

spoilerBar.position.set(
    0,
    2.1,
    3.75
);

playerCar.add(spoilerBar);

for (const x of [-1.6, 1.6]) {

    const support = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.15,
            0.7,
            0.15
        ),
        darkMaterial
    );

    support.position.set(
        x,
        1.75,
        3.75
    );

    playerCar.add(support);

}

// ------------------------------------------------------------
// LIGHTS
// ------------------------------------------------------------

for (const x of [-1.45, 1.45]) {

    const light = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.85,
            0.25,
            0.15
        ),
        headlightMaterial
    );

    light.position.set(
        x,
        1.2,
        -4.12
    );

    playerCar.add(light);

}

for (const x of [-1.5, 1.5]) {

    const light = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.8,
            0.25,
            0.15
        ),
        tailLightMaterial
    );

    light.position.set(
        x,
        1.15,
        4.12
    );

    playerCar.add(light);

}

// ------------------------------------------------------------
// WHEELS
// ------------------------------------------------------------

const wheels = [];
const frontWheels = [];

function createWheel(x, z, front) {

    const wheelGroup = new THREE.Group();

    const tire = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.72,
            0.72,
            0.48,
            20
        ),
        darkMaterial
    );

    tire.rotation.z = Math.PI / 2;

    tire.castShadow = true;

    wheelGroup.add(tire);

    const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.38,
            0.38,
            0.5,
            16
        ),
        new THREE.MeshStandardMaterial({
            color: 0xbfc4c8,
            metalness: 0.8,
            roughness: 0.2
        })
    );

    rim.rotation.z = Math.PI / 2;

    wheelGroup.add(rim);

    wheelGroup.position.set(
        x,
        0.72,
        z
    );

    playerCar.add(wheelGroup);

    wheels.push(wheelGroup);

    if (front) {
        frontWheels.push(wheelGroup);
    }

}

createWheel(-2.35, -2.65, true);
createWheel(2.35, -2.65, true);
createWheel(-2.35, 2.65, false);
createWheel(2.35, 2.65, false);

// ------------------------------------------------------------
// CAR POSITION
// ------------------------------------------------------------

playerCar.position.set(
    roadX(0),
    0,
    0
);

scene.add(playerCar);

// ============================================================
// DRIVING PHYSICS
// ============================================================

let speed = 0;

const MAX_SPEED = 5.2;
const REVERSE_SPEED = 1.8;

const ACCELERATION = 0.035;
const BRAKING = 0.10;
const FRICTION = 0.008;

const STEERING_SPEED = 0.018;
const MAX_STEERING = 0.035;

let steering = 0;

let gasPressed = false;
let brakePressed = false;

let distanceTravelled = 0;

let gear = 1;

// ------------------------------------------------------------
// INPUT
// ------------------------------------------------------------

const keys = {};

window.addEventListener(
    "keydown",
    (event) => {
        keys[event.key.toLowerCase()] = true;
    }
);

window.addEventListener(
    "keyup",
    (event) => {
        keys[event.key.toLowerCase()] = false;
    }
);

function setupHoldButton(id, callback) {

    const button = document.getElementById(id);

    if (!button) return;

    const start = (event) => {

        event.preventDefault();

        callback(true);

    };

    const end = (event) => {

        event.preventDefault();

        callback(false);

    };

    button.addEventListener(
        "pointerdown",
        start
    );

    button.addEventListener(
        "pointerup",
        end
    );

    button.addEventListener(
        "pointercancel",
        end
    );

    button.addEventListener(
        "pointerleave",
        end
    );

}

setupHoldButton(
    "gas",
    (value) => gasPressed = value
);

setupHoldButton(
    "brake",
    (value) => brakePressed = value
);

setupHoldButton(
    "left",
    (value) => {

        if (value) steering = 1;

        else if (steering < 0) steering = 0;

    }
);

setupHoldButton(
    "right",
    (value) => {

        if (value) steering = -1;

        else if (steering > 0) steering = 0;

    }
);

// ============================================================
// GAME UPDATE
// ============================================================

function updateDriving() {

    const accelerating =
        gasPressed ||
        keys["w"] ||
        keys["arrowup"];

    const braking =
        brakePressed ||
        keys["s"] ||
        keys["arrowdown"];

    const left =
        keys["a"] ||
        keys["arrowleft"];

    const right =
        keys["d"] ||
        keys["arrowright"];

    // --------------------------------------------------------
    // STEERING
    // --------------------------------------------------------

    let targetSteering = steering;

    if (left) targetSteering = 1;
    if (right) targetSteering = -1;

    if (!left && !right && !gasPressed &&
        !brakePressed) {

        // Keep touch steering if active

    }

    if (targetSteering === 0) {

        steering *= 0.85;

    } else {

        steering +=
            (targetSteering - steering) *
            0.18;

    }

    steering = THREE.MathUtils.clamp(
        steering,
        -1,
        1
    );

    // --------------------------------------------------------
    // ACCELERATION
    // --------------------------------------------------------

    if (accelerating) {

        speed += ACCELERATION;

    }

    // --------------------------------------------------------
    // BRAKING
    // --------------------------------------------------------

    if (braking) {

        if (speed > 0) {

            speed -= BRAKING;

        } else {

            speed -= ACCELERATION * 0.5;

        }

    }

    // --------------------------------------------------------
    // FRICTION
    // --------------------------------------------------------

    if (!accelerating && !braking) {

        if (speed > 0) {

            speed -= FRICTION;

        } else if (speed < 0) {

            speed += FRICTION;

        }

    }

    speed = THREE.MathUtils.clamp(
        speed,
        -REVERSE_SPEED,
        MAX_SPEED
    );

    // --------------------------------------------------------
    // GEAR SYSTEM
    // --------------------------------------------------------

    const kmh = Math.abs(speed) * 24;

    if (kmh < 2) gear = 1;
    else if (kmh < 25) gear = 1;
    else if (kmh < 45) gear = 2;
    else if (kmh < 70) gear = 3;
    else if (kmh < 95) gear = 4;
    else gear = 5;

    // --------------------------------------------------------
    // MOVE FORWARD
    // --------------------------------------------------------

    const movement =
        speed * 0.55;

    playerCar.position.z -= movement;

    distanceTravelled +=
        Math.abs(movement);

    // --------------------------------------------------------
    // STEERING
    // --------------------------------------------------------

    const steeringStrength =
        THREE.MathUtils.clamp(
            Math.abs(speed) / MAX_SPEED,
            0,
            1
        );

    playerCar.rotation.y +=
        steering *
        MAX_STEERING *
        steeringStrength;

    // --------------------------------------------------------
    // KEEP CAR NEAR ROAD
    // --------------------------------------------------------

    const targetRoadX =
        roadX(playerCar.position.z);

    const roadOffset =
        playerCar.position.x -
        targetRoadX;

    playerCar.position.x -=
        roadOffset *
        0.018;

    // Steering influence
    playerCar.position.x +=
        steering *
        Math.abs(speed) *
        STEERING_SPEED;

    // --------------------------------------------------------
    // BODY ROLL
    // --------------------------------------------------------

    playerCar.rotation.z =
        -steering *
        Math.min(
            Math.abs(speed) / MAX_SPEED,
            1
        ) *
        0.08;

    // --------------------------------------------------------
    // WHEEL ROTATION
    // --------------------------------------------------------

    for (const wheel of wheels) {

        wheel.children[0].rotation.x +=
            speed * 0.5;

    }

    // Front wheel steering
    for (const wheel of frontWheels) {

        wheel.rotation.y =
            steering * 0.35;

    }

}

// ============================================================
// CAMERA
// ============================================================

function updateCamera() {

    const speedFactor =
        Math.min(
            Math.abs(speed) / MAX_SPEED,
            1
        );

    const cameraTarget = new THREE.Vector3(
        playerCar.position.x,
        playerCar.position.y + 1.6,
        playerCar.position.z - 4
    );

    const desiredCamera = new THREE.Vector3(
        playerCar.position.x -
            Math.sin(playerCar.rotation.y) *
            (10 + speedFactor * 3),

        5.2 + speedFactor * 1.2,

        playerCar.position.z +
            Math.cos(playerCar.rotation.y) *
            (10 + speedFactor * 3)
    );

    camera.position.lerp(
        desiredCamera,
        0.08
    );

    camera.lookAt(cameraTarget);

}

// ============================================================
// HUD
// ============================================================

function updateHUD() {

    const speedElement =
        document.getElementById("speed");

    const gearElement =
        document.getElementById("gear");

    if (speedElement) {

        speedElement.textContent =
            Math.round(
                Math.abs(speed) * 24
            );

    }

    if (gearElement) {

        gearElement.textContent =
            speed < -0.1
                ? "R"
                : gear;

    }

}

// ============================================================
// RESIZE
// ============================================================

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

// ============================================================
// GAME LOOP
// ============================================================

const clock = new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    clock.getDelta();

    updateDriving();
    updateCamera();
    updateHUD();

    renderer.render(
        scene,
        camera
    );

}

animate();
