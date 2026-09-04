// ============================================================
// CARS 13 — V8
// Stable driving + curved road + improved car + camera
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x8fc9f2);
scene.fog = new THREE.Fog(0x8fc9f2, 700, 5000);

// ============================================================
// CAMERA
// ============================================================

const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    7000
);

camera.position.set(0, 5, 12);

// ============================================================
// RENDERER
// ============================================================

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

// ============================================================
// LIGHTING
// ============================================================

const sun = new THREE.DirectionalLight(
    0xffffff,
    1.5
);

sun.position.set(
    -200,
    500,
    200
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

scene.add(sun);

scene.add(
    new THREE.HemisphereLight(
        0xbfe7ff,
        0x527044,
        1.3
    )
);

// ============================================================
// GROUND
// ============================================================

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(
        16000,
        16000
    ),
    new THREE.MeshStandardMaterial({
        color: 0x3d7d38,
        roughness: 1
    })
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.08;
ground.receiveShadow = true;

scene.add(ground);

// ============================================================
// ROAD
// ============================================================

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

    return Math.atan2(
        x2 - x1,
        4
    );

}

// ============================================================
// ROAD SURFACE
// ============================================================

const roadVertices = [];
const roadIndices = [];

for (
    let i = 0;
    i <= ROAD_SEGMENTS;
    i++
) {

    const t =
        i / ROAD_SEGMENTS;

    const z =
        ROAD_START +
        (ROAD_END - ROAD_START) * t;

    const x = roadX(z);

    roadVertices.push(
        x - ROAD_WIDTH / 2,
        0,
        z,

        x + ROAD_WIDTH / 2,
        0,
        z
    );

}

for (
    let i = 0;
    i < ROAD_SEGMENTS;
    i++
) {

    const a = i * 2;

    roadIndices.push(
        a,
        a + 1,
        a + 2,

        a + 1,
        a + 3,
        a + 2
    );

}

const roadGeometry =
    new THREE.BufferGeometry();

roadGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
        roadVertices,
        3
    )
);

roadGeometry.setIndex(
    roadIndices
);

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

// ============================================================
// ROAD EDGES
// ============================================================

function createRoadStrip(
    offset,
    width,
    color
) {

    const vertices = [];

    for (
        let i = 0;
        i <= ROAD_SEGMENTS;
        i++
    ) {

        const t =
            i / ROAD_SEGMENTS;

        const z =
            ROAD_START +
            (ROAD_END - ROAD_START) * t;

        const x = roadX(z);
        const angle =
            roadDirection(z);

        const nx = Math.cos(angle);
        const nz = Math.sin(angle);

        const centerX =
            x + nx * offset;

        const centerZ =
            z + nz * offset;

        const half =
            width / 2;

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

    for (
        let i = 0;
        i < ROAD_SEGMENTS;
        i++
    ) {

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

    const geometry =
        new THREE.BufferGeometry();

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
            color: color
        })
    );

    scene.add(mesh);

}

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

// ============================================================
// CENTER LINE
// ============================================================

const dashMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffe27a
    });

for (
    let z = ROAD_END + 40;
    z < ROAD_START;
    z += 55
) {

    const dash = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.22,
            0.035,
            22
        ),
        dashMaterial
    );

    dash.position.set(
        roadX(z),
        0.04,
        z
    );

    dash.rotation.y =
        roadDirection(z);

    scene.add(dash);

}

// ============================================================
// MOUNTAINS
// ============================================================

function createMountain(
    x,
    z,
    scale
) {

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

    mountain.scale.setScalar(scale);

    mountain.castShadow = true;

    scene.add(mountain);

}

for (
    let z = -5000;
    z < 1500;
    z += 450
) {

    createMountain(
        roadX(z) - 380,
        z,
        0.8 + Math.random() * 0.6
    );

    createMountain(
        roadX(z) + 380,
        z,
        0.8 + Math.random() * 0.6
    );

}

// ============================================================
// TREES
// ============================================================

function createTree(
    x,
    z,
    scale
) {

    const group =
        new THREE.Group();

    const trunk =
        new THREE.Mesh(
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

    const leaves =
        new THREE.Mesh(
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

    group.add(
        trunk,
        leaves
    );

    group.position.set(
        x,
        0,
        z
    );

    group.scale.setScalar(scale);

    scene.add(group);

}

for (
    let z = -5800;
    z < 1200;
    z += 85
) {

    const center =
        roadX(z);

    createTree(
        center - 45 - Math.random() * 50,
        z + Math.random() * 30,
        0.7 + Math.random() * 0.6
    );

    createTree(
        center + 45 + Math.random() * 50,
        z + Math.random() * 30,
        0.7 + Math.random() * 0.6
    );

}

// ============================================================
// PLAYER CAR
// ============================================================

const playerCar =
    new THREE.Group();

const bodyMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xc41616,
        metalness: 0.55,
        roughness: 0.28
    });

const blackMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.3,
        roughness: 0.3
    });

const glassMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x172b38,
        roughness: 0.1,
        transparent: true,
        opacity: 0.78
    });

const headlightMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xffffdd,
        emissive: 0xffffaa,
        emissiveIntensity: 1.5
    });

const taillightMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xff1111,
        emissive: 0xff0000,
        emissiveIntensity: 1.2
    });

// ============================================================
// CAR BODY
// ============================================================

const body =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            4.6,
            0.85,
            8.2
        ),
        bodyMaterial
    );

body.position.y = 1.05;
body.castShadow = true;

playerCar.add(body);

// Lower body

const lowerBody =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            4.9,
            0.45,
            7.5
        ),
        blackMaterial
    );

lowerBody.position.y = 0.72;

playerCar.add(lowerBody);

// Hood

const hood =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            4.3,
            0.35,
            2.1
        ),
        bodyMaterial
    );

hood.position.set(
    0,
    1.55,
    -2.35
);

playerCar.add(hood);

// Cabin

const cabin =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            3.65,
            1.15,
            3.55
        ),
        glassMaterial
    );

cabin.position.set(
    0,
    2.05,
    0.45
);

cabin.castShadow = true;

playerCar.add(cabin);

// Roof

const roof =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            3.75,
            0.18,
            3.65
        ),
        bodyMaterial
    );

roof.position.set(
    0,
    2.65,
    0.45
);

playerCar.add(roof);

// Front bumper

const frontBumper =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            4.7,
            0.35,
            0.35
        ),
        blackMaterial
    );

frontBumper.position.set(
    0,
    0.72,
    -4.1
);

playerCar.add(frontBumper);

// Rear bumper

const rearBumper =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            4.7,
            0.35,
            0.35
        ),
        blackMaterial
    );

rearBumper.position.set(
    0,
    0.72,
    4.1
);

playerCar.add(rearBumper);

// ============================================================
// SPOILER
// ============================================================

const spoiler =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            4.3,
            0.18,
            0.35
        ),
        blackMaterial
    );

spoiler.position.set(
    0,
    2.1,
    3.75
);

playerCar.add(spoiler);

for (
    const x of [-1.6, 1.6]
) {

    const support =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.15,
                0.7,
                0.15
            ),
            blackMaterial
        );

    support.position.set(
        x,
        1.75,
        3.75
    );

    playerCar.add(support);

}

// ============================================================
// LIGHTS
// ============================================================

for (
    const x of [-1.45, 1.45]
) {

    const light =
        new THREE.Mesh(
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

for (
    const x of [-1.5, 1.5]
) {

    const light =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.8,
                0.25,
                0.15
            ),
            taillightMaterial
        );

    light.position.set(
        x,
        1.15,
        4.12
    );

    playerCar.add(light);

}

// ============================================================
// WHEELS
// ============================================================

const wheels = [];
const frontWheels = [];

function createWheel(
    x,
    z,
    front
) {

    const wheel =
        new THREE.Group();

    const tire =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.72,
                0.72,
                0.48,
                20
            ),
            blackMaterial
        );

    tire.rotation.z =
        Math.PI / 2;

    tire.castShadow = true;

    wheel.add(tire);

    const rim =
        new THREE.Mesh(
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

    rim.rotation.z =
        Math.PI / 2;

    wheel.add(rim);

    wheel.position.set(
        x,
        0.72,
        z
    );

    playerCar.add(wheel);

    wheels.push(wheel);

    if (front) {
        frontWheels.push(wheel);
    }

}

createWheel(-2.35, -2.65, true);
createWheel(2.35, -2.65, true);
createWheel(-2.35, 2.65, false);
createWheel(2.35, 2.65, false);

// ============================================================
// START POSITION
// ============================================================

playerCar.position.set(
    roadX(0),
    0,
    0
);

scene.add(playerCar);

// ============================================================
// DRIVING
// ============================================================

let speed = 0;

const MAX_SPEED = 5.0;
const ACCELERATION = 0.035;
const BRAKING = 0.09;
const FRICTION = 0.008;

let steering = 0;

let gasPressed = false;
let brakePressed = false;

// ============================================================
// KEYBOARD
// ============================================================

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

// ============================================================
// TOUCH BUTTONS
// ============================================================

