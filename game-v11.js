// ============================================================
// CARS 13 — V11
// Garage, progression, free drive, and on-foot world exploration
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
    200000
);

camera.position.set(0, 5, 12);

// ============================================================
// RENDERER
// ============================================================

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: true
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
        200000,
        200000
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

function updateInfiniteGround(playerZ) {
    // Keep the terrain centered around the player so the green world never ends.
    ground.position.z = Math.round(playerZ / 1000) * 1000;
}

// ============================================================
// ROAD
// ============================================================

const ROAD_WIDTH = 18;
const ROAD_SEGMENT_LENGTH = 600;
const RENDERED_SEGMENTS = new Map();
const secondaryRoadGroup = new THREE.Group();
const SECONDARY_ROAD_OFFSET = 78;
const SECONDARY_ROAD_WIDTH = 12;
const RENDERED_SECONDARY_SEGMENTS = new Map();

const ROAD_START = 1200;
const ROAD_END = -6000;

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

function secondaryRoadX(z) {
    return roadX(z) + SECONDARY_ROAD_OFFSET +
        Math.sin(z * 0.004) * 10;
}

function pathDirection(path, z) {
    return Math.atan2(path(z + 2) - path(z - 2), 4);
}

// ============================================================
// ROAD SURFACE (DYNAMIC)
// ============================================================

const roadGroup = new THREE.Group();
const ROAD_SEGMENTS = 100; // Segments per chunk
const SEGMENT_LENGTH = 6; // Z distance per segment

function createRoadSegment(startZ, endZ, path = roadX, width = ROAD_WIDTH) {
    const vertices = [];
    const indices = [];
    
    // Create segments between startZ and endZ
    const steps = Math.abs(endZ - startZ) / SEGMENT_LENGTH;
    
    for (let i = 0; i <= steps; i++) {
        const z = startZ + (i / steps) * (endZ - startZ);
        const x = path(z);
        
        vertices.push(
            x - width / 2, 0.12, z,
            x + width / 2, 0.12, z
        );
    }
    
    for (let i = 0; i < steps; i++) {
        const a = i * 2;
        indices.push(
            a, a + 1, a + 2,
            a + 1, a + 3, a + 2
        );
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
            color: 0x292929,
            roughness: 0.9,
            side: THREE.DoubleSide
        })
    );
    
    // Do not receive the sun shadow on the flat road surface; shadow-map
    // precision otherwise creates visible shimmering while driving.
    mesh.receiveShadow = false;
    mesh.userData.zStart = Math.min(startZ, endZ);
    mesh.userData.zEnd = Math.max(startZ, endZ);
    
    return mesh;
}

// Create initial road segments
for (let z = ROAD_END - 600; z <= ROAD_START + 600; z += 600) {
    const segment = createRoadSegment(z, z + 600);
    roadGroup.add(segment);
    RENDERED_SEGMENTS.set(Math.round(z / 600), segment);
}

scene.add(roadGroup);
scene.add(secondaryRoadGroup);

// ============================================================
// ROAD EDGES
// ============================================================

// ============================================================
// ROAD EDGES & CENTER LINE (DYNAMIC)
// ============================================================

const roadEdgesGroup = new THREE.Group();
const centerLineGroup = new THREE.Group();
const renderedDashes = new Map();

function createRoadStrip(
    offset,
    width,
    color,
    startZ,
    endZ,
    path = roadX
) {
    const vertices = [];
    const steps = Math.abs(endZ - startZ) / SEGMENT_LENGTH;
    
    for (let i = 0; i <= steps; i++) {
        const z = startZ + (i / steps) * (endZ - startZ);
        const x = path(z);
        const angle = pathDirection(path, z);
        
        const nx = Math.cos(angle);
        const nz = Math.sin(angle);
        
        const centerX = x + nx * offset;
        const centerZ = z + nz * offset;
        const half = width / 2;
        
        vertices.push(
            centerX - nx * half, 0.14, centerZ - nz * half,
            centerX + nx * half, 0.14, centerZ + nz * half
        );
    }
    
    const indices = [];
    for (let i = 0; i < steps; i++) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
            color: color,
            side: THREE.DoubleSide
        })
    );

    mesh.receiveShadow = false;
    return mesh;
}

function createCenterDashes(startZ, endZ, path = roadX) {
    const dashes = [];
    const dashMaterial = new THREE.MeshBasicMaterial({ color: 0xffe27a });
    
    for (let z = Math.ceil(startZ / 55) * 55; z < endZ; z += 55) {
        const dash = new THREE.Mesh(
            new THREE.BoxGeometry(0.22, 0.035, 22),
            dashMaterial
        );
        dash.position.set(path(z), 0.16, z);
        dash.rotation.y = pathDirection(path, z);
        dash.renderOrder = 2;
        dashes.push(dash);
        centerLineGroup.add(dash);
    }
    
    return dashes;
}

// Initialize road strips and dashes
const leftStrip = createRoadStrip(-ROAD_WIDTH / 2 + 0.15, 0.25, 0xffffff, ROAD_END - 600, ROAD_START + 600);
const rightStrip = createRoadStrip(ROAD_WIDTH / 2 - 0.15, 0.25, 0xffffff, ROAD_END - 600, ROAD_START + 600);
roadEdgesGroup.add(leftStrip, rightStrip);
createCenterDashes(ROAD_END - 600, ROAD_START + 600);

