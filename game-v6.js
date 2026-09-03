// ============================================================
// CARS 13 — V6
// Curved Road Edition
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x78c9ef);

scene.fog = new THREE.Fog(
    0x78c9ef,
    180,
    1100
);

// ============================================================
// CAMERA
// ============================================================

const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    3000
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
renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

document.body.appendChild(
    renderer.domElement
);

// ============================================================
// LIGHTING
// ============================================================

const sun = new THREE.DirectionalLight(
    0xffffff,
    2.3
);

sun.position.set(
    120,
    180,
    80
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -180;
sun.shadow.camera.right = 180;
sun.shadow.camera.top = 180;
sun.shadow.camera.bottom = -180;

scene.add(sun);

const hemisphere =
    new THREE.HemisphereLight(
        0xbdeaff,
        0x315c2c,
        1.4
    );

scene.add(hemisphere);

// ============================================================
// GROUND
// ============================================================

const ground =
    new THREE.Mesh(
        new THREE.PlaneGeometry(
            6000,
            12000
        ),
        new THREE.MeshStandardMaterial({
            color: 0x4d8c3d,
            roughness: 1
        })
    );

ground.rotation.x =
    -Math.PI / 2;

ground.position.y = -0.08;

ground.position.z = -2000;

ground.receiveShadow = true;

scene.add(ground);

// ============================================================
// ROAD SETTINGS
// ============================================================

const ROAD_WIDTH = 18;

const ROAD_START = 1200;

const ROAD_END = -6000;

const ROAD_SEGMENTS = 600;

// ============================================================
// ROAD CURVE
// ============================================================

function roadX(z) {

    return (
        Math.sin(z * 0.0025) * 28 +
        Math.sin(z * 0.006) * 12 +
        Math.sin(z * 0.014) * 4
    );
}

// ============================================================
// CREATE CURVED ROAD
// ============================================================

const roadPositions = [];
const roadUVs = [];
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

    const center =
        roadX(z);

    const left =
        center -
        ROAD_WIDTH / 2;

    const right =
        center +
        ROAD_WIDTH / 2;

    roadPositions.push(
        left, 0, z,
        right, 0, z
    );

    roadUVs.push(
        0, t * 100,
        1, t * 100
    );

    if (
        i < ROAD_SEGMENTS
    ) {

        const a = i * 2;
        const b = a + 1;
        const c = a + 2;
        const d = a + 3;

        roadIndices.push(
            a, c, b,
            b, c, d
        );
    }
}

const roadGeometry =
    new THREE.BufferGeometry();

roadGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
        roadPositions,
        3
    )
);

roadGeometry.setAttribute(
    "uv",
    new THREE.Float32BufferAttribute(
        roadUVs,
        2
    )
);

roadGeometry.setIndex(
    roadIndices
);

roadGeometry.computeVertexNormals();

const road =
    new THREE.Mesh(
        roadGeometry,
        new THREE.MeshStandardMaterial({
            color: 0x292929,
            roughness: 0.92,
            metalness: 0.04,
            side: THREE.DoubleSide
        })
    );

road.receiveShadow = true;

scene.add(road);

// ============================================================
// ROAD MARKING HELPER
// ============================================================

function createRoadStrip(
    width,
    y,
    offset
) {

    const positions = [];
    const indices = [];

    const segments = ROAD_SEGMENTS;

    for (
        let i = 0;
        i <= segments;
        i++
    ) {

        const t =
            i / segments;

        const z =
            ROAD_START +
            (ROAD_END - ROAD_START) * t;

        const center =
            roadX(z);

        const x =
            center + offset;

        positions.push(
            x - width / 2,
            y,
            z,

            x + width / 2,
            y,
            z
        );

        if (
            i < segments
        ) {

            const a = i * 2;
            const b = a + 1;
            const c = a + 2;
            const d = a + 3;

            indices.push(
                a, c, b,
                b, c, d
            );
        }
    }

    const geometry =
        new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
            positions,
            3
        )
    );

    geometry.setIndex(
        indices
    );

    geometry.computeVertexNormals();

    const mesh =
        new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide
            })
        );

    scene.add(mesh);

    return mesh;
}

// ============================================================
// ROAD EDGE LINES
// ============================================================

createRoadStrip(
    0.32,
    0.045,
    -(ROAD_WIDTH / 2 - 0.55)
);