function setupButton(
    id,
    value
) {

    const button =
        document.getElementById(id);

    if (!button) return;

    button.addEventListener(
        "pointerdown",
        (event) => {

            event.preventDefault();

            if (id === "gas") {
                gasPressed = true;
            }

            if (id === "brake") {
                brakePressed = true;
            }

            if (id === "left") {
                steering = -1;
            }

            if (id === "right") {
                steering = 1;
            }

        }
    );

    button.addEventListener(
        "pointerup",
        (event) => {

            event.preventDefault();

            if (id === "gas") {
                gasPressed = false;
            }

            if (id === "brake") {
                brakePressed = false;
            }

            if (id === "left" && steering === -1) {
                steering = 0;
            }

            if (id === "right" && steering === 1) {
                steering = 0;
            }

        }
    );

    button.addEventListener(
        "pointercancel",
        () => {

            if (id === "gas") {
                gasPressed = false;
            }

            if (id === "brake") {
                brakePressed = false;
            }

            if (id === "left" || id === "right") {
                steering = 0;
            }

        }
    );

}

setupButton("gas");
setupButton("brake");
setupButton("left");
setupButton("right");

// ============================================================
// DRIVING UPDATE
// ============================================================

function updateDriving() {

    // GAS ONLY CONTROLS SPEED

    const accelerating =
        gasPressed ||
        keys["w"] ||
        keys["arrowup"];

    const braking =
        brakePressed ||
        keys["s"] ||
        keys["arrowdown"];

    // --------------------------------------------------------
    // SPEED
    // --------------------------------------------------------

    if (accelerating) {

        speed += ACCELERATION;

    }

    if (braking) {

        speed -= BRAKING;

    }

    if (!accelerating && !braking) {

        if (speed > 0) {

            speed -= FRICTION;

        }

        if (speed < 0) {

            speed += FRICTION;

        }

    }

    speed = THREE.MathUtils.clamp(
        speed,
        0,
        MAX_SPEED
    );

    // --------------------------------------------------------
    // KEYBOARD STEERING
    // --------------------------------------------------------

    let keyboardSteering = 0;

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        keyboardSteering = -1;

    }

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        keyboardSteering = 1;

    }

    const finalSteering =
        keyboardSteering !== 0
            ? keyboardSteering
            : steering;

    // --------------------------------------------------------
    // ROAD POSITION
    // --------------------------------------------------------

    const targetX =
        roadX(playerCar.position.z);

    // Steering moves the car sideways.
    // GAS never changes steering.

    const steeringAmount =
        finalSteering *
        speed *
        0.025;

    playerCar.position.x +=
        steeringAmount;

    // Slowly pull the car toward the road.

    const roadDifference =
        targetX -
        playerCar.position.x;

    playerCar.position.x +=
        roadDifference *
        0.012;

    // --------------------------------------------------------
    // MOVE FORWARD
    // --------------------------------------------------------

    playerCar.position.z -=
        speed * 0.55;

    // --------------------------------------------------------
    // CAR ROTATION
    // --------------------------------------------------------

    playerCar.rotation.y =
        finalSteering *
        -0.12;

    // Small body roll

    playerCar.rotation.z =
        -finalSteering *
        0.045;

    // --------------------------------------------------------
    // WHEEL ROTATION
    // --------------------------------------------------------

    for (const wheel of wheels) {

        wheel.children[0].rotation.x +=
            speed * 0.5;

    }

    // Front wheels turn

    for (const wheel of frontWheels) {

        wheel.rotation.y =
            finalSteering * 0.25;

    }

}

// ============================================================
// CAMERA
// ============================================================

function updateCamera() {

    const desiredX =
        playerCar.position.x;

    const desiredY = 5.2;

    const desiredZ =
        playerCar.position.z + 11;

    camera.position.x +=
        (desiredX - camera.position.x) *
        0.08;

    camera.position.y +=
        (desiredY - camera.position.y) *
        0.08;

    camera.position.z +=
        (desiredZ - camera.position.z) *
        0.08;

    camera.lookAt(
        playerCar.position.x,
        1.3,
        playerCar.position.z - 8
    );

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
                speed * 24
            );

    }

    if (gearElement) {

        const kmh =
            speed * 24;

        let currentGear = 1;

        if (kmh >= 25) currentGear = 2;
        if (kmh >= 45) currentGear = 3;
        if (kmh >= 70) currentGear = 4;
        if (kmh >= 95) currentGear = 5;

        gearElement.textContent =
            currentGear;

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

function animate() {

    requestAnimationFrame(
        animate
    );

    updateDriving();
    updateCamera();
    updateHUD();

    renderer.render(
        scene,
        camera
    );

}

animate();
