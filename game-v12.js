console.log("CARS 13 V12 — stable city build loaded");

// ============================================================
// CARS 13 — V12
// Garage, progression, free drive, city world and on-foot exploration
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

    // Keep the terrain centered around the player
    // so the green world never ends.

    ground.position.z =
        Math.round(playerZ / 1000) * 1000;

}

// ============================================================
// ROAD — V12 STABLE INFINITE ROAD
// ============================================================

const ROAD_WIDTH = 18;
const SECONDARY_ROAD_WIDTH = 12;

const ROAD_START = 1800;
const ROAD_END = -12000;

const ROAD_WINDOW_BACK = 7200;
const ROAD_WINDOW_FORWARD = 2600;

// One road surface only.
// The surface uses MeshBasicMaterial and does not
// receive shadows, which removes the shadow-map shimmer
// that caused the V11 road to flicker while accelerating.

const roadGroup = new THREE.Group();
const roadEdgesGroup = new THREE.Group();
const centerLineGroup = new THREE.Group();
const secondaryRoadGroup = new THREE.Group();

function roadX(z) {

    return (
        Math.sin(z * 0.00155) * 82 +
        Math.sin(z * 0.00315 + 0.7) * 34 +
        Math.sin(z * 0.0071 + 2.0) * 12
    );

}

function roadDirection(z) {

    return Math.atan2(
        roadX(z + 2) - roadX(z - 2),
        4
    );

}

function secondaryRoadX(z) {

    return (
        roadX(z) +
        72 +
        Math.sin(z * 0.0028) * 8
    );

}

function pathDirection(path, z) {

    return Math.atan2(
        path(z + 2) - path(z - 2),
        4
    );

}

function buildPathSurface(
    startZ,
    endZ,
    width,
    path,
    y = 0.11
) {

    const vertices = [];
    const indices = [];

    const step = 8;

    const count =
        Math.ceil(
            Math.abs(endZ - startZ) / step
        );

    const direction =
        endZ >= startZ ? 1 : -1;

    for (let i = 0; i <= count; i++) {

        const z =
            startZ +
            direction *
            Math.min(
                i * step,
                Math.abs(endZ - startZ)
            );

        const x = path(z);

        const dx =
            path(z + 2) -
            path(z - 2);

        const length =
            Math.hypot(dx, 4);

        const nx =
            4 / length;

        const nz =
            -dx / length;

        const half =
            width / 2;

        vertices.push(

            x - nx * half,
            y,
            z - nz * half,

            x + nx * half,
            y,
            z + nz * half

        );

    }

    for (let i = 0; i < count; i++) {

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
        'position',
        new THREE.Float32BufferAttribute(
            vertices,
            3
        )
    );

    geometry.setIndex(indices);

    geometry.computeVertexNormals();

    const mesh =
        new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({
                color: 0x26282b,
                side: THREE.DoubleSide
            })
        );

    mesh.frustumCulled = false;

    mesh.receiveShadow = false;
    mesh.castShadow = false;

    return mesh;

}

function addRoadMarkings(
    parent,
    startZ,
    endZ,
    path,
    width
) {

    const edgeMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xffffff
        });

    const centerMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xffdf72
        });

    const step = 55;

    for (
        let z =
            Math.ceil(startZ / step) * step;

        z <= endZ;

        z += step
    ) {

        const angle =
            pathDirection(
                path,
                z
            );

        const dx =
            path(z + 2) -
            path(z - 2);

        const length =
            Math.hypot(dx, 4);

        const nx =
            4 / length;

        const nz =
            -dx / length;

        const x =
            path(z);

        for (const side of [-1, 1]) {

            const edge =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        0.22,
                        0.035,
                        4.2
                    ),
                    edgeMaterial
                );

            edge.position.set(

                x +
                nx *
                side *
                (width / 2 - 0.55),

                0.155,

                z +
                nz *
                side *
                (width / 2 - 0.55)

            );

            edge.rotation.y =
                angle;

            edge.renderOrder = 3;

            parent.add(edge);

        }

        if (
            Math.floor(z / step) % 2 === 0
        ) {

            const dash =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        0.28,
                        0.04,
                        24
                    ),
                    centerMaterial
                );

            dash.position.set(
                x,
                0.16,
                z
            );

            dash.rotation.y =
                angle;

            dash.renderOrder = 3;

            parent.add(dash);

        }

    }

}

function rebuildRoadWindow(playerZ) {

    roadGroup.clear();
    roadEdgesGroup.clear();
    centerLineGroup.clear();
    secondaryRoadGroup.clear();

    const startZ =
        Math.floor(
            (playerZ - ROAD_WINDOW_BACK) / 240
        ) * 240;

    const endZ =
        Math.ceil(
            (playerZ + ROAD_WINDOW_FORWARD) / 240
        ) * 240;

    roadGroup.add(
        buildPathSurface(
            startZ,
            endZ,
            ROAD_WIDTH,
            roadX,
            0.11
        )
    );

    addRoadMarkings(
        roadEdgesGroup,
        startZ,
        endZ,
        roadX,
        ROAD_WIDTH
    );

    // Parallel secondary road.
    // It is slightly raised so the surfaces
    // never fight for the same depth.

    secondaryRoadGroup.add(
        buildPathSurface(
            startZ,
            endZ,
            SECONDARY_ROAD_WIDTH,
            secondaryRoadX,
            0.135
        )
    );

    addRoadMarkings(
        secondaryRoadGroup,
        startZ,
        endZ,
        secondaryRoadX,
        SECONDARY_ROAD_WIDTH
    );

}

scene.add(roadGroup);
scene.add(roadEdgesGroup);
scene.add(centerLineGroup);
scene.add(secondaryRoadGroup);

let lastRoadBuildZ = Infinity;

function updateInfiniteRoad(playerZ) {

    if (
        lastRoadBuildZ === Infinity ||
        Math.abs(
            playerZ - lastRoadBuildZ
        ) > 360
    ) {

        rebuildRoadWindow(
            playerZ
        );

        lastRoadBuildZ =
            playerZ;

    }

}

updateInfiniteRoad(0);

// ============================================================
// MOUNTAINS
// ============================================================

function createMountain(
    x,
    z,
    scale
) {

    const mountain =
        new THREE.Mesh(
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

    mountain.scale.setScalar(
        scale
    );

    mountain.castShadow = true;

    scene.add(mountain);

}

const mountainsGroup =
    new THREE.Group();

const renderedMountainSegments =
    new Map();

const MOUNTAIN_SEED = 42;

function createMountainsForSegment(
    startZ,
    endZ
) {

    for (
        let z =
            Math.ceil(startZ / 450) * 450;

        z < endZ;

        z += 450
    ) {

        const randomL =
            Math.sin(
                z * 12.9898
            ) *
            43758.5453;

        const randomR =
            Math.sin(
                (z + 1) *
                12.9898
            ) *
            43758.5453;

        const mountain1 =
            new THREE.Mesh(
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

        mountain1.position.set(
            roadX(z) - 380,
            250 *
                (
                    0.8 +
                    (
                        randomL -
                        Math.floor(randomL)
                    ) *
                    0.6
                ),
            z
        );

        mountain1.scale.setScalar(
            0.8 +
            (
                randomL -
                Math.floor(randomL)
            ) *
            0.6
        );

        mountain1.castShadow = true;

        mountainsGroup.add(
            mountain1
        );

        const mountain2 =
            new THREE.Mesh(
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

        mountain2.position.set(
            roadX(z) + 380,
            250 *
                (
                    0.8 +
                    (
                        randomR -
                        Math.floor(randomR)
                    ) *
                    0.6
                ),
            z
        );

        mountain2.scale.setScalar(
            0.8 +
            (
                randomR -
                Math.floor(randomR)
            ) *
            0.6
        );

        mountain2.castShadow = true;

        mountainsGroup.add(
            mountain2
        );

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

    const foliageMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x2f7d3b,
            roughness: 0.95
        });

    const leaves =
        new THREE.Group();

    const foliageLayers = [

        [3.5, 5.2, 7.2],
        [4.1, 7.7, 6.3],
        [3.4, 10.0, 5.2]

    ];

    for (
        const [
            radius,
            y,
            height
        ]
        of foliageLayers
    ) {

        const layer =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    radius,
                    height,
                    10
                ),
                foliageMaterial
            );

        layer.position.y =
            y;

        layer.castShadow = true;

        leaves.add(
            layer
        );

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

    group.scale.setScalar(
        scale
    );

    if (parentGroup) {

        parentGroup.add(
            group
        );

    } else {

        scene.add(
            group
        );

    }

    return group;

}

// ============================================================
// TREES (DYNAMIC)
// ============================================================

const treesGroup =
    new THREE.Group();

const renderedTreeSegments =
    new Map();

function createTreesForSegment(
    startZ,
    endZ
) {

    for (
        let z =
            Math.ceil(startZ / 85) * 85;

        z < endZ;

        z += 85
    ) {

        const center =
            roadX(z);

        const randomL =
            Math.sin(
                z * 13.9898
            ) *
            43758.5453;

        const randomR =
            Math.sin(
                (z + 0.5) *
                13.9898
            ) *
            43758.5453;

        const tree1 =
            createTree(
                center -
                    45 -
                    (
                        randomL -
                        Math.floor(randomL)
                    ) *
                    50,

                z +
                    (
                        randomL -
                        Math.floor(randomL)
                    ) *
                    30,

                0.7 +
                    (
                        randomL -
                        Math.floor(randomL)
                    ) *
                    0.6,

                treesGroup
            );

        const tree2 =
            createTree(
                center +
                    45 +
                    (
                        randomR -
                        Math.floor(randomR)
                    ) *
                    50,

                z +
                    (
                        randomR -
                        Math.floor(randomR)
                    ) *
                    30,

                0.7 +
                    (
                        randomR -
                        Math.floor(randomR)
                    ) *
                    0.6,

                treesGroup
            );

    }

}

// Generate initial trees

createTreesForSegment(
    ROAD_END - 600,
    ROAD_START + 600
);

scene.add(
    treesGroup
);

// ============================================================
// EXPLORATION WORLD
// ============================================================

const worldLandmarks =
    new THREE.Group();

function createBuilding(
    x,
    z,
    width,
    height,
    depth,
    color
) {

    const building =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),
            new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.8
            })
        );

    building.position.set(
        x,
        height / 2,
        z
    );

    building.castShadow = true;
    building.receiveShadow = true;

    worldLandmarks.add(
        building
    );

    const roof =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                Math.max(
                    width,
                    depth
                ) * 0.8,
                3.5,
                4
            ),
            new THREE.MeshStandardMaterial({
                color: 0x563c2d,
                roughness: 1
            })
        );

    roof.position.set(
        x,
        height + 1.75,
        z
    );

    roof.rotation.y =
        Math.PI / 4;

    roof.castShadow = true;

    worldLandmarks.add(
        roof
    );

}