function createSecondaryRoadChunk(startZ, endZ) {
    const segment = createRoadSegment(
        startZ,
        endZ,
        secondaryRoadX,
        SECONDARY_ROAD_WIDTH
    );
    secondaryRoadGroup.add(segment);
    const left = createRoadStrip(
        -SECONDARY_ROAD_WIDTH / 2 + 0.15,
        0.22,
        0xffd36a,
        startZ,
        endZ,
        secondaryRoadX
    );
    const right = createRoadStrip(
        SECONDARY_ROAD_WIDTH / 2 - 0.15,
        0.22,
        0xffd36a,
        startZ,
        endZ,
        secondaryRoadX
    );
    secondaryRoadGroup.add(left, right);
    createCenterDashes(startZ, endZ, secondaryRoadX);
}

createSecondaryRoadChunk(ROAD_END - 600, ROAD_START + 600);
for (let z = ROAD_END - 600; z <= ROAD_START + 600; z += ROAD_SEGMENT_LENGTH) {
    RENDERED_SECONDARY_SEGMENTS.set(Math.round(z / ROAD_SEGMENT_LENGTH), true);
}

scene.add(roadEdgesGroup);
scene.add(centerLineGroup);

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

const mountainsGroup = new THREE.Group();
const renderedMountainSegments = new Map();
const MOUNTAIN_SEED = 42; // Use same seed for deterministic generation

function createMountainsForSegment(startZ, endZ) {
    for (let z = Math.ceil(startZ / 450) * 450; z < endZ; z += 450) {
        // Use z value as seed for random for deterministic generation
        const randomL = Math.sin(z * 12.9898) * 43758.5453;
        const randomR = Math.sin((z + 1) * 12.9898) * 43758.5453;
        
        const mountain1 = new THREE.Mesh(
            new THREE.ConeGeometry(180, 500, 7),
            new THREE.MeshStandardMaterial({
                color: 0x526b54,
                roughness: 1
            })
        );
        
        mountain1.position.set(
            roadX(z) - 380,
            250 * (0.8 + (randomL - Math.floor(randomL)) * 0.6),
            z
        );
        mountain1.scale.setScalar(0.8 + (randomL - Math.floor(randomL)) * 0.6);
        mountain1.castShadow = true;
        mountainsGroup.add(mountain1);
        
        const mountain2 = new THREE.Mesh(
            new THREE.ConeGeometry(180, 500, 7),
            new THREE.MeshStandardMaterial({
                color: 0x526b54,
                roughness: 1
            })
        );
        
        mountain2.position.set(
            roadX(z) + 380,
            250 * (0.8 + (randomR - Math.floor(randomR)) * 0.6),
            z
        );
        mountain2.scale.setScalar(0.8 + (randomR - Math.floor(randomR)) * 0.6);
        mountain2.castShadow = true;
        mountainsGroup.add(mountain2);
    }
}

// ============================================================
// TREES
// ============================================================

function createTree(
    x,
    z,
    scale,
    parentGroup = null
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

    const foliageMaterial = new THREE.MeshStandardMaterial({
        color: 0x2f7d3b,
        roughness: 0.95
    });
    const leaves = new THREE.Group();
    const foliageLayers = [
        [3.5, 5.2, 7.2],
        [4.1, 7.7, 6.3],
        [3.4, 10.0, 5.2]
    ];
    for (const [radius, y, height] of foliageLayers) {
        const layer = new THREE.Mesh(
            new THREE.ConeGeometry(radius, height, 10),
            foliageMaterial
        );
        layer.position.y = y;
        layer.castShadow = true;
        leaves.add(layer);
    }

    trunk.castShadow = true;
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

    if (parentGroup) {
        parentGroup.add(group);
    } else {
        scene.add(group);
    }
    
    return group;

}

// ============================================================
// TREES (DYNAMIC)
// ============================================================

const treesGroup = new THREE.Group();
const renderedTreeSegments = new Map();

function createTreesForSegment(startZ, endZ) {
    for (let z = Math.ceil(startZ / 85) * 85; z < endZ; z += 85) {
        const center = roadX(z);
        
        // Deterministic randomness based on z position
        const randomL = Math.sin(z * 13.9898) * 43758.5453;
        const randomR = Math.sin((z + 0.5) * 13.9898) * 43758.5453;
        
        const tree1 = createTree(
            center - 45 - (randomL - Math.floor(randomL)) * 50,
            z + (randomL - Math.floor(randomL)) * 30,
            0.7 + (randomL - Math.floor(randomL)) * 0.6,
            treesGroup
        );
        
        const tree2 = createTree(
            center + 45 + (randomR - Math.floor(randomR)) * 50,
            z + (randomR - Math.floor(randomR)) * 30,
            0.7 + (randomR - Math.floor(randomR)) * 0.6,
            treesGroup
        );
    }
}

// Generate initial trees
createTreesForSegment(ROAD_END - 600, ROAD_START + 600);
scene.add(treesGroup);

// ============================================================
// EXPLORATION WORLD
// ============================================================

const worldLandmarks = new THREE.Group();

function createBuilding(x, z, width, height, depth, color) {

    const building = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.8
        })
    );

    building.position.set(x, height / 2, z);
    building.castShadow = true;
    building.receiveShadow = true;
    worldLandmarks.add(building);

    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(Math.max(width, depth) * 0.8, 3.5, 4),
        new THREE.MeshStandardMaterial({
            color: 0x563c2d,
            roughness: 1
        })
    );

    roof.position.set(x, height + 1.75, z);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    worldLandmarks.add(roof);

}