createRoadStrip(
    0.32,
    0.045,
    ROAD_WIDTH / 2 - 0.55
);

// ============================================================
// CENTER DASH MARKINGS
// ============================================================

const markingMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffffff
    });

const centerMarkings = [];

for (
    let z = ROAD_START - 10;
    z > ROAD_END;
    z -= 24
) {

    const center =
        roadX(z);

    const dash =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.32,
                0.055,
                10
            ),
            markingMaterial
        );

    dash.position.set(
        center,
        0.05,
        z
    );

    /*
       Rotate the dash so it follows
       the direction of the road.
    */

    const ahead =
        roadX(z - 2);

    const dx =
        ahead - center;

    dash.rotation.y =
        Math.atan2(
            dx,
            -2
        );

    scene.add(dash);

    centerMarkings.push(dash);
}

// ============================================================
// ROAD SHOULDERS
// ============================================================

const shoulderMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x777777,
        roughness: 1
    });

function createShoulder(side) {

    const positions = [];
    const indices = [];

    const inner =
        ROAD_WIDTH / 2;

    const outer =
        ROAD_WIDTH / 2 + 1.5;

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

        const center =
            roadX(z);

        const innerX =
            center + side * inner;

        const outerX =
            center + side * outer;

        positions.push(
            innerX,
            0.005,
            z,

            outerX,
            0.005,
            z
        );

        if (
            i < ROAD_SEGMENTS
        ) {

            const a = i * 2;
            const b = a + 1;
            const c = a + 2;
            const d = a + 3;

            indices.push(
                a, c, b,
                b, c, d
            );
        }
    }

    const geometry =
        new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
            positions,
            3
        )
    );

    geometry.setIndex(
        indices
    );

    geometry.computeVertexNormals();

    const shoulder =
        new THREE.Mesh(
            geometry,
            shoulderMaterial
        );

    shoulder.receiveShadow = true;

    scene.add(shoulder);
}

createShoulder(-1);
createShoulder(1);

// ============================================================
// MOUNTAINS
// ============================================================

const mountainMaterials = [
    new THREE.MeshStandardMaterial({
        color: 0x526d50,
        roughness: 1
    }),
    new THREE.MeshStandardMaterial({
        color: 0x657c5e,
        roughness: 1
    })
];

for (
    let z = 1000;
    z > -5800;
    z -= 240
) {

    const center =
        roadX(z);

    for (
        const side of [-1, 1]
    ) {

        const height =
            45 +
            Math.random() * 65;

        const mountain =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    28 +
                    Math.random() * 25,
                    height,
                    9
                ),
                mountainMaterials[
                    Math.floor(
                        Math.random() * 2
                    )
                ]
            );

        mountain.position.set(
            center +
            side *
            (
                65 +
                Math.random() * 45
            ),
            height / 2,
            z +
            Math.random() * 100 -
            50
        );

        mountain.scale.x =
            1.2 +
            Math.random() * 0.8;

        mountain.castShadow = true;

        scene.add(mountain);
    }
}

// ============================================================
// TREES
// ============================================================

function createTree(
    x,
    z,
    scale
) {

    const tree =
        new THREE.Group();

    const trunk =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.32,
                0.48,
                4,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x604225,
                roughness: 1
            })
        );

    trunk.position.y = 2;

    tree.add(trunk);

    const leaves =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                2.6,
                6.5,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x176b2c,
                roughness: 1
            })
        );

    leaves.position.y = 6;

    tree.add(leaves);

    tree.position.set(
        x,
        0,
        z
    );

    tree.scale.setScalar(
        scale
    );

    tree.traverse(
        object => {

            if (
                object.isMesh
            ) {
                object.castShadow = true;
            }
        }
    );

    scene.add(tree);
}

for (
    let z = 1000;
    z > -5800;
    z -= 42
) {

    const center =
        roadX(z);

    createTree(
        center -
        23 -
        Math.random() * 12,
        z,
        0.8 +
        Math.random() * 0.5
    );

    createTree(
        center +
        23 +
        Math.random() * 12,
        z +
        Math.random() * 15,
        0.8 +
        Math.random() * 0.5
    );
}

// ============================================================
// PLAYER CAR
// ============================================================

const car =
    new THREE.Group();

scene.add(car);

// ============================================================
// CAR MATERIALS
// ============================================================

const redPaint =
    new THREE.MeshStandardMaterial({
        color: 0xc91420,
        metalness: 0.45,
        roughness: 0.24
    });

const darkMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111820,
        metalness: 0.3,
        roughness: 0.2
    });

const blackMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x101010,
        roughness: 0.85
    });

// ============================================================
// MAIN BODY
// ============================================================

const body =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.9,
            0.68,
            5.3
        ),
        redPaint
    );

body.position.y =
    0.82;

body.castShadow = true;

car.add(body);

// ============================================================
// LOWER BODY
// ============================================================

const lowerBody =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            3.05,
            0.34,
            4.8
        ),
        redPaint
    );

lowerBody.position.y =
    0.55;

lowerBody.castShadow = true;

car.add(lowerBody);

// ============================================================
// CABIN
// ============================================================

const cabin =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.3,
            0.85,
            2.45
        ),
        darkMaterial
    );

cabin.position.set(
    0,
    1.48,
    0.2
);

cabin.castShadow = true;

car.add(cabin);

// ============================================================
// ROOF
// ============================================================

const roof =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.12,
            0.15,
            2.1
        ),
        redPaint
    );

roof.position.set(
    0,
    1.94,
    0.2
);

roof.castShadow = true;

car.add(roof);

// ============================================================
// HOOD
// ============================================================

const hood =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.55,
            0.18,
            1.4
        ),
        redPaint
    );

hood.position.set(
    0,
    1.08,
    -1.75
);

car.add(hood);

// ============================================================
// FRONT BUMPER
// ============================================================

const frontBumper =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.75,
            0.3,
            0.25
        ),
        blackMaterial
    );

frontBumper.position.set(
    0,
    0.55,
    -2.65
);

car.add(frontBumper);

// ============================================================
// REAR BUMPER
// ============================================================

const rearBumper =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.75,
            0.3,
            0.25
        ),
        blackMaterial
    );

rearBumper.position.set(
    0,
    0.55,
    2.65
);

car.add(rearBumper);

// ============================================================
// SPOILER
// ============================================================

const spoilerBar =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.3,
            0.12,
            0.3
        ),
        redPaint
    );

spoilerBar.position.set(
    0,
    1.72,
    2.15
);

car.add(spoilerBar);

for (
    const x of [-0.9, 0.9]
) {

    const support =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.12,
                0.5,
                0.15
            ),
            redPaint
        );

    support.position.set(
        x,
        1.45,
        2.15
    );

    car.add(support);
}

// ============================================================
// HEADLIGHTS
// ============================================================

const headlightMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 1.4
    });

for (
    const x of [-0.9, 0.9]
) {

    const light =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.65,
                0.18,
                0.08
            ),
            headlightMaterial
        );

    light.position.set(
        x,
        1.05,
        -2.48
    );

    car.add(light);
}

// ============================================================
// TAIL LIGHTS
// ============================================================

const tailMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x600000,
        emissive: 0xff0000,
        emissiveIntensity: 0.7
    });

for (
    const x of [-0.9, 0.9]
) {

    const light =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.65,
                0.18,
                0.08
            ),
            tailMaterial
        );

    light.position.set(
        x,
        0.98,
        2.48
    );

    car.add(light);
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
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.52,
                0.52,
                0.38,
                24
            ),
            blackMaterial
        );

    wheel.rotation.z =
        Math.PI / 2;

    wheel.position.set(
        x,
        0.5,
        z
    );

    wheel.castShadow = true;

    car.add(wheel);

    wheels.push(wheel);

    if (front) {
        frontWheels.push(wheel);
    }
}

createWheel(-1.5, -1.7, true);
createWheel(1.5, -1.7, true);
createWheel(-1.5, 1.7, false);
createWheel(1.5, 1.7, false);

// ============================================================
// START POSITION
// ============================================================

car.position.set(
    roadX(0),
    0,
    0
);

// ============================================================
// PHYSICS
// ============================================================

let speed = 0;

let steeringInput = 0;

let rpm = 900;

let gear = 1;

let bodyRoll = 0;

const MAX_SPEED = 3.8;

const ACCELERATION = 0.022;

const BRAKING = 0.075;

const FRICTION = 0.004;

const MAX_STEERING = 0.026;

// ============================================================
// CONTROL STATES
// ============================================================

let gasPressed = false;
let brakePressed = false;
let leftPressed = false;
let rightPressed = false;

// ============================================================
// TOUCH CONTROLS
// ============================================================