function createStreetLight(
    x,
    z,
    parentGroup = null
) {

    const pole =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.09,
                0.13,
                8,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x29323a
            })
        );

    pole.position.set(
        x,
        4,
        z
    );

    const lamp =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.38,
                12,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0xffe7a5,
                emissive: 0xffc857,
                emissiveIntensity: 0.7
            })
        );

    lamp.position.set(
        x,
        8,
        z
    );

    if (parentGroup) {

        parentGroup.add(
            pole
        );

        parentGroup.add(
            lamp
        );

    } else {

        worldLandmarks.add(
            pole
        );

        worldLandmarks.add(
            lamp
        );

    }

}

function createBuildingsForSegment(
    startZ,
    endZ
) {

    for (
        let z =
            Math.ceil(startZ / 330) * 330;

        z < endZ;

        z += 330
    ) {

        const side =
            z % 660 === 0
                ? -1
                : 1;

        const center =
            roadX(z);

        createBuilding(

            center +
                side *
                (
                    40 +
                    Math.abs(z % 90)
                ),

            z + 28,

            11 +
                Math.abs(z % 8),

            9 +
                Math.abs(z % 10),

            12,

            side < 0
                ? 0x8d6e63
                : 0x607d8b

        );

        createStreetLight(
            center -
                ROAD_WIDTH / 2 -
                3,

            z,

            worldLandmarks
        );

        createStreetLight(
            center +
                ROAD_WIDTH / 2 +
                3,

            z,

            worldLandmarks
        );

        createBuilding(

            secondaryRoadX(z) +
                (
                    side > 0
                        ? 24
                        : -24
                ),

            z - 65,

            16 +
                Math.abs(z % 9),

            13 +
                Math.abs(z % 16),

            15,

            0x78909c

        );

    }

}

// Generate initial buildings

createBuildingsForSegment(
    ROAD_END - 600,
    ROAD_START + 600
);

const lake =
    new THREE.Mesh(
        new THREE.CircleGeometry(
            115,
            48
        ),
        new THREE.MeshStandardMaterial({
            color: 0x2e8dcc,
            roughness: 0.25,
            metalness: 0.15
        })
    );

lake.rotation.x =
    -Math.PI / 2;

lake.position.set(
    roadX(-1400) + 180,
    -0.03,
    -1400
);

worldLandmarks.add(
    lake
);

scene.add(
    worldLandmarks
);
// ============================================================
// V12 CITY WORLD
// ============================================================

const v12CityGroup =
    new THREE.Group();

const v12RoadNetworkGroup =
    new THREE.Group();

const v12BuildingsGroup =
    new THREE.Group();

const v12AirportGroup =
    new THREE.Group();

const v12NatureGroup =
    new THREE.Group();

const v12LandmarkGroup =
    new THREE.Group();

v12CityGroup.add(
    v12RoadNetworkGroup,
    v12BuildingsGroup,
    v12AirportGroup,
    v12NatureGroup,
    v12LandmarkGroup
);

worldLandmarks.add(
    v12CityGroup
);

// ============================================================
// CITY MATERIALS
// ============================================================

const cityRoadMaterial =
    new THREE.MeshBasicMaterial({
        color: 0x303338
    });

const cityRoadEdgeMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xd9dde0
    });

const citySidewalkMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xb8b9b5,
        roughness: 1
    });

const grassMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x4d9145,
        roughness: 1
    });

const waterMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x2b91c9,
        roughness: 0.2,
        metalness: 0.1
    });

const glassCityMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x4c7890,
        roughness: 0.18,
        metalness: 0.15
    });

const concreteMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x8b9096,
        roughness: 0.9
    });

const airportConcreteMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x777b80,
        roughness: 0.95
    });

const runwayMaterial =
    new THREE.MeshBasicMaterial({
        color: 0x282c30
    });

const runwayLineMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffffff
    });

// ============================================================
// HELPER — CITY BUILDING
// ============================================================

function createCityBuilding(
    x,
    z,
    width,
    height,
    depth,
    color,
    options = {}
) {

    const group =
        new THREE.Group();

    const material =
        new THREE.MeshStandardMaterial({
            color: color,
            roughness:
                options.roughness ?? 0.75,
            metalness:
                options.metalness ?? 0.05
        });

    const building =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),
            material
        );

    building.position.y =
        height / 2;

    building.castShadow = true;
    building.receiveShadow = true;

    group.add(
        building
    );

    if (options.glass) {

        const glass =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    width * 0.82,
                    height * 0.72,
                    depth + 0.03
                ),
                glassCityMaterial
            );

        glass.position.y =
            height * 0.56;

        group.add(
            glass
        );

    }

    if (options.roof) {

        const roof =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    width * 0.9,
                    0.35,
                    depth * 0.9
                ),
                concreteMaterial
            );

        roof.position.y =
            height + 0.18;

        group.add(
            roof
        );

    }

    group.position.set(
        x,
        0,
        z
    );

    v12BuildingsGroup.add(
        group
    );

    return group;

}

// ============================================================
// HELPER — CITY ROAD
// ============================================================

function createCityRoad(
    x,
    z,
    width,
    length,
    rotation = 0
) {

    const road =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                0.10,
                length
            ),
            cityRoadMaterial
        );

    road.position.set(
        x,
        0.105,
        z
    );

    road.rotation.y =
        rotation;

    road.receiveShadow = false;
    road.renderOrder = 1;

    v12RoadNetworkGroup.add(
        road
    );

    const sidewalkWidth =
        width + 4;

    const sidewalk =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                sidewalkWidth,
                0.08,
                length
            ),
            citySidewalkMaterial
        );

    sidewalk.position.set(
        x,
        0.055,
        z
    );

    sidewalk.rotation.y =
        rotation;

    sidewalk.renderOrder = 0;

    v12RoadNetworkGroup.add(
        sidewalk
    );

    return road;

}

// ============================================================
// HELPER — CITY STREET LIGHT
// ============================================================

function createCityLight(
    x,
    z
) {

    const pole =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.10,
                0.14,
                7,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x30353a,
                roughness: 0.8
            })
        );

    pole.position.set(
        x,
        3.5,
        z
    );

    pole.castShadow = true;

    const lamp =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.3,
                10,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0xffedb0,
                emissive: 0xffc44d,
                emissiveIntensity: 0.8
            })
        );

    lamp.position.set(
        x,
        7,
        z
    );

    v12LandmarkGroup.add(
        pole,
        lamp
    );

}

// ============================================================
// HELPER — SHOP
// ============================================================

function createShop(
    x,
    z,
    width,
    depth,
    color,
    name
) {

    const shop =
        new THREE.Group();

    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                6,
                depth
            ),
            new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.72
            })
        );

    body.position.y =
        3;

    body.castShadow = true;
    body.receiveShadow = true;

    shop.add(
        body
    );

    const frontGlass =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width * 0.72,
                2.8,
                0.08
            ),
            glassCityMaterial
        );

    frontGlass.position.set(
        0,
        2.7,
        -depth / 2 - 0.05
    );

    shop.add(
        frontGlass
    );

    const sign =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width * 0.72,
                0.9,
                0.12
            ),
            new THREE.MeshStandardMaterial({
                color: 0xf5f0d5,
                emissive: 0x6b5a25,
                emissiveIntensity: 0.2
            })
        );

    sign.position.set(
        0,
        5.4,
        -depth / 2 - 0.09
    );

    shop.add(
        sign
    );

    shop.position.set(
        x,
        0,
        z
    );

    v12BuildingsGroup.add(
        shop
    );

    // Store name is kept in userData now.
    // Later versions can use this for entering/interacting.

    shop.userData.storeName =
        name;

    shop.userData.isStore =
        true;

    return shop;

}

// ============================================================
// DOWNTOWN DISTRICT
// ============================================================