function createStreetLight(x, z, parentGroup = null) {

    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.13, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x29323a })
    );

    pole.position.set(x, 4, z);
    
    const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 12, 8),
        new THREE.MeshStandardMaterial({
            color: 0xffe7a5,
            emissive: 0xffc857,
            emissiveIntensity: 0.7
        })
    );

    lamp.position.set(x, 8, z);
    
    if (parentGroup) {
        parentGroup.add(pole);
        parentGroup.add(lamp);
    } else {
        worldLandmarks.add(pole);
        worldLandmarks.add(lamp);
    }

}

function createBuildingsForSegment(startZ, endZ) {
    for (let z = Math.ceil(startZ / 330) * 330; z < endZ; z += 330) {
        const side = z % 660 === 0 ? -1 : 1;
        const center = roadX(z);
        
        createBuilding(
            center + side * (40 + Math.abs(z % 90)),
            z + 28,
            11 + Math.abs(z % 8),
            9 + Math.abs(z % 10),
            12,
            side < 0 ? 0x8d6e63 : 0x607d8b
        );
        
        createStreetLight(center - ROAD_WIDTH / 2 - 3, z, worldLandmarks);
        createStreetLight(center + ROAD_WIDTH / 2 + 3, z, worldLandmarks);

        createBuilding(
            secondaryRoadX(z) + (side > 0 ? 24 : -24),
            z - 65,
            16 + Math.abs(z % 9),
            13 + Math.abs(z % 16),
            15,
            0x78909c
        );
    }
}

// Generate initial buildings
createBuildingsForSegment(ROAD_END - 600, ROAD_START + 600);

const lake = new THREE.Mesh(
    new THREE.CircleGeometry(115, 48),
    new THREE.MeshStandardMaterial({
        color: 0x2e8dcc,
        roughness: 0.25,
        metalness: 0.15
    })
);

lake.rotation.x = -Math.PI / 2;
lake.position.set(roadX(-1400) + 180, -0.03, -1400);
worldLandmarks.add(lake);

scene.add(worldLandmarks);

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
// CAR BODY — V9 STEP 1
// ============================================================

// Main lower body
const body =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            4.55,
            0.78,
            8.15
        ),
        bodyMaterial
    );

body.position.set(
    0,
    1.02,
    0
);

body.castShadow = true;

playerCar.add(body);


// Lower side section
const lowerBody =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            4.82,
            0.42,
            7.55
        ),
        blackMaterial
    );

lowerBody.position.set(
    0,
    0.70,
    0.05
);

lowerBody.castShadow = true;

playerCar.add(lowerBody);


// ------------------------------------------------------------
// FRONT HOOD
// ------------------------------------------------------------

const hood =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            4.18,
            0.30,
            2.55
        ),
        bodyMaterial
    );

hood.position.set(
    0,
    1.48,
    -2.45
);

hood.castShadow = true;

playerCar.add(hood);


// Hood center section
const hoodCenter =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.35,
            0.12,
            2.15
        ),
        bodyMaterial
    );

hoodCenter.position.set(
    0,
    1.66,
    -2.48
);

playerCar.add(hoodCenter);


// ------------------------------------------------------------
// CABIN
// ------------------------------------------------------------

const cabin =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            3.55,
            1.18,
            3.55
        ),
        glassMaterial
    );

cabin.position.set(
    0,
    2.02,
    0.45
);

cabin.scale.set(
    1,
    1,
    0.96
);

cabin.castShadow = true;

playerCar.add(cabin);


// Roof
const roof =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            3.62,
            0.16,
            3.25
        ),
        bodyMaterial
    );

roof.position.set(
    0,
    2.64,
    0.48
);

roof.castShadow = true;

playerCar.add(roof);


// ------------------------------------------------------------
// FRONT PILLARS
// ------------------------------------------------------------

for (const x of [-1.58, 1.58]) {

    const pillar =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.16,
                1.15,
                0.18
            ),
            bodyMaterial
        );

    pillar.position.set(
        x,
        2.12,
        -1.12
    );

    pillar.rotation.x =
        -0.15;

    playerCar.add(pillar);

}


// ------------------------------------------------------------
// SIDE SKIRTS
// ------------------------------------------------------------

for (const x of [-2.32, 2.32]) {

    const sideSkirt =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.22,
                0.32,
                6.4
            ),
            blackMaterial
        );

    sideSkirt.position.set(
        x,
        0.67,
        0.15
    );

    sideSkirt.castShadow = true;

    playerCar.add(sideSkirt);

}


// ------------------------------------------------------------
// FRONT BUMPER
// ------------------------------------------------------------

const frontBumper =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            4.72,
            0.38,
            0.42
        ),
        blackMaterial
    );

frontBumper.position.set(
    0,
    0.72,
    -4.08
);

playerCar.add(frontBumper);


// Front bumper lip
const frontLip =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            4.15,
            0.14,
            0.32
        ),
        blackMaterial
    );

frontLip.position.set(
    0,
    0.52,
    -4.02
);

playerCar.add(frontLip);


// ------------------------------------------------------------
// REAR BUMPER
// ------------------------------------------------------------

const rearBumper =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            4.72,
            0.38,
            0.42
        ),
        blackMaterial
    );

rearBumper.position.set(
    0,
    0.72,
    4.08
);

