// ============================================================
// CARS 13 — V6
// Complete 3D driving game
// ============================================================

// ------------------------------------------------------------
// SCENE
// ------------------------------------------------------------

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x78c8f0);

scene.fog = new THREE.Fog(
    0x78c8f0,
    180,
    1000
);

// ------------------------------------------------------------
// CAMERA
// ------------------------------------------------------------

const camera = new THREE.PerspectiveCamera(
    72,
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
renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

document.body.appendChild(
    renderer.domElement
);

// ------------------------------------------------------------
// LIGHT
// ------------------------------------------------------------

const sun = new THREE.DirectionalLight(
    0xffffff,
    2.5
);

sun.position.set(
    100,
    150,
    80
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -150;
sun.shadow.camera.right = 150;
sun.shadow.camera.top = 150;
sun.shadow.camera.bottom = -150;

scene.add(sun);

const skyLight =
    new THREE.HemisphereLight(
        0x9edfff,
        0x355d25,
        1.5
    );

scene.add(skyLight);

// ------------------------------------------------------------
// GROUND
// ------------------------------------------------------------

const groundMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x4c8b3c,
        roughness: 1
    });

const ground =
    new THREE.Mesh(
        new THREE.PlaneGeometry(
            5000,
            5000
        ),
        groundMaterial
    );

ground.rotation.x =
    -Math.PI / 2;

ground.position.y = -0.08;

ground.receiveShadow = true;

scene.add(ground);

// ------------------------------------------------------------
// ROAD FUNCTION
// ------------------------------------------------------------

const ROAD_WIDTH = 18;

function roadX(z) {

    return (
        Math.sin(z * 0.0028) * 24 +
        Math.sin(z * 0.0065) * 10 +
        Math.sin(z * 0.015) * 4
    );
}

// ------------------------------------------------------------
// ROAD
// ------------------------------------------------------------

const roadMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x282828,
        roughness: 0.9,
        metalness: 0.05
    });

const road =
    new THREE.Mesh(
        new THREE.PlaneGeometry(
            ROAD_WIDTH,
            6000,
            1,
            1
        ),
        roadMaterial
    );

road.rotation.x =
    -Math.PI / 2;

road.position.z = -1200;

road.receiveShadow = true;

scene.add(road);

// ------------------------------------------------------------
// ROAD MARKINGS
// ------------------------------------------------------------

const whiteMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffffff
    });

for (
    let z = -4100;
    z < 1700;
    z += 22
) {

    const line =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.32,
                0.05,
                8
            ),
            whiteMaterial
        );

    line.position.set(
        roadX(z),
        0.035,
        z
    );

    scene.add(line);
}

// ------------------------------------------------------------
// ROAD EDGES
// ------------------------------------------------------------

const edgeMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffffff
    });

for (
    let z = -4100;
    z < 1700;
    z += 10
) {

    const center = roadX(z);

    for (const side of [-1, 1]) {

        const edge =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.3,
                    0.05,
                    5
                ),
                edgeMaterial
            );

        edge.position.set(
            center +
                side *
                (ROAD_WIDTH / 2 - 0.45),
            0.04,
            z
        );

        scene.add(edge);
    }
}

// ------------------------------------------------------------
// MOUNTAINS
// ------------------------------------------------------------

const mountainMaterials = [
    new THREE.MeshStandardMaterial({
        color: 0x536b4c,
        roughness: 1
    }),
    new THREE.MeshStandardMaterial({
        color: 0x65785a,
        roughness: 1
    })
];

for (
    let z = -3800;
    z < 1500;
    z += 220
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
                    30 +
                        Math.random() * 20,
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
                    60 +
                    Math.random() * 50
                ),
            height / 2,
            z +
                (Math.random() - 0.5) *
                100
        );

        mountain.scale.x =
            1.2 +
            Math.random() * 0.8;

        mountain.castShadow = true;

        scene.add(mountain);
    }
}

// ------------------------------------------------------------
// TREE
// ------------------------------------------------------------

