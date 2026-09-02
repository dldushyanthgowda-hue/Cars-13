// ==========================================
// CARS 13 — VERSION 3
// Traffic + Collision + Progress
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
// LIGHTS
// ==========================================

const sun = new THREE.DirectionalLight(0xffffff, 2.2);

sun.position.set(100, 150, 80);
sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

scene.add(sun);

scene.add(
    new THREE.HemisphereLight(
        0x9ed8ff,
        0x385438,
        1.1
    )
);

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
// PLAYER CAR
// ==========================================

const car = new THREE.Group();

scene.add(car);

// Body
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

// ==========================================
// PLAYER WHEELS
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
// TRAFFIC
// ==========================================

const trafficCars = [];

function createTrafficCar(x, z) {

    const traffic = new THREE.Group();

    const colors = [
        0x1565c0,
        0xf5f5f5,
        0xffc107,
        0x222222,
        0x00a86b
    ];

    const color =
        colors[Math.floor(Math.random() * colors.length)];

    const trafficBody = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.75, 4.7),
        new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.35,
            roughness: 0.4
        })
    );

    trafficBody.position.y = 1;
    trafficBody.castShadow = true;

    traffic.add(trafficBody);

    const trafficCabin = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.75, 2),
        new THREE.MeshStandardMaterial({
            color: 0x18232d,
            roughness: 0.15
        })
    );

    trafficCabin.position.set(0, 1.55, 0.2);

    traffic.add(trafficCabin);

    // Wheels
    for (const wheelX of [-1.45, 1.45]) {

        for (const wheelZ of [-1.45, 1.45]) {

            const wheel = new THREE.Mesh(
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

            wheel.rotation.z = Math.PI / 2;

            wheel.position.set(
                wheelX,
                0.55,
                wheelZ
            );

            traffic.add(wheel);
        }
    }

    traffic.position.set(x, 0, z);

    scene.add(traffic);

    trafficCars.push({
        mesh: traffic,
        speed: 0.35 + Math.random() * 0.35
    });
}

// Create traffic

createTrafficCar(-4, -20);
createTrafficCar(4, -80);
createTrafficCar(-3.5, -150);
createTrafficCar(3.5, -230);
createTrafficCar(-4, -320);
createTrafficCar(4, -420);

// ==========================================
// TREES
// ==========================================

function createTree(x, z) {

    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(
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
// PLAYER START
// ==========================================

car.position.set(0, 0, 20);

// ==========================================
// PHYSICS
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

    const key = event.key.toLowerCase();

    if (key === "arrowup" || key === "w")
        gasPressed = true;

    if (key === "arrowdown" || key === "s")
        brakePressed = true;

    if (key === "arrowleft" || key === "a")
        leftPressed = true;

    if (key === "arrowright" || key === "d")
        rightPressed = true;
});

window.addEventListener("keyup", event => {

    const key = event.key.toLowerCase();

    if (key === "arrowup" || key === "w")
        gasPressed = false;

    if (key === "arrowdown" || key === "s")
        brakePressed = false;

    if (key === "arrowleft" || key === "a")
        leftPressed = false;

    if (key === "arrowright" || key === "d")
        rightPressed = false;
});

// ==========================================
// MOBILE
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
// COLLISION
// ==========================================

function checkCollisions() {

    const playerBox =
        new THREE.Box3().setFromObject(car);

    for (const traffic of trafficCars) {

        const trafficBox =
            new THREE.Box3().setFromObject(
                traffic.mesh
            );

        if (playerBox.intersectsBox(trafficBox)) {

            speed *= 0.25;

            // Push player slightly backward
            car.translateZ(1.5);

            // Push traffic away
            traffic.mesh.translateZ(-1);

            break;
        }
    }
}

// ==========================================
// TRAFFIC UPDATE
// ==========================================

function updateTraffic() {

    trafficCars.forEach(traffic => {

        traffic.mesh.translateZ(
            -traffic.speed
        );

        // Recycle cars after they go far away
        if (traffic.mesh.position.z < car.position.z - 100) {

            traffic.mesh.position.z =
                car.position.z - 500 - Math.random() * 300;

            const lanes = [-4, 0, 4];

            traffic.mesh.position.x =
                lanes[Math.floor(
                    Math.random() * lanes.length
                )];
        }
    });
}

// ==========================================
// CAR UPDATE
// ==========================================

function updateCar() {

    if (gasPressed)
        speed += ACCELERATION;

    if (brakePressed)
        speed -= BRAKING;

    if (!gasPressed && !brakePressed) {

        if (speed > 0)
            speed -= FRICTION;
    }

    speed = THREE.MathUtils.clamp(
        speed,
        0,
        MAX_SPEED
    );

    if (leftPressed)
        steering = 1;
    else if (rightPressed)
        steering = -1;
    else
        steering = 0;

    car.rotation.y +=
        steering *
        speed *
        0.020;

    car.translateZ(-speed);

    car.position.x = THREE.MathUtils.clamp(
        car.position.x,
        -6.2,
        6.2
    );

    // Wheel steering
    frontWheels.forEach(wheel => {

        wheel.rotation.y =
            -steering * 0.35;

        wheel.rotation.x -=
            speed * 1.5;
    });

    wheels.forEach(wheel => {

        if (!frontWheels.includes(wheel))
            wheel.rotation.x -= speed * 1.5;
    });

    checkCollisions();

    // Speedometer
    const kmh = Math.round(speed * 70);

    document.getElementById("speed").textContent =
        kmh;

    // Gear
    let gear = "N";

    if (speed > 0.05) gear = "1";
    if (speed > 0.55) gear = "2";
    if (speed > 1.0) gear = "3";
    if (speed > 1.4) gear = "4";

    document.getElementById("gear").textContent =
        gear;
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
            4.5,
            10
        );

    desiredPosition.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        car.rotation.y
    );

    desiredPosition.add(
        car.position
    );

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

    cameraTarget.add(
        car.position
    );

    camera.lookAt(cameraTarget);
}

// ==========================================
// GAME LOOP
// ==========================================

function animate() {

    requestAnimationFrame(animate);

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