function buildDowntown() {

    const centerZ = -1150;

    // City blocks

    const blockOffsets = [
        [-150, -260],
        [150, -260],
        [-150, 40],
        [150, 40],
        [-150, 340],
        [150, 340]
    ];

    for (
        const [xOffset, zOffset]
        of blockOffsets
    ) {

        const x =
            roadX(
                centerZ + zOffset
            ) +
            xOffset;

        const z =
            centerZ +
            zOffset;

        createCityBuilding(
            x,
            z,
            42,
            55 +
                Math.abs(
                    Math.sin(z * 0.01)
                ) * 35,
            42,
            0x667b91,
            {
                glass: true,
                roof: true,
                metalness: 0.2
            }
        );

    }

    // Main downtown towers

    createCityBuilding(
        roadX(-1200) - 90,
        -1200,
        58,
        125,
        58,
        0x526b82,
        {
            glass: true,
            roof: true,
            metalness: 0.3
        }
    );

    createCityBuilding(
        roadX(-1650) + 95,
        -1650,
        48,
        105,
        48,
        0x7b8491,
        {
            glass: true,
            roof: true
        }
    );

    createCityBuilding(
        roadX(-900) + 105,
        -900,
        40,
        90,
        40,
        0x8b6f61,
        {
            glass: true
        }
    );

    // Downtown cross streets

    for (
        const z of [
            -850,
            -1150,
            -1450,
            -1750
        ]
    ) {

        createCityRoad(
            roadX(z) + 120,
            z,
            260,
            10,
            Math.PI / 2
        );

    }

}

buildDowntown();

// ============================================================
// BUSINESS DISTRICT
// ============================================================

function buildBusinessDistrict() {

    const startZ = -1900;

    for (
        let row = 0;
        row < 4;
        row++
    ) {

        const z =
            startZ -
            row * 260;

        const center =
            roadX(z);

        for (
            let col = -2;
            col <= 2;
            col++
        ) {

            if (col === 0)
                continue;

            createCityBuilding(
                center +
                    col * 48,
                z,
                34,
                25 +
                    (
                        (
                            row +
                            Math.abs(col)
                        ) %
                        3
                    ) *
                    13,
                38,
                col < 0
                    ? 0x738b9f
                    : 0x8c806f,
                {
                    glass: true
                }
            );

        }

        createCityRoad(
            center + 10,
            z,
            170,
            9,
            Math.PI / 2
        );

    }

}

buildBusinessDistrict();

// ============================================================
// SHOPPING DISTRICT
// ============================================================

function buildShoppingDistrict() {

    const shopZ =
        -3050;

    const shopColors = [
        0xc45b4c,
        0x4f83a5,
        0x5c9a62,
        0xb88b4b,
        0x8b66a4,
        0x4c9b9a
    ];

    const shopNames = [
        "CITY MARKET",
        "AUTO PARTS",
        "TECH STORE",
        "FASHION",
        "HOME STORE",
        "FOOD MART"
    ];

    for (
        let i = 0;
        i < 6;
        i++
    ) {

        const side =
            i % 2 === 0
                ? -1
                : 1;

        const row =
            Math.floor(i / 2);

        const z =
            shopZ -
            row * 125;

        const center =
            roadX(z);

        const x =
            center +
            side *
            (
                42 +
                (row % 2) * 18
            );

        createShop(
            x,
            z,
            34,
            26,
            shopColors[i],
            shopNames[i]
        );

    }

    for (
        const z of [
            -3050,
            -3175,
            -3300
        ]
    ) {

        createCityRoad(
            roadX(z) + 40,
            z,
            130,
            8,
            Math.PI / 2
        );

    }

}

buildShoppingDistrict();

// ============================================================
// RESIDENTIAL DISTRICT
// ============================================================

function createHouse(
    x,
    z,
    color
) {

    const house =
        new THREE.Group();

    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                18,
                7,
                16
            ),
            new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.9
            })
        );

    body.position.y =
        3.5;

    body.castShadow = true;

    house.add(
        body
    );

    const roof =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                13,
                5,
                4
            ),
            new THREE.MeshStandardMaterial({
                color: 0x65493d,
                roughness: 1
            })
        );

    roof.position.y =
        9;

    roof.rotation.y =
        Math.PI / 4;

    roof.castShadow = true;

    house.add(
        roof
    );

    const door =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.4,
                4,
                0.2
            ),
            new THREE.MeshStandardMaterial({
                color: 0x3b2a20
            })
        );

    door.position.set(
        0,
        2,
        -8.15
    );

    house.add(
        door
    );

    house.position.set(
        x,
        0,
        z
    );

    v12BuildingsGroup.add(
        house
    );

}

function buildResidentialDistrict() {

    const baseZ =
        -4050;

    const colors = [
        0xd2b48c,
        0xb7c6d0,
        0xd0a88a,
        0xa7bd9b
    ];

    for (
        let row = 0;
        row < 7;
        row++
    ) {

        const z =
            baseZ -
            row * 145;

        const center =
            roadX(z);

        for (
            let side = -1;
            side <= 1;
            side += 2
        ) {

            for (
                let houseIndex = 0;
                houseIndex < 3;
                houseIndex++
            ) {

                const x =
                    center +
                    side *
                    (
                        35 +
                        houseIndex * 25
                    );

                createHouse(
                    x,
                    z +
                        houseIndex * 30 -
                        30,
                    colors[
                        (
                            row +
                            houseIndex
                        ) %
                        colors.length
                    ]
                );

            }

        }

        createCityRoad(
            center + 75,
            z,
            180,
            8,
            Math.PI / 2
        );

    }

}

buildResidentialDistrict();

// ============================================================
// PARK
// ============================================================

function createPark() {

    const park =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                260,
                0.08,
                260
            ),
            grassMaterial
        );

    park.position.set(
        roadX(-4400) + 220,
        0.02,
        -4400
    );

    v12NatureGroup.add(
        park
    );

    // Small paths

    for (
        const x of [-70, 0, 70]
    ) {

        const path =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    4,
                    0.12,
                    220
                ),
                citySidewalkMaterial
            );

        path.position.set(
            park.position.x + x,
            0.08,
            park.position.z
        );

        v12NatureGroup.add(
            path
        );

    }

    for (
        const z of [-70, 0, 70]
    ) {

        const path =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    220,
                    0.12,
                    4
                ),
                citySidewalkMaterial
            );

        path.position.set(
            park.position.x,
            0.08,
            park.position.z + z
        );

        v12NatureGroup.add(
            path
        );

    }

    // Park trees

    for (
        let i = 0;
        i < 22;
        i++
    ) {

        const angle =
            i * 0.82;

        const radius =
            70 +
            (i % 4) * 17;

        const x =
            park.position.x +
            Math.cos(angle) *
            radius;

        const z =
            park.position.z +
            Math.sin(angle) *
            radius;

        createTree(
            x,
            z,
            0.65 +
                (i % 3) * 0.12,
            v12NatureGroup
        );

    }

}

createPark();

// ============================================================
// RIVER
// ============================================================

function createRiver() {

    const river =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                900,
                0.12,
                150
            ),
            waterMaterial
        );

    river.position.set(
        roadX(-5900) - 120,
        -0.04,
        -5900
    );

    v12NatureGroup.add(
        river
    );

    // River banks

    const bankMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x688c54,
            roughness: 1
        });

    for (
        const z of [
            -5985,
            -5815
        ]
    ) {

        const bank =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    900,
                    0.08,
                    18
                ),
                bankMaterial
            );

        bank.position.set(
            river.position.x,
            0.01,
            z
        );

        v12NatureGroup.add(
            bank
        );

    }

    // Main bridge following the main road.

    const bridge =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                ROAD_WIDTH + 8,
                0.55,
                190
            ),
            concreteMaterial
        );

    bridge.position.set(
        roadX(-5900),
        0.28,
        -5900
    );

    bridge.rotation.y =
        roadDirection(-5900);

    bridge.castShadow = true;

    v12LandmarkGroup.add(
        bridge
    );

    // Bridge railings

    for (
        const side of [-1, 1]
    ) {

        const railing =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.18,
                    1.1,
                    180
                ),
                cityRoadEdgeMaterial
            );

        railing.position.set(
            roadX(-5900) +
                side *
                (ROAD_WIDTH / 2 + 3),
            1.0,
            -5900
        );

        railing.rotation.y =
            roadDirection(-5900);

        v12LandmarkGroup.add(
            railing
        );

    }

}

createRiver();

// ============================================================
// INDUSTRIAL DISTRICT
// ============================================================

function createWarehouse(
    x,
    z,
    width,
    depth,
    color
) {

    const warehouse =
        new THREE.Group();

    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                13,
                depth
            ),
            new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.9
            })
        );

    body.position.y =
        6.5;

    body.castShadow = true;

    warehouse.add(
        body
    );

    const roof =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width + 1,
                0.4,
                depth + 1
            ),
            concreteMaterial
        );

    roof.position.y =
        13.2;

    warehouse.add(
        roof
    );

    warehouse.position.set(
        x,
        0,
        z
    );

    v12BuildingsGroup.add(
        warehouse
    );

}

function buildIndustrialDistrict() {

    const baseZ =
        -6700;

    for (
        let i = 0;
        i < 10;
        i++
    ) {

        const z =
            baseZ -
            Math.floor(i / 2) *
            280;

        const side =
            i % 2 === 0
                ? -1
                : 1;

        const center =
            roadX(z);

        createWarehouse(
            center +
                side *
                (
                    65 +
                    (i % 3) * 20
                ),
            z,
            58,
            85,
            i % 2 === 0
                ? 0x70787c
                : 0x7d6d5b
        );

        createCityRoad(
            center +
                side * 35,
            z,
            160,
            9,
            Math.PI / 2
        );

    }

}

buildIndustrialDistrict();

// ============================================================
// AIRPORT
// ============================================================

function createAirportBuilding(
    x,
    z,
    width,
    height,
    depth,
    color
) {

    const building =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),
            new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.65,
                metalness: 0.1
            })
        );

    building.position.set(
        x,
        height / 2,
        z
    );

    building.castShadow = true;
    building.receiveShadow = true;

    v12AirportGroup.add(
        building
    );

    return building;

}

// Airport location