function createTree(
    x,
    z,
    scale = 1
) {

    const tree =
        new THREE.Group();

    const trunk =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.35,
                0.5,
                4,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x654321,
                roughness: 1
            })
        );

    trunk.position.y = 2;

    tree.add(trunk);

    const leaves =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                2.7,
                6.5,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x176b2d,
                roughness: 1
            })
        );

    leaves.position.y = 6;

    tree.add(leaves);

    tree.scale.setScalar(scale);

    tree.position.set(
        x,
        0,
        z
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

// ------------------------------------------------------------
// TREES ALONG ROAD
// ------------------------------------------------------------

for (
    let z = -3800;
    z < 1500;
    z += 45
) {

    const center =
        roadX(z);

    createTree(
        center -
            20 -
            Math.random() * 15,
        z,
        0.8 +
            Math.random() * 0.5
    );

    createTree(
        center +
            20 +
            Math.random() * 15,
        z +
            Math.random() * 15,
        0.8 +
            Math.random() * 0.5
    );
}

// ------------------------------------------------------------
// PLAYER CAR
// ------------------------------------------------------------

const car =
    new THREE.Group();

scene.add(car);

// ------------------------------------------------------------
// CAR BODY
// ------------------------------------------------------------

const bodyMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xc91420,
        metalness: 0.45,
        roughness: 0.25
    });

const body =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.9,
            0.7,
            5.4
        ),
        bodyMaterial
    );

body.position.y = 0.82;

body.castShadow = true;

car.add(body);

// ------------------------------------------------------------
// LOWER BODY
// ------------------------------------------------------------

const lowerBody =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            3.05,
            0.35,
            4.8
        ),
        bodyMaterial
    );

lowerBody.position.y = 0.55;

lowerBody.castShadow = true;

car.add(lowerBody);

// ------------------------------------------------------------
// CABIN
// ------------------------------------------------------------

const cabinMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111820,
        metalness: 0.35,
        roughness: 0.18
    });

const cabin =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.35,
            0.85,
            2.5
        ),
        cabinMaterial
    );

cabin.position.set(
    0,
    1.48,
    0.25
);

cabin.castShadow = true;

car.add(cabin);

// ------------------------------------------------------------
// ROOF
// ------------------------------------------------------------

const roof =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.15,
            0.15,
            2.15
        ),
        bodyMaterial
    );

roof.position.set(
    0,
    1.93,
    0.28
);

roof.castShadow = true;

car.add(roof);

// ------------------------------------------------------------
// HOOD
// ------------------------------------------------------------

const hood =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.55,
            0.18,
            1.45
        ),
        bodyMaterial
    );

hood.position.set(
    0,
    1.1,
    -1.75
);

car.add(hood);

// ------------------------------------------------------------
// FRONT BUMPER
// ------------------------------------------------------------

const bumper =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.75,
            0.3,
            0.25
        ),
        new THREE.MeshStandardMaterial({
            color: 0x171717,
            roughness: 0.5
        })
    );

bumper.position.set(
    0,
    0.55,
    -2.65
);

car.add(bumper);

// ------------------------------------------------------------
// REAR SPOILER
// ------------------------------------------------------------

const spoiler =
    new THREE.Group();

const spoilerBar =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.3,
            0.12,
            0.3
        ),
        bodyMaterial
    );

spoilerBar.position.y =
    1.75;

spoilerBar.position.z =
    2.15;

spoiler.add(spoilerBar);

const spoilerLeft =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.12,
            0.5,
            0.15
        ),
        bodyMaterial
    );

spoilerLeft.position.set(
    -0.9,
    1.45,
    2.15
);

spoiler.add(spoilerLeft);

const spoilerRight =
    spoilerLeft.clone();

spoilerRight.position.x =
    0.9;

spoiler.add(spoilerRight);

car.add(spoiler);

// ------------------------------------------------------------
// HEADLIGHTS
// ------------------------------------------------------------

const headlightMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 1.5
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
        -2.45
    );

    car.add(light);
}

// ------------------------------------------------------------
// TAIL LIGHTS
// ------------------------------------------------------------

const tailMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x7f0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5
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
        0.95,
        2.45
    );

    car.add(light);
}