playerCar.add(rearBumper);


// Rear diffuser
const rearDiffuser =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            3.9,
            0.22,
            0.38
        ),
        blackMaterial
    );

rearDiffuser.position.set(
    0,
    0.50,
    3.98
);

playerCar.add(rearDiffuser);


// ------------------------------------------------------------
// REAR DECK
// ------------------------------------------------------------

const rearDeck =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            4.15,
            0.28,
            1.15
        ),
        blackMaterial
    );

rearDeck.position.set(
    0,
    1.48,
    3.05
);

rearDeck.castShadow = true;

playerCar.add(rearDeck);


// ------------------------------------------------------------
// FRONT FENDER SHAPES
// ------------------------------------------------------------

for (const x of [-2.12, 2.12]) {

    const fender =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.55,
                0.32,
                2.25
            ),
            bodyMaterial
        );

    fender.position.set(
        x,
        1.18,
        -2.15
    );

    fender.rotation.z =
        x < 0 ? -0.04 : 0.04;

    fender.castShadow = true;

    playerCar.add(fender);

}

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
// GARAGE, CARS, AND PLAYER PROGRESSION
// ============================================================

const CAR_CATALOG = [
    {
        id: "starter",
        name: "Sunset GT",
        price: 0,
        color: 0xc41616,
        maxSpeed: 5.0,
        acceleration: 0.035,
        handling: 0.008,
        scale: [1, 1, 1],
        description: "Balanced starter coupe"
    },
    {
        id: "sprint",
        name: "Azure Sprint",
        price: 1800,
        color: 0x1565c0,
        maxSpeed: 6.1,
        acceleration: 0.046,
        handling: 0.010,
        scale: [0.94, 0.92, 0.96],
        description: "Lightweight city racer"
    },
    {
        id: "trail",
        name: "Forest Trail",
        price: 4200,
        color: 0x2e7d32,
        maxSpeed: 5.5,
        acceleration: 0.040,
        handling: 0.007,
        scale: [1.12, 1.12, 1.08],
        description: "Strong explorer SUV"
    }
];

const SAVE_KEY = "cars13-v11-save";

function createFreshSave() {

    return {
        cash: 1400,
        level: 1,
        ownedCars: ["starter"],
        selectedCar: "starter"
    };

}

function loadSave() {

    try {

        const saved = JSON.parse(localStorage.getItem(SAVE_KEY));

        if (
            saved &&
            Number.isFinite(saved.cash) &&
            Number.isFinite(saved.level) &&
            Array.isArray(saved.ownedCars) &&
            typeof saved.selectedCar === "string"
        ) {

            return {
                cash: Math.max(0, saved.cash),
                level: Math.max(1, saved.level),
                ownedCars: saved.ownedCars.filter((id) =>
                    CAR_CATALOG.some((car) => car.id === id)
                ),
                selectedCar: saved.selectedCar
            };

        }

    } catch (error) {

        // A damaged local save should never prevent the game from starting.

    }

    return createFreshSave();

}

let gameSave = loadSave();

if (!gameSave.ownedCars.includes("starter")) {

    gameSave = createFreshSave();

}

function saveGame() {

    localStorage.setItem(SAVE_KEY, JSON.stringify(gameSave));

}

let selectedMode = "career";
let gameStarted = false;
let isDriving = true;
let checkpointZ = -360;
let activeCar = CAR_CATALOG[0];

function createDriver() {

    const driver = new THREE.Group();
    const clothes = new THREE.MeshStandardMaterial({ color: 0x263b5a });
    const skin = new THREE.MeshStandardMaterial({ color: 0xc98c68 });
    const shoes = new THREE.MeshStandardMaterial({ color: 0x202124 });

    const torso = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.25, 0.42),
        clothes
    );

    torso.position.y = 1.85;
    driver.add(torso);

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.34, 16, 12),
        skin
    );

    head.position.y = 2.76;
    driver.add(head);

    for (const x of [-0.28, 0.28]) {

        const arm = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, 0.92, 0.18),
            clothes
        );

        arm.position.set(x * 1.9, 1.88, 0);
        arm.name = "arm";
        driver.add(arm);

        const leg = new THREE.Mesh(
            new THREE.BoxGeometry(0.24, 1.05, 0.24),
            x < 0 ? clothes : shoes
        );

        leg.position.set(x, 0.55, 0);
        leg.name = "leg";
        driver.add(leg);

    }

    driver.traverse((part) => {

        if (part.isMesh) part.castShadow = true;

    });

    return driver;

}

const playerCharacter = createDriver();

playerCharacter.visible = false;
scene.add(playerCharacter);

const checkpoint = new THREE.Group();
const checkpointRing = new THREE.Mesh(
    new THREE.TorusGeometry(4.8, 0.22, 10, 32),
    new THREE.MeshStandardMaterial({
        color: 0xffd54f,
        emissive: 0xffa000,
        emissiveIntensity: 1.1
    })
);

const checkpointBase = new THREE.Mesh(
    new THREE.CylinderGeometry(5.4, 5.4, 0.08, 32),
    new THREE.MeshStandardMaterial({
        color: 0xffc107,
        emissive: 0xff8f00,
        emissiveIntensity: 0.35
    })
);

checkpointRing.position.y = 5;
checkpointBase.position.y = 0.04;
checkpoint.add(checkpointRing, checkpointBase);
checkpoint.visible = false;
scene.add(checkpoint);