const AIRPORT_X =
    roadX(-9000) + 470;

const AIRPORT_Z =
    -9200;

// Airport ground

const airportGround =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            1050,
            0.08,
            1300
        ),
        airportConcreteMaterial
    );

airportGround.position.set(
    AIRPORT_X,
    0.03,
    AIRPORT_Z
);

v12AirportGroup.add(
    airportGround
);

// ============================================================
// AIRPORT TERMINAL
// ============================================================

const terminal =
    createAirportBuilding(
        AIRPORT_X,
        AIRPORT_Z + 220,
        300,
        24,
        100,
        0x7e8b96
    );

terminal.userData.airportTerminal =
    true;

// Terminal glass front

const terminalGlass =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            260,
            12,
            0.25
        ),
        glassCityMaterial
    );

terminalGlass.position.set(
    AIRPORT_X,
    12,
    AIRPORT_Z + 168
);

v12AirportGroup.add(
    terminalGlass
);

// Terminal roof

const terminalRoof =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            330,
            2,
            125
        ),
        concreteMaterial
    );

terminalRoof.position.set(
    AIRPORT_X,
    26,
    AIRPORT_Z + 220
);

v12AirportGroup.add(
    terminalRoof
);

// ============================================================
// AIRPORT CONTROL TOWER
// ============================================================

const towerBase =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            28,
            42,
            28
        ),
        concreteMaterial
    );

towerBase.position.set(
    AIRPORT_X + 190,
    21,
    AIRPORT_Z + 150
);

towerBase.castShadow = true;

v12AirportGroup.add(
    towerBase
);

const towerCabin =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            42,
            12,
            42
        ),
        glassCityMaterial
    );

towerCabin.position.set(
    AIRPORT_X + 190,
    48,
    AIRPORT_Z + 150
);

v12AirportGroup.add(
    towerCabin
);

const towerRoof =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            48,
            2,
            48
        ),
        concreteMaterial
    );

towerRoof.position.set(
    AIRPORT_X + 190,
    55,
    AIRPORT_Z + 150
);

v12AirportGroup.add(
    towerRoof
);

// ============================================================
// AIRPORT RUNWAYS
// ============================================================

function createRunway(
    x,
    z,
    width,
    length
) {

    const runway =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                0.10,
                length
            ),
            runwayMaterial
        );

    runway.position.set(
        x,
        0.105,
        z
    );

    runway.receiveShadow = false;

    v12AirportGroup.add(
        runway
    );

    // Center markings

    for (
        let offset = -length / 2 + 35;
        offset < length / 2 - 20;
        offset += 55
    ) {

        const mark =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.8,
                    0.035,
                    25
                ),
                runwayLineMaterial
            );

        mark.position.set(
            x,
            0.17,
            z + offset
        );

        v12AirportGroup.add(
            mark
        );

    }

    // Edge lines

    for (
        const side of [-1, 1]
    ) {

        const edge =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.7,
                    0.035,
                    length - 20
                ),
                runwayLineMaterial
            );

        edge.position.set(
            x +
                side *
                (width / 2 - 3),
            0.17,
            z
        );

        v12AirportGroup.add(
            edge
        );

    }

    return runway;

}

createRunway(
    AIRPORT_X - 260,
    AIRPORT_Z - 250,
    75,
    850
);

createRunway(
    AIRPORT_X + 260,
    AIRPORT_Z - 250,
    75,
    850
);

// ============================================================
// AIRPORT TAXIWAYS
// ============================================================

function createTaxiway(
    x,
    z,
    width,
    length
) {

    const taxiway =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                0.08,
                length
            ),
            new THREE.MeshBasicMaterial({
                color: 0x4d5256
            })
        );

    taxiway.position.set(
        x,
        0.12,
        z
    );

    v12AirportGroup.add(
        taxiway
    );

    return taxiway;

}

createTaxiway(
    AIRPORT_X,
    AIRPORT_Z - 250,
    28,
    900
);

createTaxiway(
    AIRPORT_X - 150,
    AIRPORT_Z + 30,
    24,
    300
);

createTaxiway(
    AIRPORT_X + 150,
    AIRPORT_Z + 30,
    24,
    300
);

// ============================================================
// AIRPORT HANGARS
// ============================================================

function createHangar(
    x,
    z
) {

    const hangar =
        new THREE.Group();

    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                95,
                22,
                75
            ),
            new THREE.MeshStandardMaterial({
                color: 0x72777c,
                roughness: 0.9
            })
        );

    body.position.y =
        11;

    body.castShadow = true;

    hangar.add(
        body
    );

    const roof =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                100,
                2,
                80
            ),
            concreteMaterial
        );

    roof.position.y =
        23;

    hangar.add(
        roof
    );

    const door =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                70,
                15,
                0.25
            ),
            new THREE.MeshStandardMaterial({
                color: 0x30363a
            })
        );

    door.position.set(
        0,
        8,
        -37.7
    );

    hangar.add(
        door
    );

    hangar.position.set(
        x,
        0,
        z
    );

    v12AirportGroup.add(
        hangar
    );

    return hangar;

}

createHangar(
    AIRPORT_X - 190,
    AIRPORT_Z + 30
);

createHangar(
    AIRPORT_X + 190,
    AIRPORT_Z + 30
);

// ============================================================
// AIRPORT PARKING
// ============================================================

const airportParking =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            310,
            0.08,
            150
        ),
        cityRoadMaterial
    );

airportParking.position.set(
    AIRPORT_X,
    0.12,
    AIRPORT_Z + 410
);

v12AirportGroup.add(
    airportParking
);

// Parking lines

for (
    let x = -130;
    x <= 130;
    x += 26
) {

    const line =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.18,
                0.035,
                20
            ),
            runwayLineMaterial
        );

    line.position.set(
        AIRPORT_X + x,
        0.18,
        AIRPORT_Z + 410
    );

    v12AirportGroup.add(
        line
    );

}

// ============================================================
// AIRPORT ACCESS ROAD
// ============================================================

createCityRoad(
    AIRPORT_X,
    AIRPORT_Z + 500,
    18,
    420,
    0
);

createCityRoad(
    AIRPORT_X - 300,
    AIRPORT_Z + 500,
    18,
    420,
    0
);

createCityRoad(
    AIRPORT_X + 300,
    AIRPORT_Z + 500,
    18,
    420,
    0
);

// ============================================================
// AIRPORT MARKERS
// ============================================================

const airportBeaconMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xff4040,
        emissive: 0xff2020,
        emissiveIntensity: 1
    });

for (
    const side of [-1, 1]
) {

    const beacon =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.5,
                0.5,
                12,
                10
            ),
            airportBeaconMaterial
        );

    beacon.position.set(
        AIRPORT_X +
            side * 520,
        6,
        AIRPORT_Z - 570
    );

    v12AirportGroup.add(
        beacon
    );

}

// ============================================================
// CITY CONNECTING ROADS
// ============================================================

// These roads make the city feel like a connected network
// instead of a single road with isolated buildings.

const cityCrossings = [
    -650,
    -950,
    -1250,
    -1550,
    -1850,
    -2150,
    -2450,
    -2750,
    -3050,
    -3350,
    -3650,
    -3950,
    -4250,
    -4550,
    -4850,
    -5150,
    -5450,
    -5750,
    -6050,
    -6350,
    -6650,
    -6950,
    -7250,
    -7550,
    -7850,
    -8150
];

for (
    const z of cityCrossings
) {

    const center =
        roadX(z);

    createCityLight(
        center - 13,
        z
    );

    createCityLight(
        center + 13,
        z
    );

    // Short connecting roads on both sides.

    createCityRoad(
        center - 70,
        z,
        120,
        7,
        Math.PI / 2
    );

    createCityRoad(
        center + 70,
        z,
        120,
        7,
        Math.PI / 2
    );

}

// ============================================================
// CITY TREES
// ============================================================

for (
    let z = -700;
    z > -8500;
    z -= 120
) {

    const center =
        roadX(z);

    createTree(
        center - 95,
        z + 25,
        0.55 +
            (
                Math.abs(
                    Math.sin(z)
                ) * 0.2
            ),
        v12NatureGroup
    );

    createTree(
        center + 95,
        z - 20,
        0.55 +
            (
                Math.abs(
                    Math.cos(z)
                ) * 0.2
            ),
        v12NatureGroup
    );

}

// ============================================================
// CITY ENTRY / EXIT ROADS
// ============================================================

// These connect the main curved highway to the city.

for (
    const z of [
        -1000,
        -2100,
        -3200,
        -4400,
        -5800,
        -7000,
        -8200
    ]
) {

    const center =
        roadX(z);

    createCityRoad(
        center - 65,
        z,
        130,
        7,
        Math.PI / 2
    );

    createCityRoad(
        center + 65,
        z,
        130,
        7,
        Math.PI / 2
    );

}

// ============================================================
// CITY LANDMARK PLAZA
// ============================================================

const plaza =
    new THREE.Mesh(
        new THREE.CylinderGeometry(
            58,
            58,
            0.12,
            48
        ),
        citySidewalkMaterial
    );

plaza.position.set(
    roadX(-2300),
    0.08,
    -2300
);

v12LandmarkGroup.add(
    plaza
);

// Plaza monument

const monument =
    new THREE.Mesh(
        new THREE.CylinderGeometry(
            5,
            8,
            30,
            12
        ),
        concreteMaterial
    );

monument.position.set(
    roadX(-2300),
    15,
    -2300
);

monument.castShadow = true;

v12LandmarkGroup.add(
    monument
);

// ============================================================
// CITY GROUP COMPLETE
// ============================================================

