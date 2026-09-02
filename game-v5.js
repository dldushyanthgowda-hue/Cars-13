// ==========================================
// CARS 13 — VERSION 4
// Curved Road + Mountains + Scenery
// Traffic + Collision + Mobile Controls
// ==========================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 100, 600);

// ==========================================
// CAMERA
// ==========================================

const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    2500
);

camera.position.set(0, 5, 10);

// ==========================================
// RENDERER
// ==========================================

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

document.body.appendChild(renderer.domElement);

// ==========================================
// LIGHTING
// ==========================================

const sun = new THREE.DirectionalLight(
    0xffffff,
    2.4
);

sun.position.set(
    100,
    160,
    80
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

scene.add(sun);

const skyLight =
    new THREE.HemisphereLight(
        0x9ed8ff,
        0x365936,
        1.2
    );

scene.add(skyLight);

// ==========================================
// GROUND
// ==========================================

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(
        2500,
        2500
    ),
    new THREE.MeshStandardMaterial({
        color: 0x438943,
        roughness: 1
    })
);

ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;

scene.add(ground);

// ==========================================
// ROAD SYSTEM
// ==========================================

const roadWidth = 18;
const roadLength = 2200;
const roadSegments = 220;

// Road curve function
function roadX(z) {

    return (
        Math.sin(z * 0.006) * 18 +
        Math.sin(z * 0.014) * 7
    );
}

// Road pieces
const roadMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x292929,
        roughness: 0.92
    });

const roads = [];

for (
    let i = 0;
    i < roadSegments;
    i++
) {

    const z =
        -1100 +
        i *
        (roadLength / roadSegments);

    const nextZ =
        z +
        (roadLength / roadSegments);

    const x1 = roadX(z);
    const x2 = roadX(nextZ);

    const dx = x2 - x1;

    const dz = nextZ - z;

    const angle =
        Math.atan2(dx, dz);

    const length =
        Math.sqrt(
            dx * dx +
            dz * dz
        );

    const roadPiece =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                roadWidth,
                length + 1
            ),
            roadMaterial
        );

    roadPiece.rotation.x =
        -Math.PI / 2;

    roadPiece.rotation.z =
        angle;

    roadPiece.position.set(
        (x1 + x2) / 2,
        0.02,
        (z + nextZ) / 2
    );

    roadPiece.receiveShadow = true;

    scene.add(roadPiece);

    roads.push(roadPiece);
}

// ==========================================
// ROAD CENTER MARKINGS
// ==========================================

const lineMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffffff
    });

for (
    let z = -1080;
    z < 1080;
    z += 18
) {

    const x =
        roadX(z);

    const nextX =
        roadX(z + 1);

    const angle =
        Math.atan2(
            nextX - x,
            1
        );

    const line =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                0.35,
                8
            ),
            lineMaterial
        );

    line.rotation.x =
        -Math.PI / 2;

    line.rotation.z =
        angle;

    line.position.set(
        x,
        0.055,
        z
    );

    scene.add(line);
}

// ==========================================
// ROAD EDGE MARKINGS
// ==========================================

for (
    let z = -1080;
    z < 1080;
    z += 10
) {

    const center =
        roadX(z);

    const next =
        roadX(z + 1);

    const angle =
        Math.atan2(
            next - center,
            1
        );

    for (
        const side of [-1, 1]
    ) {

        const edge =
            new THREE.Mesh(
                new THREE.PlaneGeometry(
                    0.25,
                    6
                ),
                lineMaterial
            );

        edge.rotation.x =
            -Math.PI / 2;

        edge.rotation.z =
            angle;

        edge.position.set(
            center +
            side *
            (roadWidth / 2 - 0.5),
            0.06,
            z
        );

        scene.add(edge);
    }
}

// ==========================================
// MOUNTAINS
// ==========================================

function createMountain(
    x,
    z,
    scale
) {

    const mountain =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                45 * scale,
                80 * scale,
                7
            ),
            new THREE.MeshStandardMaterial({
                color: 0x526b52,
                roughness: 1
            })
        );

    mountain.position.set(
        x,
        40 * scale,
        z
    );

    mountain.castShadow = true;

    scene.add(mountain);
}

for (
    let z = -1000;
    z < 1000;
    z += 150
) {

    createMountain(
        -100 -
        Math.random() * 60,
        z,
        0.8 +
        Math.random() * 0.8
    );

    createMountain(
        100 +
        Math.random() * 60,
        z + 70,
        0.8 +
        Math.random() * 0.8
    );
}

// ==========================================
// TREES
// ==========================================