function placeCheckpoint(z) {

    checkpointZ = z;
    checkpoint.position.set(roadX(checkpointZ), 0, checkpointZ);
    checkpoint.rotation.y = roadDirection(checkpointZ);

}

placeCheckpoint(checkpointZ);

// ============================================================
// DRIVING
// ============================================================

let speed = 0;
let steering = 0;
let heading = roadDirection(0);

let MAX_SPEED = 5.0;
let ACCELERATION = 0.035;
const BRAKING = 0.09;
const FRICTION = 0.008;
let TURN_RATE = 0.008;
const ROAD_LIMIT = ROAD_WIDTH * 0.42;

// ============================================================
// INPUT
// ============================================================

const keys = {};
const activePointers = new Map();
const controlButtons = new Map();
const gameKeys = new Set([
    "w", "a", "s", "d",
    "arrowup", "arrowdown",
    "arrowleft", "arrowright",
    "e"
]);

function isControlPressed(id) {

    for (const activeId of activePointers.values()) {

        if (activeId === id) return true;

    }

    return false;

}

function syncControlAppearance() {

    for (const [id, button] of controlButtons) {

        const pressed = isControlPressed(id);

        button.classList.toggle("is-pressed", pressed);
        button.setAttribute("aria-pressed", String(pressed));

    }

}

function releasePointer(pointerId) {

    activePointers.delete(pointerId);
    syncControlAppearance();

}

function clearPointerControls() {

    activePointers.clear();
    syncControlAppearance();

}

window.addEventListener(
    "keydown",
    (event) => {

        const key = event.key.toLowerCase();

        if (gameKeys.has(key)) {

            event.preventDefault();

        }

        if (key === "e" && !event.repeat) {

            toggleVehicle();

        }

        keys[key] = true;

    }
);

window.addEventListener(
    "keyup",
    (event) => {

        keys[event.key.toLowerCase()] = false;

    }
);

window.addEventListener("blur", clearPointerControls);

document.addEventListener(
    "visibilitychange",
    () => {

        if (document.hidden) clearPointerControls();

    }
);

function setupButton(id) {

    const button = document.getElementById(id);

    if (!button) return;

    controlButtons.set(id, button);
    button.setAttribute("aria-pressed", "false");

    if (id === "action") {

        button.addEventListener(
            "pointerdown",
            (event) => {

                event.preventDefault();
                toggleVehicle();

            }
        );

        return;

    }

    button.addEventListener(
        "pointerdown",
        (event) => {

            event.preventDefault();
            button.setPointerCapture(event.pointerId);
            activePointers.set(event.pointerId, id);
            syncControlAppearance();

        }
    );

    button.addEventListener(
        "pointerup",
        (event) => {

            event.preventDefault();
            releasePointer(event.pointerId);

        }
    );

    button.addEventListener(
        "pointercancel",
        (event) => releasePointer(event.pointerId)
    );

    button.addEventListener(
        "lostpointercapture",
        (event) => releasePointer(event.pointerId)
    );

}

setupButton("gas");
setupButton("brake");
setupButton("left");
setupButton("right");
setupButton("action");

// ============================================================
// DYNAMIC SCENERY UPDATE
// ============================================================

let generatedMinZ = ROAD_END - 600;
let generatedMaxZ = ROAD_START + 600;
const GENERATION_DISTANCE = 1200;

function generateSceneryChunk(startZ, endZ) {
    createTreesForSegment(startZ, endZ);
    createBuildingsForSegment(startZ, endZ);

    for (let z = startZ; z < endZ; z += ROAD_SEGMENT_LENGTH) {
        const segmentKey = Math.round(z / ROAD_SEGMENT_LENGTH);

        if (!RENDERED_SEGMENTS.has(segmentKey)) {
            const segment = createRoadSegment(z, z + ROAD_SEGMENT_LENGTH);
            roadGroup.add(segment);
            RENDERED_SEGMENTS.set(segmentKey, segment);
        }

        if (!RENDERED_SECONDARY_SEGMENTS.has(segmentKey)) {
            createSecondaryRoadChunk(z, z + ROAD_SEGMENT_LENGTH);
            RENDERED_SECONDARY_SEGMENTS.set(segmentKey, true);
        }

        roadEdgesGroup.add(
            createRoadStrip(
                -ROAD_WIDTH / 2 + 0.15,
                0.25,
                0xffffff,
                z,
                z + ROAD_SEGMENT_LENGTH
            ),
            createRoadStrip(
                ROAD_WIDTH / 2 - 0.15,
                0.25,
                0xffffff,
                z,
                z + ROAD_SEGMENT_LENGTH
            )
        );

        createCenterDashes(
            z,
            z + ROAD_SEGMENT_LENGTH
        );
    }
}

function updateDynamicScenery(playerZ) {
    while (playerZ < generatedMinZ + GENERATION_DISTANCE) {
        const newMinZ = generatedMinZ - ROAD_SEGMENT_LENGTH * 2;
        generateSceneryChunk(newMinZ, generatedMinZ);
        generatedMinZ = newMinZ;
    }

    while (playerZ > generatedMaxZ - GENERATION_DISTANCE) {
        const newMaxZ = generatedMaxZ + ROAD_SEGMENT_LENGTH * 2;
        generateSceneryChunk(generatedMaxZ, newMaxZ);
        generatedMaxZ = newMaxZ;
    }
}

// ============================================================
// DRIVING UPDATE
// ============================================================