console.log(
    "CARS 13 V12 city generated: downtown, business, shopping, residential, park, river, industrial and airport."
);
// ============================================================
// CARS 13 V12 — PLAYER, GARAGE AND MOBILE CONTROLS
// ============================================================

// ============================================================
// PLAYER CAR
// ============================================================

const playerCar =
    new THREE.Group();

const bodyMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xc41616,
        roughness: 0.55,
        metalness: 0.15
    });

const blackMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x15171a,
        roughness: 0.65
    });

const glassMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x263c4a,
        roughness: 0.18,
        metalness: 0.15
    });

const headlightMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xfff4c2,
        emissive: 0xffd86b,
        emissiveIntensity: 0.7
    });

const taillightMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xff2929,
        emissive: 0xff0000,
        emissiveIntensity: 0.7
    });

// ============================================================
// CAR BODY
// ============================================================

const carBody =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            4.4,
            1.05,
            7.8
        ),
        bodyMaterial
    );

carBody.position.y =
    1.05;

carBody.castShadow = true;
carBody.receiveShadow = true;

playerCar.add(
    carBody
);

// ============================================================
// CAR CABIN
// ============================================================

const cabin =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            3.35,
            1.25,
            3.6
        ),
        glassMaterial
    );

cabin.position.set(
    0,
    1.9,
    0.25
);

cabin.castShadow = true;

playerCar.add(
    cabin
);

// Roof

const roof =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            3.5,
            0.18,
            3.7
        ),
        bodyMaterial
    );

roof.position.set(
    0,
    2.55,
    0.25
);

roof.castShadow = true;

playerCar.add(
    roof
);

// ============================================================
// FRONT FENDER SHAPES
// ============================================================

for (
    const x of [-2.12, 2.12]
) {

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
        x < 0
            ? -0.04
            : 0.04;

    fender.castShadow = true;

    playerCar.add(
        fender
    );

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

playerCar.add(
    spoiler
);

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

    playerCar.add(
        support
    );

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

    playerCar.add(
        light
    );

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

    playerCar.add(
        light
    );

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

    wheel.add(
        tire
    );

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

    wheel.add(
        rim
    );

    wheel.position.set(
        x,
        0.72,
        z
    );

    playerCar.add(
        wheel
    );

    wheels.push(
        wheel
    );

    if (front) {
        frontWheels.push(
            wheel
        );
    }

}

createWheel(
    -2.35,
    -2.65,
    true
);

createWheel(
    2.35,
    -2.65,
    true
);

createWheel(
    -2.35,
    2.65,
    false
);

createWheel(
    2.35,
    2.65,
    false
);

// ============================================================
// START POSITION
// ============================================================

playerCar.position.set(
    roadX(0),
    0,
    0
);

scene.add(
    playerCar
);

// ============================================================
// GARAGE / CAR CATALOG
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

const SAVE_KEY =
    "cars13-v12-save";

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

        const saved =
            JSON.parse(
                localStorage.getItem(
                    SAVE_KEY
                )
            );

        if (
            saved &&
            Number.isFinite(saved.cash) &&
            Number.isFinite(saved.level) &&
            Array.isArray(saved.ownedCars) &&
            typeof saved.selectedCar === "string"
        ) {

            return {
                cash: Math.max(
                    0,
                    saved.cash
                ),
                level: Math.max(
                    1,
                    saved.level
                ),
                ownedCars:
                    saved.ownedCars.filter(
                        (id) =>
                            CAR_CATALOG.some(
                                (car) =>
                                    car.id === id
                            )
                    ),
                selectedCar:
                    saved.selectedCar
            };

        }

    } catch (error) {

        console.warn(
            "V12 save could not be loaded. Starting fresh."
        );

    }

    return createFreshSave();

}

let gameSave =
    loadSave();

if (
    !gameSave.ownedCars.includes(
        "starter"
    )
) {

    gameSave =
        createFreshSave();

}

function saveGame() {

    localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(gameSave)
    );

}

let selectedMode =
    "career";

let gameStarted =
    false;

let isDriving =
    true;

let checkpointZ =
    -360;

let activeCar =
    CAR_CATALOG[0];

// ============================================================
// PLAYER CHARACTER
// ============================================================

function createDriver() {

    const driver =
        new THREE.Group();

    const clothes =
        new THREE.MeshStandardMaterial({
            color: 0x263b5a
        });

    const skin =
        new THREE.MeshStandardMaterial({
            color: 0xc98c68
        });

    const shoes =
        new THREE.MeshStandardMaterial({
            color: 0x202124
        });

    const torso =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.8,
                1.25,
                0.42
            ),
            clothes
        );

    torso.position.y =
        1.85;

    driver.add(
        torso
    );

    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.34,
                16,
                12
            ),
            skin
        );

    head.position.y =
        2.76;

    driver.add(
        head
    );

    for (
        const x of [-0.28, 0.28]
    ) {

        const arm =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.18,
                    0.92,
                    0.18
                ),
                clothes
            );

        arm.position.set(
            x * 1.9,
            1.88,
            0
        );

        arm.name =
            "arm";

        driver.add(
            arm
        );

        const leg =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.24,
                    1.05,
                    0.24
                ),
                x < 0
                    ? clothes
                    : shoes
            );

        leg.position.set(
            x,
            0.55,
            0
        );

        leg.name =
            "leg";

        driver.add(
            leg
        );

    }

    driver.traverse(
        (part) => {

            if (part.isMesh) {
                part.castShadow = true;
            }

        }
    );

    return driver;

}

const playerCharacter =
    createDriver();

playerCharacter.visible =
    false;

scene.add(
    playerCharacter
);

// ============================================================
// CHECKPOINT
// ============================================================

const checkpoint =
    new THREE.Group();

const checkpointRing =
    new THREE.Mesh(
        new THREE.TorusGeometry(
            4.8,
            0.22,
            10,
            32
        ),
        new THREE.MeshStandardMaterial({
            color: 0xffd54f,
            emissive: 0xffa000,
            emissiveIntensity: 1.1
        })
    );

const checkpointBase =
    new THREE.Mesh(
        new THREE.CylinderGeometry(
            5.4,
            5.4,
            0.08,
            32
        ),
        new THREE.MeshStandardMaterial({
            color: 0xffc107,
            emissive: 0xff8f00,
            emissiveIntensity: 0.35
        })
    );

checkpointRing.position.y =
    5;

checkpointBase.position.y =
    0.04;

checkpoint.add(
    checkpointRing,
    checkpointBase
);

checkpoint.visible =
    false;

scene.add(
    checkpoint
);

function placeCheckpoint(z) {

    checkpointZ =
        z;

    checkpoint.position.set(
        roadX(checkpointZ),
        0,
        checkpointZ
    );

    checkpoint.rotation.y =
        roadDirection(
            checkpointZ
        );

}

placeCheckpoint(
    checkpointZ
);

// ============================================================
// DRIVING VARIABLES
// ============================================================

let speed = 0;
let steering = 0;

let heading =
    roadDirection(0);

let MAX_SPEED =
    5.0;

let ACCELERATION =
    0.035;

const BRAKING =
    0.09;

const FRICTION =
    0.008;

let TURN_RATE =
    0.008;

const ROAD_LIMIT =
    ROAD_WIDTH * 0.42;

// ============================================================
// KEYBOARD INPUT
// ============================================================

const keys = {};

const activePointers =
    new Map();

const controlButtons =
    new Map();

const gameKeys =
    new Set([
        "w",
        "a",
        "s",
        "d",
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
        "e"
    ]);

function isControlPressed(id) {

    for (
        const activeId
        of activePointers.values()
    ) {

        if (
            activeId === id
        ) {

            return true;

        }

    }

    return false;

}

function syncControlAppearance() {

    for (
        const [id, button]
        of controlButtons
    ) {

        const pressed =
            isControlPressed(id);

        button.classList.toggle(
            "is-pressed",
            pressed
        );

        button.setAttribute(
            "aria-pressed",
            String(pressed)
        );

    }

}

function releasePointer(
    pointerId
) {

    activePointers.delete(
        pointerId
    );

    syncControlAppearance();

}

function clearPointerControls() {

    activePointers.clear();

    syncControlAppearance();

}

window.addEventListener(
    "keydown",
    (event) => {

        const key =
            event.key.toLowerCase();

        if (
            gameKeys.has(key)
        ) {

            event.preventDefault();

        }

        if (
            key === "e" &&
            !event.repeat
        ) {

            toggleVehicle();

        }

        keys[key] =
            true;

    }
);

window.addEventListener(
    "keyup",
    (event) => {

        keys[
            event.key.toLowerCase()
        ] = false;

    }
);

window.addEventListener(
    "blur",
    clearPointerControls
);

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.hidden
        ) {

            clearPointerControls();

        }

    }
);

// ============================================================
// OLD BUTTON CONTROLS
// ============================================================

function setupButton(id) {

    const button =
        document.getElementById(id);

    if (!button)
        return;

    controlButtons.set(
        id,
        button
    );

    button.setAttribute(
        "aria-pressed",
        "false"
    );

    if (
        id === "action"
    ) {

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

            button.setPointerCapture(
                event.pointerId
            );

            activePointers.set(
                event.pointerId,
                id
            );

            syncControlAppearance();

        }
    );

    button.addEventListener(
        "pointerup",
        (event) => {

            event.preventDefault();

            releasePointer(
                event.pointerId
            );

        }
    );

    button.addEventListener(
        "pointercancel",
        (event) =>
            releasePointer(
                event.pointerId
            )
    );

    button.addEventListener(
        "lostpointercapture",
        (event) =>
            releasePointer(
                event.pointerId
            )
    );

}

setupButton("gas");
setupButton("brake");
setupButton("left");
setupButton("right");
setupButton("action");