function createTree(x, z) {

    const tree =
        new THREE.Group();

    const trunk =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.25,
                0.4,
                3,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x704522
            })
        );

    trunk.position.y = 1.5;
    trunk.castShadow = true;

    tree.add(trunk);

    const leaves =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                1.6,
                12,
                12
            ),
            new THREE.MeshStandardMaterial({
                color: 0x176b2c
            })
        );

    leaves.position.y = 3.7;
    leaves.castShadow = true;

    tree.add(leaves);

    tree.position.set(
        x,
        0,
        z
    );

    scene.add(tree);
}

for (
    let z = -1050;
    z < 1050;
    z += 25
) {

    const center =
        roadX(z);

    createTree(
        center - 17 -
        Math.random() * 10,
        z
    );

    createTree(
        center + 17 +
        Math.random() * 10,
        z + 10
    );
}

// ==========================================
// ROAD SIGNS
// ==========================================

function createSign(
    x,
    z,
    text
) {

    const group =
        new THREE.Group();

    const pole =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.08,
                0.08,
                3,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x777777
            })
        );

    pole.position.y = 1.5;

    group.add(pole);

    const board =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.8,
                1,
                0.12
            ),
            new THREE.MeshStandardMaterial({
                color: 0xffcc00
            })
        );

    board.position.y = 3;

    group.add(board);

    group.position.set(
        x,
        0,
        z
    );

    scene.add(group);
}

// Signs along the road

for (
    let z = -900;
    z < 900;
    z += 250
) {

    const center =
        roadX(z);

    createSign(
        center - 14,
        z,
        "ROAD"
    );
}

// ==========================================
// PLAYER CAR
// ==========================================

const car =
    new THREE.Group();

scene.add(car);

// Body
const body =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            3,
            0.75,
            5
        ),
        new THREE.MeshStandardMaterial({
            color: 0xb90000,
            metalness: 0.45,
            roughness: 0.3
        })
    );

body.position.y = 1;
body.castShadow = true;

car.add(body);

// Cabin
const cabin =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.5,
            0.85,
            2.3
        ),
        new THREE.MeshStandardMaterial({
            color: 0x101820,
            metalness: 0.25,
            roughness: 0.12
        })
    );

cabin.position.set(
    0,
    1.65,
    0.15
);

cabin.castShadow = true;

car.add(cabin);

// Hood
const hood =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.75,
            0.35,
            1.5
        ),
        new THREE.MeshStandardMaterial({
            color: 0xc90000,
            metalness: 0.4,
            roughness: 0.3
        })
    );

hood.position.set(
    0,
    1.35,
    -1.55
);

hood.castShadow = true;

car.add(hood);

// ==========================================
// PLAYER WHEELS
// ==========================================

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

    wheel.rotation.z =
        Math.PI / 2;

    wheel.position.set(
        x,
        0.58,
        z
    );

    wheel.castShadow = true;

    car.add(wheel);

    wheels.push(wheel);

    if (front) {
        frontWheels.push(wheel);
    }
}

createWheel(
    -1.55,
    -1.55,
    true
);

createWheel(
    1.55,
    -1.55,
    true
);

createWheel(
    -1.55,
    1.55,
    false
);

createWheel(
    1.55,
    1.55,
    false
);

// ==========================================
// TRAFFIC
// ==========================================

const trafficCars = [];

function createTrafficCar(
    lane,
    z
) {

    const traffic =
        new THREE.Group();

    const colors = [
        0x1565c0,
        0xf5f5f5,
        0xffc107,
        0x222222,
        0x00a86b
    ];

    const color =
        colors[
            Math.floor(
                Math.random() *
                colors.length
            )
        ];

    const trafficBody =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.8,
                0.75,
                4.7
            ),
            new THREE.MeshStandardMaterial({
                color: color,
                metalness: 0.35,
                roughness: 0.4
            })
        );

    trafficBody.position.y = 1;
    trafficBody.castShadow = true;

    traffic.add(
        trafficBody
    );

    const trafficCabin =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.3,
                0.75,
                2
            ),
            new THREE.MeshStandardMaterial({
                color: 0x18232d,
                roughness: 0.15
            })
        );

    trafficCabin.position.set(
        0,
        1.55,
        0.2
    );

    traffic.add(
        trafficCabin
    );

    // Wheels
    for (
        const wheelX of [-1.45, 1.45]
    ) {

        for (
            const wheelZ of [-1.45, 1.45]
        ) {

            const wheel =
                new THREE.Mesh(
                    new THREE.CylinderGeometry(
                        0.5,
                        0.5,
                        0.38,
                        16
                    ),
                    new THREE.MeshStandardMaterial({
                        color: 0x111111
                    })
                );

            wheel.rotation.z =
                Math.PI / 2;

            wheel.position.set(
                wheelX,
                0.55,
                wheelZ
            );

            traffic.add(wheel);
        }
    }

    const roadCenter =
        roadX(z);

    traffic.position.set(
        roadCenter + lane,
        0,
        z
    );

    scene.add(
        traffic
    );

    trafficCars.push({
        mesh: traffic,
        speed:
            0.30 +
            Math.random() * 0.30,
        lane: lane
    });
}