function lerpAngle(from, to, amount) {

    const difference = Math.atan2(
        Math.sin(to - from),
        Math.cos(to - from)
    );

    return from + difference * amount;

}

function updateDriving(delta) {

    if (!gameStarted || !isDriving) {

        speed = Math.max(0, speed - FRICTION * 2);
        steering = THREE.MathUtils.lerp(steering, 0, 0.15);
        return;

    }

    const frameScale = Math.min(delta * 60, 2);
    const accelerating =
        isControlPressed("gas") ||
        keys["w"] ||
        keys["arrowup"];
    const braking =
        isControlPressed("brake") ||
        keys["s"] ||
        keys["arrowdown"];
    const steeringTarget =
        (isControlPressed("right") || keys["d"] || keys["arrowright"] ? 1 : 0) -
        (isControlPressed("left") || keys["a"] || keys["arrowleft"] ? 1 : 0);

    if (accelerating) speed += ACCELERATION * frameScale;
    if (braking) speed -= BRAKING * frameScale;

    if (!accelerating && !braking) {

        speed = Math.max(0, speed - FRICTION * frameScale);

    }

    speed = THREE.MathUtils.clamp(speed, 0, MAX_SPEED);
    steering = THREE.MathUtils.lerp(
        steering,
        steeringTarget,
        1 - Math.exp(-10 * delta)
    );

    const roadHeading = roadDirection(playerCar.position.z);
    const roadAssist = 1 - Math.exp(-1.1 * delta);

    // The car turns around its heading and then moves in that new direction.
    // This replaces the old sideways slide, so left and right visibly steer.
    heading += -steering * speed * TURN_RATE * frameScale;
    heading = lerpAngle(heading, roadHeading, roadAssist);

    const forwardX = -Math.sin(heading);
    const forwardZ = -Math.cos(heading);
    const travel = speed * 0.55 * frameScale;

    playerCar.position.x += forwardX * travel;
    playerCar.position.z += forwardZ * travel;

    const roadCenter = roadX(playerCar.position.z);
    const roadOffset = playerCar.position.x - roadCenter;

    if (Math.abs(roadOffset) > ROAD_LIMIT) {

        playerCar.position.x = roadCenter +
            THREE.MathUtils.clamp(
                roadOffset,
                -ROAD_LIMIT,
                ROAD_LIMIT
            );

        heading = lerpAngle(heading, roadHeading, 0.12);
        speed *= 0.985;

    }

    playerCar.rotation.y = heading;
    playerCar.rotation.z = steering * 0.045;

    for (const wheel of wheels) {

        wheel.children[0].rotation.x += speed * 0.5 * frameScale;

    }

    for (const wheel of frontWheels) {

        wheel.rotation.y = -steering * 0.35;

    }

}

// ============================================================
// GAME MODES, GARAGE, AND EXPLORATION
// ============================================================

const garagePanel = document.getElementById("garagePanel");
const carList = document.getElementById("carList");
const careerModeButton = document.getElementById("careerMode");
const freeModeButton = document.getElementById("freeMode");
const startDriveButton = document.getElementById("startDrive");
const menuButton = document.getElementById("menuButton");
const garageHint = document.getElementById("garageHint");
const interactionPrompt = document.getElementById("interactionPrompt");
const actionButton = document.getElementById("action");

let notificationText = "";
let notificationUntil = 0;

function getCar(id) {

    return CAR_CATALOG.find((car) => car.id === id) || CAR_CATALOG[0];

}

function applySelectedCar() {

    activeCar = getCar(gameSave.selectedCar);
    bodyMaterial.color.setHex(activeCar.color);
    playerCar.scale.set(...activeCar.scale);
    MAX_SPEED = activeCar.maxSpeed;
    ACCELERATION = activeCar.acceleration;
    TURN_RATE = activeCar.handling;

}

function renderGarage() {

    applySelectedCar();

    carList.innerHTML = "";

    for (const car of CAR_CATALOG) {

        const owned = gameSave.ownedCars.includes(car.id);
        const selected = gameSave.selectedCar === car.id;
        const canBuy = gameSave.cash >= car.price;
        const card = document.createElement("article");

        card.className = "carCard" + (selected ? " is-selected" : "");

        const paint = document.createElement("div");
        paint.className = "carPaint";
        paint.style.background = "#" + car.color.toString(16).padStart(6, "0");

        const title = document.createElement("h2");
        title.textContent = car.name;

        const details = document.createElement("p");
        details.textContent = car.description + " · " +
            Math.round(car.maxSpeed * 24) + " km/h";

        const button = document.createElement("button");

        if (selected) {

            button.textContent = "SELECTED";
            button.disabled = true;

        } else if (owned) {

            button.textContent = "SELECT";

            button.addEventListener("click", () => {

                gameSave.selectedCar = car.id;
                saveGame();
                renderGarage();

            });

        } else {

            button.textContent = "$" + car.price.toLocaleString();
            button.disabled = !canBuy;

            button.addEventListener("click", () => buyCar(car));

        }

        card.append(paint, title, details, button);
        carList.appendChild(card);

    }

    careerModeButton.classList.toggle(
        "is-selected",
        selectedMode === "career"
    );
    freeModeButton.classList.toggle(
        "is-selected",
        selectedMode === "free"
    );
    startDriveButton.textContent = selectedMode === "career"
        ? "START CAREER"
        : "START FREE DRIVE";
    garageHint.textContent = "Cash: $" + gameSave.cash.toLocaleString() +
        " · Level " + gameSave.level;

}