// ============================================================
// V12 MOBILE WALKING JOYSTICK
// ============================================================

const mobileJoystick =
    document.getElementById(
        "mobileJoystick"
    );

const mobileJoystickKnob =
    document.getElementById(
        "mobileJoystickKnob"
    );

let joystickActive =
    false;

let joystickPointerId =
    null;

let joystickX =
    0;

let joystickY =
    0;

const joystickRadius =
    55;

function resetJoystick() {

    joystickActive =
        false;

    joystickPointerId =
        null;

    joystickX =
        0;

    joystickY =
        0;

    if (
        mobileJoystickKnob
    ) {

        mobileJoystickKnob.style.transform =
            "translate(-50%, -50%)";

    }

}

function updateJoystick(
    clientX,
    clientY
) {

    if (
        !mobileJoystick
    )
        return;

    const rect =
        mobileJoystick.getBoundingClientRect();

    const centerX =
        rect.left +
        rect.width / 2;

    const centerY =
        rect.top +
        rect.height / 2;

    let dx =
        clientX -
        centerX;

    let dy =
        clientY -
        centerY;

    const distance =
        Math.hypot(
            dx,
            dy
        );

    if (
        distance >
        joystickRadius
    ) {

        dx =
            dx /
            distance *
            joystickRadius;

        dy =
            dy /
            distance *
            joystickRadius;

    }

    joystickX =
        THREE.MathUtils.clamp(
            dx / joystickRadius,
            -1,
            1
        );

    joystickY =
        THREE.MathUtils.clamp(
            dy / joystickRadius,
            -1,
            1
        );

    if (
        mobileJoystickKnob
    ) {

        mobileJoystickKnob.style.transform =
            "translate(calc(-50% + " +
            dx +
            "px), calc(-50% + " +
            dy +
            "px))";

    }

}

if (
    mobileJoystick
) {

    mobileJoystick.addEventListener(
        "pointerdown",
        (event) => {

            event.preventDefault();

            joystickActive =
                true;

            joystickPointerId =
                event.pointerId;

            mobileJoystick.setPointerCapture(
                event.pointerId
            );

            updateJoystick(
                event.clientX,
                event.clientY
            );

        }
    );

    mobileJoystick.addEventListener(
        "pointermove",
        (event) => {

            if (
                !joystickActive ||
                event.pointerId !==
                    joystickPointerId
            ) {

                return;

            }

            event.preventDefault();

            updateJoystick(
                event.clientX,
                event.clientY
            );

        }
    );

    mobileJoystick.addEventListener(
        "pointerup",
        (event) => {

            if (
                event.pointerId ===
                joystickPointerId
            ) {

                resetJoystick();

            }

        }
    );

    mobileJoystick.addEventListener(
        "pointercancel",
        resetJoystick
    );

    mobileJoystick.addEventListener(
        "lostpointercapture",
        resetJoystick
    );

}

// ============================================================
// MOBILE ACTION BUTTON
// ============================================================

const mobileAction =
    document.getElementById(
        "mobileAction"
    );

if (
    mobileAction
) {

    mobileAction.addEventListener(
        "pointerdown",
        (event) => {

            event.preventDefault();

            toggleVehicle();

        }
    );

}

// ============================================================
// MOBILE CAMERA BUTTON
// ============================================================

const mobileCamera =
    document.getElementById(
        "mobileCamera"
    );

let cameraTurn =
    0;

if (
    mobileCamera
) {

    mobileCamera.addEventListener(
        "pointerdown",
        (event) => {

            event.preventDefault();

            cameraTurn =
                cameraTurn === 0
                    ? 1
                    : 0;

        }
    );

}

// ============================================================
// GAME MODE / GARAGE UI
// ============================================================

const garagePanel =
    document.getElementById(
        "garagePanel"
    );

const carList =
    document.getElementById(
        "carList"
    );

const careerModeButton =
    document.getElementById(
        "careerMode"
    );

const freeModeButton =
    document.getElementById(
        "freeMode"
    );

const startDriveButton =
    document.getElementById(
        "startDrive"
    );

const menuButton =
    document.getElementById(
        "menuButton"
    );

const garageHint =
    document.getElementById(
        "garageHint"
    );

const interactionPrompt =
    document.getElementById(
        "interactionPrompt"
    );

const actionButton =
    document.getElementById(
        "action"
    );

let notificationText =
    "";

let notificationUntil =
    0;

function getCar(id) {

    return (
        CAR_CATALOG.find(
            (car) =>
                car.id === id
        ) ||
        CAR_CATALOG[0]
    );

}

function applySelectedCar() {

    activeCar =
        getCar(
            gameSave.selectedCar
        );

    bodyMaterial.color.setHex(
        activeCar.color
    );

    playerCar.scale.set(
        ...activeCar.scale
    );

    MAX_SPEED =
        activeCar.maxSpeed;

    ACCELERATION =
        activeCar.acceleration;

    TURN_RATE =
        activeCar.handling;

}

function renderGarage() {

    applySelectedCar();

    if (
        !carList
    )
        return;

    carList.innerHTML =
        "";

    for (
        const car
        of CAR_CATALOG
    ) {

        const owned =
            gameSave.ownedCars.includes(
                car.id
            );

        const selected =
            gameSave.selectedCar ===
            car.id;

        const canBuy =
            gameSave.cash >=
            car.price;

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "carCard" +
            (
                selected
                    ? " is-selected"
                    : ""
            );

        const paint =
            document.createElement(
                "div"
            );

        paint.className =
            "carPaint";

        paint.style.background =
            "#" +
            car.color
                .toString(16)
                .padStart(
                    6,
                    "0"
                );

        const title =
            document.createElement(
                "h2"
            );

        title.textContent =
            car.name;

        const details =
            document.createElement(
                "p"
            );

        details.textContent =
            car.description +
            " · " +
            Math.round(
                car.maxSpeed * 24
            ) +
            " km/h";

        const button =
            document.createElement(
                "button"
            );

        if (
            selected
        ) {

            button.textContent =
                "SELECTED";

            button.disabled =
                true;

        } else if (
            owned
        ) {

            button.textContent =
                "SELECT";

            button.addEventListener(
                "click",
                () => {

                    gameSave.selectedCar =
                        car.id;

                    saveGame();

                    renderGarage();

                }
            );

        } else {

            button.textContent =
                "$" +
                car.price.toLocaleString();

            button.disabled =
                !canBuy;

            button.addEventListener(
                "click",
                () =>
                    buyCar(car)
            );

        }

        card.append(
            paint,
            title,
            details,
            button
        );

        carList.appendChild(
            card
        );

    }

    if (
        careerModeButton
    ) {

        careerModeButton.classList.toggle(
            "is-selected",
            selectedMode ===
                "career"
        );

    }

    if (
        freeModeButton
    ) {

        freeModeButton.classList.toggle(
            "is-selected",
            selectedMode ===
                "free"
        );

    }

    if (
        startDriveButton
    ) {

        startDriveButton.textContent =
            selectedMode ===
                "career"
                ? "START CAREER"
                : "START FREE DRIVE";

    }

    if (
        garageHint
    ) {

        garageHint.textContent =
            "Cash: $" +
            gameSave.cash.toLocaleString() +
            " · Level " +
            gameSave.level;

    }

}

function buyCar(car) {

    if (
        gameSave.ownedCars.includes(
            car.id
        ) ||
        gameSave.cash <
            car.price
    ) {

        return;

    }

    gameSave.cash -=
        car.price;

    gameSave.ownedCars.push(
        car.id
    );

    gameSave.selectedCar =
        car.id;

    saveGame();

    renderGarage();

    announce(
        car.name +
        " is now in your garage."
    );

}

function announce(
    text,
    duration = 2600
) {

    notificationText =
        text;

    notificationUntil =
        performance.now() +
        duration;

}

// ============================================================
// START GAME
// ============================================================

function startGame() {

    gameStarted =
        true;

    isDriving =
        true;

    playerCharacter.visible =
        false;

    playerCar.visible =
        true;

    speed =
        0;

    heading =
        roadDirection(
            playerCar.position.z
        );

    applySelectedCar();

    if (
        garagePanel
    ) {

        garagePanel.classList.remove(
            "is-open"
        );

    }

    checkpoint.visible =
        selectedMode ===
        "career";

    if (
        selectedMode ===
        "career"
    ) {

        placeCheckpoint(
            playerCar.position.z -
            360
        );

        announce(
            "Reach the gold checkpoint to earn your first reward.",
            4200
        );

    } else {

        announce(
            "Free Drive: explore the city, river, industrial zone and airport.",
            4000
        );

    }

}

// ============================================================
// GARAGE
// ============================================================

function toggleGarage() {

    if (
        !gameStarted ||
        !garagePanel
    )
        return;

    garagePanel.classList.toggle(
        "is-open"
    );

    if (
        garagePanel.classList.contains(
            "is-open"
        )
    ) {

        renderGarage();

    }

}

// ============================================================
// VEHICLE
// ============================================================

function isNearCar() {

    return (
        playerCharacter.position
            .distanceTo(
                playerCar.position
            ) < 8
    );

}

function exitVehicle() {

    speed =
        0;

    isDriving =
        false;

    playerCharacter.visible =
        true;

    playerCar.visible =
        true;

    playerCharacter.position.set(
        playerCar.position.x -
            Math.cos(heading) * 4,
        0,
        playerCar.position.z +
            Math.sin(heading) * 4
    );

    playerCharacter.rotation.y =
        heading;

    announce(
        "You are on foot. Use the joystick to walk around the city.",
        4000
    );

}