// Traffic positions
createTrafficCar(-4, -40);
createTrafficCar(4, -110);
createTrafficCar(-4, -200);
createTrafficCar(4, -300);
createTrafficCar(-4, -420);
createTrafficCar(4, -550);
createTrafficCar(-4, -700);

// ==========================================
// PLAYER START
// ==========================================

car.position.set(
    roadX(20),
    0,
    20
);

// ==========================================
// V5 REALISTIC PHYSICS
// ==========================================

let speed = 0;
let steering = 0;
let steeringInput = 0;

let rpm = 900;
let currentGear = 1;

const MAX_SPEED = 2.4;
const ACCELERATION = 0.010;
const BRAKING = 0.055;
const FRICTION = 0.0035;

const MAX_STEERING = 0.035;

let gasPressed = false;
let brakePressed = false;
let leftPressed = false;
let rightPressed = false;

// Suspension
let suspensionBounce = 0;

// Body roll
let bodyRoll = 0;

// ==========================================
// KEYBOARD
// ==========================================

window.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();

        if (
            key === "arrowup" ||
            key === "w"
        )
            gasPressed = true;

        if (
            key === "arrowdown" ||
            key === "s"
        )
            brakePressed = true;

        if (
            key === "arrowleft" ||
            key === "a"
        )
            leftPressed = true;

        if (
            key === "arrowright" ||
            key === "d"
        )
            rightPressed = true;
    }
);

window.addEventListener(
    "keyup",
    event => {

        const key =
            event.key.toLowerCase();

        if (
            key === "arrowup" ||
            key === "w"
        )
            gasPressed = false;

        if (
            key === "arrowdown" ||
            key === "s"
        )
            brakePressed = false;

        if (
            key === "arrowleft" ||
            key === "a"
        )
            leftPressed = false;

        if (
            key === "arrowright" ||
            key === "d"
        )
            rightPressed = false;
    }
);

// ==========================================
// MOBILE CONTROLS
// ==========================================