function setupButton(
    id,
    press,
    release
) {

    const button =
        document.getElementById(id);

    if (!button) {
        return;
    }

    button.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            press();
        }
    );

    button.addEventListener(
        "pointerup",
        event => {

            event.preventDefault();

            release();
        }
    );

    button.addEventListener(
        "pointercancel",
        release
    );

    button.addEventListener(
        "pointerleave",
        release
    );
}

setupButton(
    "gas",
    () => {
        gasPressed = true;
    },
    () => {
        gasPressed = false;
    }
);

setupButton(
    "brake",
    () => {
        brakePressed = true;
    },
    () => {
        brakePressed = false;
    }
);

setupButton(
    "left",
    () => {
        leftPressed = true;
    },
    () => {
        leftPressed = false;
    }
);

setupButton(
    "right",
    () => {
        rightPressed = true;
    },
    () => {
        rightPressed = false;
    }
);

// ============================================================
// KEYBOARD
// ============================================================

window.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();

        if (
            key === "w" ||
            event.key === "ArrowUp"
        ) {
            gasPressed = true;
        }

        if (
            key === "s" ||
            event.key === "ArrowDown"
        ) {
            brakePressed = true;
        }

        if (
            key === "a" ||
            event.key === "ArrowLeft"
        ) {
            leftPressed = true;
        }

        if (
            key === "d" ||
            event.key === "ArrowRight"
        ) {
            rightPressed = true;
        }
    }
);

window.addEventListener(
    "keyup",
    event => {

        const key =
            event.key.toLowerCase();

        if (
            key === "w" ||
            event.key === "ArrowUp"
        ) {
            gasPressed = false;
        }

        if (
            key === "s" ||
            event.key === "ArrowDown"
        ) {
            brakePressed = false;
        }

        if (
            key === "a" ||
            event.key === "ArrowLeft"
        ) {
            leftPressed = false;
        }

        if (
            key === "d" ||
            event.key === "ArrowRight"
        ) {
            rightPressed = false;
        }
    }
);

// ============================================================
// TRAFFIC
// ============================================================

const traffic = [];

function createTrafficCar(
    z,
    lane
) {

    const trafficCar =
        new THREE.Group();

    const colors = [
        0x1e5bd7,
        0xf2c300,
        0xffffff,
        0x222222,
        0x00a86b
    ];

    const material =
        new THREE.MeshStandardMaterial({
            color:
                colors[
                    Math.floor(
                        Math.random() *
                        colors.length
                    )
                ],
            metalness: 0.25,
            roughness: 0.4
        });

    const trafficBody =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.5,
                0.7,
                4.5
            ),
            material
        );

    trafficBody.position.y =
        0.75;

    trafficBody.castShadow = true;

    trafficCar.add(
        trafficBody
    );

    trafficCar.position.set(
        roadX(z) + lane,
        0,
        z
    );

    scene.add(
        trafficCar
    );

    traffic.push({
        mesh: trafficCar,
        lane: lane,
        speed:
            0.65 +
            Math.random() * 0.5
    });
}

for (
    let i = 0;
    i < 14;
    i++
) {

    createTrafficCar(
        -180 -
        i * 170 -
        Math.random() * 80,
        i % 2 === 0
            ? -4
            : 4
    );
}

// ============================================================
// CAR UPDATE
// ============================================================