function enterVehicle() {

    isDriving =
        true;

    playerCharacter.visible =
        false;

    playerCar.visible =
        true;

    announce(
        "Back in the " +
        activeCar.name +
        ".",
        2200
    );

}

function toggleVehicle() {

    if (
        !gameStarted ||
        (
            garagePanel &&
            garagePanel.classList.contains(
                "is-open"
            )
        )
    ) {

        return;

    }

    if (
        isDriving
    ) {

        exitVehicle();

    } else if (
        isNearCar()
    ) {

        enterVehicle();

    } else {

        announce(
            "Walk closer to your car to get in."
        );

    }

}

// ============================================================
// V12 ON-FOOT MOVEMENT
// ============================================================

function updateOnFoot(
    delta
) {

    if (
        !gameStarted ||
        isDriving
    ) {

        return;

    }

    let moveX =
        joystickX;

    let moveY =
        joystickY;

    // Keyboard remains available.

    moveX +=
        (
            keys["d"] ||
            keys["arrowright"]
                ? 1
                : 0
        );

    moveX -=
        (
            keys["a"] ||
            keys["arrowleft"]
                ? 1
                : 0
        );

    moveY +=
        (
            keys["s"] ||
            keys["arrowdown"]
                ? 1
                : 0
        );

    moveY -=
        (
            keys["w"] ||
            keys["arrowup"]
                ? 1
                : 0
        );

    const movement =
        new THREE.Vector2(
            moveX,
            moveY
        );

    if (
        movement.lengthSq() <
        0.001
    ) {

        // Slowly stop the walking animation.

        playerCharacter.traverse(
            (part) => {

                if (
                    part.name ===
                        "arm" ||
                    part.name ===
                        "leg"
                ) {

                    part.rotation.x *=
                        0.8;

                }

            }
        );

        return;

    }

    movement.normalize();

    const walkingSpeed =
        13 * delta;

    playerCharacter.position.x =
        THREE.MathUtils.clamp(
            playerCharacter.position.x +
                movement.x *
                walkingSpeed,
            -900,
            900
        );

    playerCharacter.position.z +=
        movement.y *
        walkingSpeed;

    // Character faces the direction
    // in which the joystick is pushed.

    playerCharacter.rotation.y =
        Math.atan2(
            -movement.x,
            -movement.y
        );

    // Walking animation

    const stride =
        Math.sin(
            performance.now() *
            0.015
        ) *
        0.45 *
        Math.min(
            movement.length(),
            1
        );

    playerCharacter.traverse(
        (part) => {

            if (
                part.name === "arm" ||
                part.name === "leg"
            ) {

                part.rotation.x =
                    part.position.x < 0
                        ? stride
                        : -stride;

            }

        }
    );

}

// ============================================================
// PROGRESSION
// ============================================================

function updateProgression(
    delta
) {

    if (
        selectedMode !==
            "career" ||
        !gameStarted
    ) {

        return;

    }

    checkpointRing.rotation.z +=
        delta * 1.6;

    if (
        !isDriving
    )
        return;

    const distance =
        Math.hypot(
            playerCar.position.x -
                checkpoint.position.x,
            playerCar.position.z -
                checkpoint.position.z
        );

    if (
        distance > 9
    )
        return;

    const reward =
        450 +
        gameSave.level *
        150;

    gameSave.cash +=
        reward;

    gameSave.level +=
        1;

    saveGame();

    placeCheckpoint(
        playerCar.position.z -
        (
            320 +
            gameSave.level *
            30
        )
    );

    announce(
        "Checkpoint cleared! +$" +
        reward.toLocaleString() +
        " · Level " +
        gameSave.level,
        4000
    );

}

// ============================================================
// GARAGE BUTTONS
// ============================================================

if (
    careerModeButton
) {

    careerModeButton.addEventListener(
        "click",
        () => {

            selectedMode =
                "career";

            renderGarage();

        }
    );

}

if (
    freeModeButton
) {

    freeModeButton.addEventListener(
        "click",
        () => {

            selectedMode =
                "free";

            renderGarage();

        }
    );

}

if (
    startDriveButton
) {

    startDriveButton.addEventListener(
        "click",
        startGame
    );

}

if (
    menuButton
) {

    menuButton.addEventListener(
        "click",
        toggleGarage
    );

}

renderGarage();

console.log(
    "CARS 13 V12 — mobile walking controls ready."
);
// ============================================================
// CARS 13 V12 — DRIVING + CAMERA + INFINITE WORLD
// ============================================================

// ============================================================
// DRIVING UPDATE
// ============================================================

function updateDriving(delta) {

    if (
        !gameStarted ||
        !isDriving
    ) {
        return;
    }

    const gasPressed =
        keys["w"] ||
        keys["arrowup"] ||
        isControlPressed("gas");

    const brakePressed =
        keys["s"] ||
        keys["arrowdown"] ||
        isControlPressed("brake");

    const leftPressed =
        keys["a"] ||
        keys["arrowleft"] ||
        isControlPressed("left");

    const rightPressed =
        keys["d"] ||
        keys["arrowright"] ||
        isControlPressed("right");

    // --------------------------------------------------------
    // ACCELERATION
    // --------------------------------------------------------

    if (gasPressed) {

        speed +=
            ACCELERATION *
            delta *
            60;

    } else if (brakePressed) {

        speed -=
            BRAKING *
            delta *
            60;

    } else {

        // Natural friction

        if (speed > 0) {

            speed = Math.max(
                0,
                speed -
                    FRICTION *
                    delta *
                    60
            );

        } else if (speed < 0) {

            speed = Math.min(
                0,
                speed +
                    FRICTION *
                    delta *
                    60
            );

        }

    }

    speed =
        THREE.MathUtils.clamp(
            speed,
            -MAX_SPEED * 0.35,
            MAX_SPEED
        );

    // --------------------------------------------------------
    // STEERING
    // --------------------------------------------------------

    let steerInput = 0;

    if (leftPressed) {
        steerInput -= 1;
    }

    if (rightPressed) {
        steerInput += 1;
    }

    // Steering becomes less sensitive
    // when the car is moving slowly.

    const steeringStrength =
        THREE.MathUtils.clamp(
            Math.abs(speed) /
                Math.max(
                    MAX_SPEED,
                    0.001
                ),
            0.15,
            1
        );

    if (steerInput !== 0) {

        heading +=
            steerInput *
            TURN_RATE *
            delta *
            60 *
            steeringStrength;

    }

    // --------------------------------------------------------
    // MOVE CAR
    // --------------------------------------------------------

    const previousZ =
        playerCar.position.z;

    playerCar.position.x +=
        Math.sin(heading) *
        speed *
        delta *
        60;

    playerCar.position.z +=
        Math.cos(heading) *
        speed *
        delta *
        60;

    // --------------------------------------------------------
    // KEEP CAR CLOSE TO THE MAIN ROAD
    // --------------------------------------------------------

    const roadCenter =
        roadX(
            playerCar.position.z
        );

    const roadOffset =
        playerCar.position.x -
        roadCenter;

    // A gentle correction keeps the
    // car on the playable road.

    if (
        Math.abs(roadOffset) >
        ROAD_LIMIT
    ) {

        playerCar.position.x =
            THREE.MathUtils.lerp(
                playerCar.position.x,
                roadCenter +
                    THREE.MathUtils.clamp(
                        roadOffset,
                        -ROAD_LIMIT,
                        ROAD_LIMIT
                    ),
                0.12
            );

        speed *=
            0.985;

    }

    // --------------------------------------------------------
    // CAR ROTATION
    // --------------------------------------------------------

    playerCar.rotation.y =
        heading;

    // Front wheel steering

    const frontWheelAngle =
        steerInput *
        0.45;

    for (
        const wheel
        of frontWheels
    ) {

        wheel.rotation.y =
            frontWheelAngle;

    }

    // --------------------------------------------------------
    // WHEEL ROTATION
    // --------------------------------------------------------

    for (
        const wheel
        of wheels
    ) {

        wheel.children[0].rotation.x -=
            speed *
            delta *
            4;

    }

    // --------------------------------------------------------
    // ROAD UPDATE
    // --------------------------------------------------------

    updateInfiniteRoad(
        playerCar.position.z
    );

    // --------------------------------------------------------
    // DYNAMIC SCENERY UPDATE
    // --------------------------------------------------------

    updateDynamicScenery(
        playerCar.position.z
    );

    // --------------------------------------------------------
    // PREVENT THE CAR FROM GOING
    // TOO FAR OUTSIDE THE WORLD
    // --------------------------------------------------------

    playerCar.position.x =
        THREE.MathUtils.clamp(
            playerCar.position.x,
            -900,
            900
        );

}

// ============================================================
// DYNAMIC SCENERY
// ============================================================

let generatedMinZ =
    ROAD_END - 600;

let generatedMaxZ =
    ROAD_START + 600;

const GENERATION_DISTANCE =
    1200;

const generatedScenery =
    new Map();

function generateSceneryChunk(
    startZ,
    endZ
) {

    const key =
        Math.round(
            startZ / 600
        );

    if (
        generatedScenery.has(
            key
        )
    ) {

        return;

    }

    generatedScenery.set(
        key,
        true
    );

    if (
        typeof createTreesForSegment ===
        "function"
    ) {

        createTreesForSegment(
            startZ,
            endZ
        );

    }

    if (
        typeof createBuildingsForSegment ===
        "function"
    ) {

        createBuildingsForSegment(
            startZ,
            endZ
        );

    }

}