function buyCar(car) {

    if (
        gameSave.ownedCars.includes(car.id) ||
        gameSave.cash < car.price
    ) return;

    gameSave.cash -= car.price;
    gameSave.ownedCars.push(car.id);
    gameSave.selectedCar = car.id;
    saveGame();
    renderGarage();
    announce(car.name + " is now in your garage.");

}

function announce(text, duration = 2600) {

    notificationText = text;
    notificationUntil = performance.now() + duration;

}

function startGame() {

    gameStarted = true;
    isDriving = true;
    playerCharacter.visible = false;
    speed = 0;
    applySelectedCar();
    garagePanel.classList.remove("is-open");

    checkpoint.visible = selectedMode === "career";

    if (selectedMode === "career") {

        placeCheckpoint(playerCar.position.z - 360);
        announce("Reach the gold checkpoint to earn your first reward.", 4200);

    } else {

        announce("Free Drive: explore the world at your own pace.", 3400);

    }

}

function toggleGarage() {

    if (!gameStarted) return;

    garagePanel.classList.toggle("is-open");

    if (garagePanel.classList.contains("is-open")) {

        renderGarage();

    }

}

function isNearCar() {

    return playerCharacter.position.distanceTo(playerCar.position) < 8;

}

function exitVehicle() {

    speed = 0;
    isDriving = false;
    playerCharacter.visible = true;
    playerCharacter.position.set(
        playerCar.position.x - Math.cos(heading) * 4,
        0,
        playerCar.position.z + Math.sin(heading) * 4
    );
    playerCharacter.rotation.y = heading;
    announce("You are on foot. Walk anywhere and return to your car to drive.", 4000);

}

function enterVehicle() {

    isDriving = true;
    playerCharacter.visible = false;
    announce("Back in the " + activeCar.name + ".", 2200);

}

function toggleVehicle() {

    if (!gameStarted || garagePanel.classList.contains("is-open")) return;

    if (isDriving) {

        exitVehicle();

    } else if (isNearCar()) {

        enterVehicle();

    } else {

        announce("Walk closer to your car to get in.");

    }

}

function updateOnFoot(delta) {

    if (!gameStarted || isDriving) return;

    const movement = new THREE.Vector2(
        (keys["d"] || keys["arrowright"] ? 1 : 0) -
        (keys["a"] || keys["arrowleft"] ? 1 : 0),
        (keys["s"] || keys["arrowdown"] ? 1 : 0) -
        (keys["w"] || keys["arrowup"] ? 1 : 0)
    );

    if (movement.lengthSq() === 0) return;

    movement.normalize();

    const walkingSpeed = 13 * delta;

    // Allow infinite movement - removed z boundary clamping
    playerCharacter.position.x = THREE.MathUtils.clamp(
        playerCharacter.position.x + movement.x * walkingSpeed,
        -900,
        900
    );
    playerCharacter.position.z += movement.y * walkingSpeed;

    playerCharacter.rotation.y = Math.atan2(
        -movement.x,
        -movement.y
    );

    const stride = Math.sin(performance.now() * 0.015) * 0.45;

    playerCharacter.traverse((part) => {

        if (part.name === "arm" || part.name === "leg") {

            part.rotation.x = part.position.x < 0 ? stride : -stride;

        }

    });

}

function updateProgression(delta) {

    if (selectedMode !== "career" || !gameStarted) return;

    checkpointRing.rotation.z += delta * 1.6;

    if (!isDriving) return;

    const distance = Math.hypot(
        playerCar.position.x - checkpoint.position.x,
        playerCar.position.z - checkpoint.position.z
    );

    if (distance > 9) return;

    const reward = 450 + gameSave.level * 150;

    gameSave.cash += reward;
    gameSave.level += 1;
    saveGame();
    placeCheckpoint(playerCar.position.z - (320 + gameSave.level * 30));
    announce(
        "Checkpoint cleared! +$" + reward.toLocaleString() +
        " · Level " + gameSave.level,
        4000
    );

}

careerModeButton.addEventListener("click", () => {

    selectedMode = "career";
    renderGarage();

});

freeModeButton.addEventListener("click", () => {

    selectedMode = "free";
    renderGarage();

});

startDriveButton.addEventListener("click", startGame);
menuButton.addEventListener("click", toggleGarage);

renderGarage();

// ============================================================
// CAMERA
// ============================================================

function updateCamera(delta) {

    const followDistance = 11;
    const followAmount = 1 - Math.exp(-5 * delta);

    if (!isDriving) {

        const footHeading = playerCharacter.rotation.y;
        const desiredX = playerCharacter.position.x +
            Math.sin(footHeading) * 7;
        const desiredY = 4.4;
        const desiredZ = playerCharacter.position.z +
            Math.cos(footHeading) * 7;

        camera.position.x += (desiredX - camera.position.x) * followAmount;
        camera.position.y += (desiredY - camera.position.y) * followAmount;
        camera.position.z += (desiredZ - camera.position.z) * followAmount;

        camera.lookAt(
            playerCharacter.position.x - Math.sin(footHeading) * 4,
            1.5,
            playerCharacter.position.z - Math.cos(footHeading) * 4
        );

        return;

    }

    const desiredX = playerCar.position.x +
        Math.sin(heading) * followDistance;
    const desiredY = 5.2;
    const desiredZ = playerCar.position.z +
        Math.cos(heading) * followDistance;

    camera.position.x += (desiredX - camera.position.x) * followAmount;
    camera.position.y += (desiredY - camera.position.y) * followAmount;
    camera.position.z += (desiredZ - camera.position.z) * followAmount;

    camera.lookAt(
        playerCar.position.x - Math.sin(heading) * 10,
        1.3,
        playerCar.position.z - Math.cos(heading) * 10
    );

}