function setupButton(
    id,
    press,
    release
) {

    const button =
        document.getElementById(id);

    button.addEventListener(
        "pointerdown",
        e => {
            e.preventDefault();
            press();
        }
    );

    button.addEventListener(
        "pointerup",
        e => {
            e.preventDefault();
            release();
        }
    );

    button.addEventListener(
        "pointerleave",
        release
    );

    button.addEventListener(
        "pointercancel",
        release
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

// ==========================================
// COLLISION
// ==========================================

function checkCollisions() {

    const playerBox =
        new THREE.Box3()
        .setFromObject(car);

    for (
        const traffic of trafficCars
    ) {

        const trafficBox =
            new THREE.Box3()
            .setFromObject(
                traffic.mesh
            );

        if (
            playerBox.intersectsBox(
                trafficBox
            )
        ) {

            speed *= 0.2;

            car.translateZ(1.5);

            traffic.mesh.translateZ(-1);

            break;
        }
    }
}

// ==========================================
// TRAFFIC UPDATE
// ==========================================

function updateTraffic() {

    trafficCars.forEach(
        traffic => {

            traffic.mesh.translateZ(
                -traffic.speed
            );

            // Keep traffic following road
            const z =
                traffic.mesh.position.z;

            traffic.mesh.position.x =
                roadX(z) +
                traffic.lane;

            // Recycle traffic
            if (
                z <
                car.position.z - 120
            ) {

                const newZ =
                    car.position.z -
                    500 -
                    Math.random() *
                    400;

                traffic.mesh.position.z =
                    newZ;

                traffic.mesh.position.x =
                    roadX(newZ) +
                    traffic.lane;
            }
        }
    );
}

// ==========================================
// V5 PLAYER UPDATE
// ==========================================

function updateCar() {

    // --------------------------------------
    // ACCELERATION
    // --------------------------------------

    if (gasPressed) {

        // Acceleration becomes weaker
        // at higher speeds
        const accelerationFactor =
            1 - (speed / MAX_SPEED) * 0.55;

        speed +=
            ACCELERATION *
            Math.max(
                accelerationFactor,
                0.25
            );
    }

    // --------------------------------------
    // BRAKING
    // --------------------------------------

    if (brakePressed) {

        speed -=
            BRAKING *
            Math.max(
                speed / MAX_SPEED,
                0.25
            );
    }

    // --------------------------------------
    // NATURAL FRICTION
    // --------------------------------------

    if (!gasPressed && !brakePressed) {

        if (speed > 0) {
            speed -= FRICTION;
        }
    }

    // --------------------------------------
    // ROAD / GRASS
    // --------------------------------------

    const center =
        roadX(car.position.z);

    const roadOffset =
        car.position.x - center;

    if (Math.abs(roadOffset) > 7) {

        // Grass slows the car
        speed *= 0.975;
    }

    // --------------------------------------
    // SPEED LIMIT
    // --------------------------------------

    speed = THREE.MathUtils.clamp(
        speed,
        0,
        MAX_SPEED
    );

    // --------------------------------------
    // STEERING INPUT
    // --------------------------------------

    let targetSteering = 0;

    if (leftPressed) {
        targetSteering = 1;
    }

    if (rightPressed) {
        targetSteering = -1;
    }

    // Smooth steering
    steeringInput =
        THREE.MathUtils.lerp(
            steeringInput,
            targetSteering,
            0.12
        );

    // Steering becomes less sensitive
    // at very high speed
    const speedFactor =
        1 -
        (speed / MAX_SPEED) * 0.35;

    steering =
        steeringInput *
        MAX_STEERING *
        Math.max(
            speedFactor,
            0.55
        );

    car.rotation.y +=
        steering * speed;

    // --------------------------------------
    // BODY ROLL
    // --------------------------------------

    const targetRoll =
        -steeringInput *
        Math.min(
            speed * 0.08,
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

    hood.rotation.z =
        bodyRoll;

    // --------------------------------------
    // SUSPENSION
    // --------------------------------------

    const suspensionTarget =
        Math.sin(
            Date.now() * 0.018
        ) *
        speed *
        0.025;

    suspensionBounce =
        THREE.MathUtils.lerp(
            suspensionBounce,
            suspensionTarget,
            0.08
        );

    car.position.y =
        suspensionBounce;

    // --------------------------------------
    // MOVE CAR
    // --------------------------------------

    car.translateZ(-speed);

    // --------------------------------------
    // KEEP CAR NEAR ROAD
    // --------------------------------------

    const maximumRoadOffset = 8;

    if (
        Math.abs(roadOffset) >
        maximumRoadOffset
    ) {

        speed *= 0.97;
    }

    // --------------------------------------
    // WHEELS
    // --------------------------------------

    frontWheels.forEach(
        wheel => {

            wheel.rotation.y =
                -steeringInput * 0.45;

            wheel.rotation.x -=
                speed * 1.5;
        }
    );

    wheels.forEach(
        wheel => {

            if (
                !frontWheels.includes(wheel)
            ) {

                wheel.rotation.x -=
                    speed * 1.5;
            }
        }
    );

    // --------------------------------------
    // RPM
    // --------------------------------------

    rpm =
        900 +
        (speed / MAX_SPEED) *
        6500;

    // --------------------------------------
    // AUTOMATIC GEARBOX
    // --------------------------------------

    if (speed < 0.45) {
        currentGear = 1;
    }
    else if (speed < 0.95) {
        currentGear = 2;
    }
    else if (speed < 1.45) {
        currentGear = 3;
    }
    else if (speed < 1.9) {
        currentGear = 4;
    }
    else {
        currentGear = 5;
    }

    // --------------------------------------
    // COLLISION
    // --------------------------------------

    checkCollisions();

    // --------------------------------------
    // SPEEDOMETER
    // --------------------------------------

    const kmh =
        Math.round(
            speed * 70
        );

    document.getElementById(
        "speed"
    ).textContent = kmh;

    // --------------------------------------
    // GEAR DISPLAY
    // --------------------------------------

    document.getElementById(
        "gear"
    ).textContent =
        speed < 0.03
            ? "N"
            : currentGear;
}
// ==========================================
// CAMERA
// ==========================================

const cameraTarget =
    new THREE.Vector3();

function updateCamera() {

    const desiredPosition =
        new THREE.Vector3(
            0,
            4.8,
            11
        );

    desiredPosition.applyAxisAngle(
        new THREE.Vector3(
            0,
            1,
            0
        ),
        car.rotation.y
    );

    desiredPosition.add(
        car.position
    );

    camera.position.lerp(
        desiredPosition,
        0.06
    );

    cameraTarget.set(
        car.position.x,
        car.position.y + 1,
        car.position.z - 12
    );

    cameraTarget.applyAxisAngle(
        new THREE.Vector3(
            0,
            1,
            0
        ),
        car.rotation.y
    );

    cameraTarget.add(
        car.position
    );

    camera.lookAt(
        cameraTarget
    );
}

// ==========================================
// GAME LOOP
// ==========================================

function animate() {

    requestAnimationFrame(
        animate
    );

    updateCar();
    updateTraffic();
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