function updateDynamicScenery(
    playerZ
) {

    // Generate scenery ahead.

    while (
        playerZ >
        generatedMaxZ -
            GENERATION_DISTANCE
    ) {

        const newMaxZ =
            generatedMaxZ +
            600;

        generateSceneryChunk(
            generatedMaxZ,
            newMaxZ
        );

        generatedMaxZ =
            newMaxZ;

    }

    // Generate scenery behind.

    while (
        playerZ <
        generatedMinZ +
            GENERATION_DISTANCE
    ) {

        const newMinZ =
            generatedMinZ -
            600;

        generateSceneryChunk(
            newMinZ,
            generatedMinZ
        );

        generatedMinZ =
            newMinZ;

    }

    updateInfiniteRoad(
        playerZ
    );

}

// ============================================================
// INITIAL WORLD GENERATION
// ============================================================

generateSceneryChunk(
    ROAD_END - 600,
    ROAD_END
);

generateSceneryChunk(
    ROAD_END,
    ROAD_END + 600
);

generateSceneryChunk(
    -600,
    0
);

generateSceneryChunk(
    0,
    600
);

generateSceneryChunk(
    ROAD_START,
    ROAD_START + 600
);

// ============================================================
// CAMERA SETTINGS
// ============================================================

const cameraFollowSpeed =
    0.10;

const drivingCameraHeight =
    5.2;

const drivingCameraDistance =
    11;

const footCameraHeight =
    4.4;

const footCameraDistance =
    7;

// ============================================================
// CAMERA UPDATE
// ============================================================

function updateCamera(
    delta
) {

    if (
        !gameStarted
    ) {

        return;

    }

    const followAmount =
        THREE.MathUtils.clamp(
            cameraFollowSpeed *
                delta *
                60,
            0,
            1
        );

    // --------------------------------------------------------
    // ON FOOT CAMERA
    // --------------------------------------------------------

    if (
        !isDriving
    ) {

        const footHeading =
            playerCharacter.rotation.y;

        const desiredX =
            playerCharacter.position.x +
            Math.sin(
                footHeading
            ) *
            footCameraDistance;

        const desiredY =
            footCameraHeight;

        const desiredZ =
            playerCharacter.position.z +
            Math.cos(
                footHeading
            ) *
            footCameraDistance;

        camera.position.x +=
            (
                desiredX -
                camera.position.x
            ) *
            followAmount;

        camera.position.y +=
            (
                desiredY -
                camera.position.y
            ) *
            followAmount;

        camera.position.z +=
            (
                desiredZ -
                camera.position.z
            ) *
            followAmount;

        camera.lookAt(
            playerCharacter.position.x -
                Math.sin(
                    footHeading
                ) *
                4,

            1.5,

            playerCharacter.position.z -
                Math.cos(
                    footHeading
                ) *
                4
        );

        return;

    }

    // --------------------------------------------------------
    // DRIVING CAMERA
    // --------------------------------------------------------

    const carX =
        playerCar.position.x;

    const carY =
        playerCar.position.y;

    const carZ =
        playerCar.position.z;

    const behindX =
        carX -
        Math.sin(
            heading
        ) *
        drivingCameraDistance;

    const behindZ =
        carZ -
        Math.cos(
            heading
        ) *
        drivingCameraDistance;

    const desiredCameraX =
        behindX;

    const desiredCameraY =
        carY +
        drivingCameraHeight;

    const desiredCameraZ =
        behindZ;

    camera.position.x +=
        (
            desiredCameraX -
            camera.position.x
        ) *
        followAmount;

    camera.position.y +=
        (
            desiredCameraY -
            camera.position.y
        ) *
        followAmount;

    camera.position.z +=
        (
            desiredCameraZ -
            camera.position.z
        ) *
        followAmount;

    camera.lookAt(
        carX +
            Math.sin(
                heading
            ) *
            5,

        1.1,

        carZ +
            Math.cos(
                heading
            ) *
            5
    );

}

// ============================================================
// CAMERA START POSITION
// ============================================================

camera.position.set(
    playerCar.position.x,
    drivingCameraHeight,
    playerCar.position.z -
        drivingCameraDistance
);

camera.lookAt(
    playerCar.position.x,
    1,
    playerCar.position.z
);

// ============================================================
// CHECKPOINT VISUAL ANIMATION
// ============================================================

function updateCheckpointVisual(
    delta
) {

    if (
        !checkpoint.visible
    ) {

        return;

    }

    checkpointRing.rotation.z +=
        delta *
        1.8;

    const pulse =
        1 +
        Math.sin(
            performance.now() *
            0.005
        ) *
        0.08;

    checkpointRing.scale.set(
        pulse,
        pulse,
        pulse
    );

}

// ============================================================
// NOTIFICATION DISPLAY
// ============================================================

function updateNotification() {

    const now =
        performance.now();

    const notification =
        document.getElementById(
            "notification"
        );

    if (
        !notification
    ) {

        return;

    }

    if (
        now <
        notificationUntil
    ) {

        notification.textContent =
            notificationText;

        notification.classList.add(
            "is-visible"
        );

    } else {

        notification.classList.remove(
            "is-visible"
        );

    }

}

// ============================================================
// HUD UPDATE
// ============================================================

function updateHUD() {

    const speedDisplay =
        document.getElementById(
            "speedDisplay"
        );

    const cashDisplay =
        document.getElementById(
            "cashDisplay"
        );

    const levelDisplay =
        document.getElementById(
            "levelDisplay"
        );

    const modeDisplay =
        document.getElementById(
            "modeDisplay"
        );

    const actionDisplay =
        document.getElementById(
            "action"
        );

    if (
        speedDisplay
    ) {

        speedDisplay.textContent =
            Math.round(
                Math.abs(speed) *
                24
            ) +
            " km/h";

    }

    if (
        cashDisplay
    ) {

        cashDisplay.textContent =
            "$" +
            gameSave.cash.toLocaleString();

    }

    if (
        levelDisplay
    ) {

        levelDisplay.textContent =
            "LEVEL " +
            gameSave.level;

    }

    if (
        modeDisplay
    ) {

        modeDisplay.textContent =
            selectedMode ===
                "career"
                ? "CAREER"
                : "FREE DRIVE";

    }

    if (
        actionDisplay
    ) {

        if (
            !gameStarted
        ) {

            actionDisplay.textContent =
                "E";

        } else if (
            isDriving
        ) {

            actionDisplay.textContent =
                "EXIT";

        } else if (
            isNearCar()
        ) {

            actionDisplay.textContent =
                "CAR";

        } else {

            actionDisplay.textContent =
                "CAR";

        }

    }

}

// ============================================================
// MOBILE WALKING UI VISIBILITY
// ============================================================

function updateMobileWalkingUI() {

    const joystick =
        document.getElementById(
            "mobileJoystick"
        );

    const mobileActionButton =
        document.getElementById(
            "mobileAction"
        );

    const mobileCameraButton =
        document.getElementById(
            "mobileCamera"
        );

    if (
        joystick
    ) {

        joystick.classList.toggle(
            "is-visible",
            gameStarted &&
                !isDriving
        );

    }

    if (
        mobileActionButton
    ) {

        mobileActionButton.classList.toggle(
            "is-visible",
            gameStarted
        );

        mobileActionButton.textContent =
            isDriving
                ? "EXIT"
                : isNearCar()
                    ? "GET IN"
                    : "CAR";

    }

    if (
        mobileCameraButton
    ) {

        mobileCameraButton.classList.toggle(
            "is-visible",
            gameStarted
        );

    }

    if (
        !isDriving &&
        !joystickActive
    ) {

        // Keep joystick centered
        // whenever it is not being used.

        joystickX = 0;
        joystickY = 0;

        if (
            mobileJoystickKnob
        ) {

            mobileJoystickKnob.style.transform =
                "translate(-50%, -50%)";

        }

    }

}

// ============================================================
// FOOT / CAR INTERACTION PROMPT
// ============================================================

function updateInteractionPrompt() {

    if (
        !interactionPrompt
    ) {

        return;

    }

    if (
        !gameStarted
    ) {

        interactionPrompt.textContent =
            "";

        interactionPrompt.classList.remove(
            "is-visible"
        );

        return;

    }

    if (
        isDriving
    ) {

        interactionPrompt.textContent =
            "Press E or EXIT to leave the car.";

        interactionPrompt.classList.add(
            "is-visible"
        );

        return;

    }

    if (
        isNearCar()
    ) {

        interactionPrompt.textContent =
            "Press E or GET IN to enter your car.";

        interactionPrompt.classList.add(
            "is-visible"
        );

    } else {

        interactionPrompt.textContent =
            "Use the joystick to explore.";

        interactionPrompt.classList.add(
            "is-visible"
        );

    }

}

// ============================================================
// GAME LOOP
// ============================================================

let previousTime =
    performance.now();

function animate(
    currentTime
) {

    requestAnimationFrame(
        animate
    );

    let delta =
        (
            currentTime -
            previousTime
        ) /
        1000;

    previousTime =
        currentTime;

    // Prevent huge jumps after
    // the browser was paused.

    delta =
        Math.min(
            delta,
            0.05
        );

    updateDriving(
        delta
    );

    updateOnFoot(
        delta
    );

    updateProgression(
        delta
    );

    updateCheckpointVisual(
        delta
    );

    updateCamera(
        delta
    );

    updateHUD();

    updateMobileWalkingUI();

    updateInteractionPrompt();

    updateNotification();

    renderer.render(
        scene,
        camera
    );

}

requestAnimationFrame(
    animate
);

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
// FINAL V12 WORLD INITIALIZATION
// ============================================================

updateInfiniteRoad(
    playerCar.position.z
);

updateDynamicScenery(
    playerCar.position.z
);

applySelectedCar();

console.log(
    "CARS 13 V12 — driving, camera and infinite world systems ready."
);