// ============================================================
// HUD
// ============================================================

const miniMap = document.getElementById("miniMap");
const miniMapContext = miniMap ? miniMap.getContext("2d") : null;

function drawMiniMap() {
    if (!miniMapContext) return;

    const width = miniMap.width;
    const height = miniMap.height;
    const minZ = ROAD_END - 600;
    const maxZ = ROAD_START + 600;
    const mapX = (x) => width / 2 + x * 0.28;
    const mapY = (z) => (z - minZ) / (maxZ - minZ) * height;

    miniMapContext.clearRect(0, 0, width, height);
    miniMapContext.fillStyle = "#8bb66f";
    miniMapContext.fillRect(0, 0, width, height);

    miniMapContext.strokeStyle = "rgba(50, 80, 48, 0.35)";
    miniMapContext.lineWidth = 1;
    for (let z = minZ; z <= maxZ; z += 450) {
        miniMapContext.beginPath();
        miniMapContext.moveTo(0, mapY(z));
        miniMapContext.lineTo(width, mapY(z));
        miniMapContext.stroke();
    }

    const drawRoad = (path, roadWidth, color) => {
        miniMapContext.beginPath();
        for (let z = minZ; z <= maxZ; z += 45) {
            const x = mapX(path(z));
            const y = mapY(z);
            if (z === minZ) miniMapContext.moveTo(x, y);
            else miniMapContext.lineTo(x, y);
        }
        miniMapContext.strokeStyle = color;
        miniMapContext.lineWidth = roadWidth;
        miniMapContext.stroke();
    };

    drawRoad(roadX, 7, "#3e464c");
    drawRoad(secondaryRoadX, 5, "#596168");

    miniMapContext.fillStyle = "rgba(40, 66, 43, 0.65)";
    for (let z = minZ; z <= maxZ; z += 330) {
        miniMapContext.fillRect(mapX(roadX(z) - 58), mapY(z) - 2, 4, 4);
        miniMapContext.fillRect(mapX(secondaryRoadX(z) + 38), mapY(z) - 2, 4, 4);
    }

    const player = isDriving ? playerCar : playerCharacter;
    miniMapContext.fillStyle = "#42a5f5";
    miniMapContext.beginPath();
    miniMapContext.arc(mapX(player.position.x), mapY(player.position.z), 4, 0, Math.PI * 2);
    miniMapContext.fill();

    if (checkpoint.visible) {
        miniMapContext.fillStyle = "#ffd54f";
        miniMapContext.beginPath();
        miniMapContext.arc(
            mapX(checkpoint.position.x),
            mapY(checkpoint.position.z),
            4,
            0,
            Math.PI * 2
        );
        miniMapContext.fill();
    }
}

function updateHUD() {

    const speedElement = document.getElementById("speed");
    const gearElement = document.getElementById("gear");
    const modeElement = document.getElementById("modeLabel");
    const levelElement = document.getElementById("level");
    const cashElement = document.getElementById("cash");

    if (speedElement) {

        speedElement.textContent = isDriving
            ? Math.round(speed * 24)
            : "ON FOOT";

    }

    if (gearElement) {

        const kmh = speed * 24;

        let currentGear = 1;

        if (kmh >= 25) currentGear = 2;
        if (kmh >= 45) currentGear = 3;
        if (kmh >= 70) currentGear = 4;
        if (kmh >= 95) currentGear = 5;

        gearElement.textContent = isDriving ? currentGear : "—";

    }

    if (modeElement) {

        modeElement.textContent = selectedMode === "career"
            ? "CAREER"
            : "FREE DRIVE";

    }

    if (levelElement) {

        levelElement.textContent = "LEVEL " + gameSave.level;

    }

    if (cashElement) {

        cashElement.textContent = "$" + gameSave.cash.toLocaleString();

    }

    drawMiniMap();

    if (actionButton) {

        actionButton.textContent = isDriving ? "EXIT" :
            (isNearCar() ? "ENTER" : "CAR");

    }

    if (performance.now() < notificationUntil) {

        interactionPrompt.textContent = notificationText;
        interactionPrompt.classList.add("is-visible");

    } else if (gameStarted && !isDriving) {

        interactionPrompt.textContent = isNearCar()
            ? "Press E or ENTER to get back in your car"
            : "Explore on foot · return to your car to drive";
        interactionPrompt.classList.add("is-visible");

    } else {

        interactionPrompt.classList.remove("is-visible");

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

    requestAnimationFrame(
        animate
    );

    const delta = Math.min(clock.getDelta(), 0.05);

    updateDriving(delta);
    updateOnFoot(delta);
    updateProgression(delta);
    
    // Update dynamic scenery based on player position
    const playerZ = isDriving ? playerCar.position.z : playerCharacter.position.z;
    updateDynamicScenery(playerZ);
    updateInfiniteGround(playerZ);
    
    updateCamera(delta);
    updateHUD();

    renderer.render(
        scene,
        camera
    );

}

animate();