// ------------------------------------------------------------
// WHEELS
// ------------------------------------------------------------

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
            new THREE.MeshStandardMaterial({
                color: 0x101010,
                roughness: 0.85
            })
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

createWheel(
    -1.5,
    -1.7,
    true
);

createWheel(
    1.5,
    -1.7,
    true
);

createWheel(
    -1.5,
    1.7,
    false
);

createWheel(
    1.5,
    1.7,
    false
);

// ------------------------------------------------------------
// CAR START
// ------------------------------------------------------------

car.position.set(
    roadX(0),
    0,
    0
);

// ------------------------------------------------------------
// PHYSICS
// ------------------------------------------------------------

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

// ------------------------------------------------------------
// CONTROLS
// ------------------------------------------------------------

let gasPressed = false;
let brakePressed = false;
let leftPressed = false;
let rightPressed = false;

// ------------------------------------------------------------
// TOUCH BUTTONS
// ------------------------------------------------------------

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

// ------------------------------------------------------------
// KEYBOARD
// ------------------------------------------------------------

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

// ------------------------------------------------------------
// TRAFFIC
// ------------------------------------------------------------

const traffic = [];

function createTrafficCar(
    z,
    lane
) {

    const trafficCar =
        new THREE.Group();

    const colorList = [
        0x1d5fd1,
        0xf2c300,
        0xffffff,
        0x202020,
        0x00a86b
    ];

    const material =
        new THREE.MeshStandardMaterial({
            color:
                colorList[
                    Math.floor(
                        Math.random() *
                        colorList.length
                    )
                ],
            metalness: 0.3,
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
            0.7 +
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
            i * 150 -
            Math.random() * 80,
        i % 2 === 0
            ? -4
            : 4
    );
}

// ------------------------------------------------------------
// UPDATE CAR
// ------------------------------------------------------------

function updateCar() {

    // ACCELERATION

    if (gasPressed) {

        const accelerationFactor =
            1 -
            (speed / MAX_SPEED) *
            0.45;

        speed +=
            ACCELERATION *
            Math.max(
                accelerationFactor,
                0.35
            );
    }

    // BRAKING

    if (brakePressed) {

        speed -= BRAKING;
    }

    // FRICTION

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

    // STEERING

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
        (speed / MAX_SPEED) *
        0.25;

    const steering =
        steeringInput *
        MAX_STEERING *
        Math.max(
            speedFactor,
            0.65
        );

    car.rotation.y +=
        steering * speed;

    // BODY ROLL

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

    // MOVE

    car.translateZ(
        -speed
    );

    // ROAD GRIP

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

        speed *= 0.97;
    }

    // WHEELS

    wheels.forEach(
        wheel => {

            wheel.rotation.x -=
                speed * 1.7;
        }
    );

    frontWheels.forEach(
        wheel => {

            wheel.rotation.y =
                -steeringInput *
                0.45;
        }
    );

    // RPM

    rpm =
        900 +
        (speed / MAX_SPEED) *
        6500;

    // GEARBOX

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

    // SPEED DISPLAY

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

    // GEAR DISPLAY

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

            // recycle traffic

            if (
                trafficCar.mesh.position.z >
                car.position.z + 100
            ) {

                trafficCar.mesh.position.z =
                    car.position.z -
                    1500 -
                    Math.random() *
                    700;

                trafficCar.lane =
                    Math.random() > 0.5
                        ? -4
                        : 4;

                trafficCar.speed =
                    0.7 +
                    Math.random() *
                    0.5;
            }
        }
    );
}

// ------------------------------------------------------------
// COLLISION
// ------------------------------------------------------------

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

// ------------------------------------------------------------
// CAMERA
// ------------------------------------------------------------

function updateCamera() {

    const desiredPosition =
        new THREE.Vector3(
            0,
            5.2,
            11
        );

    desiredPosition.applyMatrix4(
        car.matrixWorld
    );

    camera.position.lerp(
        desiredPosition,
        0.075
    );

    const lookTarget =
        new THREE.Vector3(
            0,
            1.1,
            -12
        );

    lookTarget.applyMatrix4(
        car.matrixWorld
    );

    camera.lookAt(
        lookTarget
    );
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