function updateCar() {

    // --------------------------------------------------------
    // ACCELERATION
    // --------------------------------------------------------

    if (gasPressed) {

        const factor =
            1 -
            (
                speed /
                MAX_SPEED
            ) * 0.42;

        speed +=
            ACCELERATION *
            Math.max(
                factor,
                0.38
            );
    }

    // --------------------------------------------------------
    // BRAKING
    // --------------------------------------------------------

    if (brakePressed) {

        speed -= BRAKING;
    }

    // --------------------------------------------------------
    // FRICTION
    // --------------------------------------------------------

    if (
        !gasPressed &&
        !brakePressed
    ) {

        speed -= FRICTION;
    }

    speed =
        THREE.MathUtils.clamp(
            speed,
            0,
            MAX_SPEED
        );

    // --------------------------------------------------------
    // STEERING
    // --------------------------------------------------------

    let targetSteering = 0;

    if (leftPressed) {
        targetSteering = 1;
    }

    if (rightPressed) {
        targetSteering = -1;
    }

    steeringInput =
        THREE.MathUtils.lerp(
            steeringInput,
            targetSteering,
            0.12
        );

    const speedFactor =
        1 -
        (
            speed /
            MAX_SPEED
        ) * 0.25;

    const steering =
        steeringInput *
        MAX_STEERING *
        Math.max(
            speedFactor,
            0.65
        );

    car.rotation.y +=
        steering * speed;

    // --------------------------------------------------------
    // BODY ROLL
    // --------------------------------------------------------

    const targetRoll =
        -steeringInput *
        Math.min(
            speed * 0.07,
            0.08
        );

    bodyRoll =
        THREE.MathUtils.lerp(
            bodyRoll,
            targetRoll,
            0.08
        );

    body.rotation.z =
        bodyRoll;

    cabin.rotation.z =
        bodyRoll * 0.65;

    roof.rotation.z =
        bodyRoll * 0.65;

    hood.rotation.z =
        bodyRoll;

    // --------------------------------------------------------
    // MOVE
    // --------------------------------------------------------

    car.translateZ(
        -speed
    );

    // --------------------------------------------------------
    // ROAD GRIP
    // --------------------------------------------------------

    const center =
        roadX(
            car.position.z
        );

    const roadOffset =
        car.position.x -
        center;

    if (
        Math.abs(roadOffset) >
        ROAD_WIDTH / 2
    ) {

        speed *= 0.975;
    }

    // --------------------------------------------------------
    // WHEELS
    // --------------------------------------------------------

    wheels.forEach(
        wheel => {

            wheel.rotation.x -=
                speed * 1.7;
        }
    );

    frontWheels.forEach(
        wheel => {

            wheel.rotation.y =
                -steeringInput * 0.45;
        }
    );

    // --------------------------------------------------------
    // RPM
    // --------------------------------------------------------

    rpm =
        900 +
        (
            speed /
            MAX_SPEED
        ) * 6500;

    // --------------------------------------------------------
    // AUTOMATIC GEARS
    // --------------------------------------------------------

    if (speed < 0.65) {
        gear = 1;
    }
    else if (speed < 1.3) {
        gear = 2;
    }
    else if (speed < 2.0) {
        gear = 3;
    }
    else if (speed < 2.8) {
        gear = 4;
    }
    else {
        gear = 5;
    }

    // --------------------------------------------------------
    // SPEED UI
    // --------------------------------------------------------

    const kmh =
        Math.round(
            speed * 70
        );

    const speedElement =
        document.getElementById(
            "speed"
        );

    if (speedElement) {

        speedElement.textContent =
            kmh;
    }

    // --------------------------------------------------------
    // GEAR UI
    // --------------------------------------------------------

    const gearElement =
        document.getElementById(
            "gear"
        );

    if (gearElement) {

        gearElement.textContent =
            speed < 0.03
                ? "N"
                : gear;
    }
}

// ============================================================
// TRAFFIC UPDATE
// ============================================================

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

            if (
                trafficCar.mesh.position.z >
                car.position.z + 100
            ) {

                trafficCar.mesh.position.z =
                    car.position.z -
                    1500 -
                    Math.random() * 700;

                trafficCar.lane =
                    Math.random() > 0.5
                        ? -4
                        : 4;

                trafficCar.speed =
                    0.65 +
                    Math.random() * 0.5;
            }
        }
    );
}

// ============================================================
// COLLISION
// ============================================================

function checkCollisions() {

    const playerBox =
        new THREE.Box3()
            .setFromObject(car);

    traffic.forEach(
        trafficCar => {

            const trafficBox =
                new THREE.Box3()
                    .setFromObject(
                        trafficCar.mesh
                    );

            if (
                playerBox.intersectsBox(
                    trafficBox
                )
            ) {

                speed *= 0.25;
            }
        }
    );
}

// ============================================================
// CAMERA
// ============================================================

function updateCamera() {

    const cameraOffset =
        new THREE.Vector3(
            0,
            5.2,
            11
        );

    cameraOffset.applyQuaternion(
        car.quaternion
    );

    const desired =
        car.position.clone()
            .add(cameraOffset);

    camera.position.lerp(
        desired,
        0.075
    );

    const lookOffset =
        new THREE.Vector3(
            0,
            1.1,
            -14
        );

    lookOffset.applyQuaternion(
        car.quaternion
    );

    const target =
        car.position.clone()
            .add(lookOffset);

    camera.lookAt(target);
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
