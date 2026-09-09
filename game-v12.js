// ============================================================
// CARS 13 — V12
// ============================================================
// Combined V12 city world
// Infinite road, city districts, airport, river, lake,
// stores, industrial area, residential area and skyline.
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x8fc9f2);

scene.fog = new THREE.Fog(
    0x8fc9f2,
    700,
    5000
);

// ============================================================
// CAMERA
// ============================================================

const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    200000
);

camera.position.set(
    0,
    5,
    12
);

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
    Math.min(
        window.devicePixelRatio,
        2
    )
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

const sun =
    new THREE.DirectionalLight(
        0xffffff,
        1.5
    );

sun.position.set(
    -200,
    500,
    200
);

sun.castShadow = true;

sun.shadow.mapSize.width =
    2048;

sun.shadow.mapSize.height =
    2048;

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

const ground =
    new THREE.Mesh(
        new THREE.PlaneGeometry(
            200000,
            200000
        ),
        new THREE.MeshStandardMaterial({
            color: 0x3d7d38,
            roughness: 1
        })
    );

ground.rotation.x =
    -Math.PI / 2;

ground.position.y =
    -0.08;

ground.receiveShadow = true;

scene.add(ground);

function updateInfiniteGround(
    playerZ
) {

    ground.position.z =
        Math.round(
            playerZ / 1000
        ) * 1000;
}

// ============================================================
// V12 ROAD SYSTEM
// ============================================================

const ROAD_WIDTH = 18;

const ROAD_SEGMENT_LENGTH =
    300;

const SECONDARY_ROAD_OFFSET =
    82;

const SECONDARY_ROAD_WIDTH =
    12;

const ROAD_START =
    2200;

const ROAD_END =
    -14000;

// ============================================================
// MAIN ROAD PATH
// ============================================================

function roadX(z) {

    return (
        Math.sin(
            z * 0.00145
        ) * 95 +

        Math.sin(
            z * 0.0032 + 1.1
        ) * 38 +

        Math.sin(
            z * 0.007
        ) * 12
    );
}

// ============================================================
// ROAD DIRECTION
// ============================================================

function roadDirection(z) {

    const sample = 3;

    return Math.atan2(
        roadX(z + sample) -
        roadX(z - sample),

        sample * 2
    );
}

// ============================================================
// SECONDARY ROAD
// ============================================================

function secondaryRoadX(z) {

    return (
        roadX(z) +
        SECONDARY_ROAD_OFFSET +
        Math.sin(
            z * 0.0027
        ) * 16
    );
}

// ============================================================
// GENERIC PATH DIRECTION
// ============================================================

function pathDirection(
    path,
    z
) {

    const sample = 3;

    return Math.atan2(
        path(z + sample) -
        path(z - sample),

        sample * 2
    );
}

// ============================================================
// V12 ROAD GROUPS
// ============================================================

const roadGroup =
    new THREE.Group();

const secondaryRoadGroup =
    new THREE.Group();

const roadEdgesGroup =
    new THREE.Group();

const centerLineGroup =
    new THREE.Group();

scene.add(
    roadGroup
);

scene.add(
    secondaryRoadGroup
);

scene.add(
    roadEdgesGroup
);

scene.add(
    centerLineGroup
);

// ============================================================
// V12 ROAD MATERIALS
// ============================================================

const v12RoadMaterial =
    new THREE.MeshBasicMaterial({
        color: 0x292929
    });

const v12EdgeMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffffff
    });

const v12CenterMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffe27a
    });

const v12SecondaryMaterial =
    new THREE.MeshBasicMaterial({
        color: 0x343434
    });

const v12SecondaryEdgeMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffd36a
    });

// ============================================================
// V12 ROAD RANGE
// ============================================================

const V12_ROAD_HALF_LENGTH =
    6000;

let v12RoadCenterZ =
    Infinity;

// ============================================================
// BUILD V12 ROAD MESH
// ============================================================

function buildV12RoadMesh(
    startZ,
    endZ,
    path,
    width,
    material,
    y = 0.24
) {

    const vertices = [];

    const indices = [];

    const steps =
        Math.max(
            1,
            Math.ceil(
                Math.abs(
                    endZ - startZ
                ) / 8
            )
        );

    for (
        let i = 0;
        i <= steps;
        i++
    ) {

        const z =
            startZ +
            (
                i / steps
            ) *
            (
                endZ -
                startZ
            );

        const x =
            path(z);

        const angle =
            pathDirection(
                path,
                z
            );

        const nx =
            Math.cos(angle);

        const nz =
            Math.sin(angle);

        const half =
            width / 2;

        vertices.push(

            x -
                nx * half,

            y,

            z -
                nz * half,

            x +
                nx * half,

            y,

            z +
                nz * half
        );
    }

    for (
        let i = 0;
        i < steps;
        i++
    ) {

        const a =
            i * 2;

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

    geometry.setIndex(
        indices
    );

    geometry.computeVertexNormals();

    const mesh =
        new THREE.Mesh(
            geometry,
            material
        );

    mesh.receiveShadow =
        false;

    return mesh;
}

// ============================================================
// BUILD ROAD LINE
// ============================================================

function buildV12RoadLine(
    startZ,
    endZ,
    path,
    offset,
    width,
    material,
    y
) {

    const vertices = [];

    const indices = [];

    const steps =
        Math.max(
            1,
            Math.ceil(
                Math.abs(
                    endZ - startZ
                ) / 10
            )
        );

    for (
        let i = 0;
        i <= steps;
        i++
    ) {

        const z =
            startZ +
            (
                i / steps
            ) *
            (
                endZ -
                startZ
            );

        const x =
            path(z);

        const angle =
            pathDirection(
                path,
                z
            );

        const nx =
            Math.cos(angle);

        const nz =
            Math.sin(angle);

        const centerX =
            x +
            nx * offset;

        const centerZ =
            z +
            nz * offset;

        const half =
            width / 2;

        vertices.push(

            centerX -
                nx * half,

            y,

            centerZ -
                nz * half,

            centerX +
                nx * half,

            y,

            centerZ +
                nz * half
        );
    }

    for (
        let i = 0;
        i < steps;
        i++
    ) {

        const a =
            i * 2;

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

    geometry.setIndex(
        indices
    );

    const mesh =
        new THREE.Mesh(
            geometry,
            material
        );

    mesh.renderOrder = 3;

    return mesh;
}

// ============================================================
// BUILD CENTER DASHES
// ============================================================

function buildV12Dashes(
    startZ,
    endZ,
    path,
    width = 0.22
) {

    const group =
        new THREE.Group();

    for (
        let z =
            Math.ceil(
                startZ / 70
            ) * 70;

        z < endZ;

        z += 70
    ) {

        const dash =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    width,
                    0.035,
                    28
                ),
                v12CenterMaterial
            );

        dash.position.set(
            path(z),
            0.31,
            z
        );

        dash.rotation.y =
            pathDirection(
                path,
                z
            );

        dash.renderOrder =
            4;

        group.add(
            dash
        );
    }

    return group;
}

// ============================================================
// REBUILD SINGLE ROAD
// ============================================================

function rebuildV12Road(
    playerZ,
    force = false
) {

    const newCenter =
        Math.round(
            playerZ / 600
        ) * 600;

    if (
        !force &&
        newCenter ===
        v12RoadCenterZ
    ) {
        return;
    }

    v12RoadCenterZ =
        newCenter;

    roadGroup.clear();

    secondaryRoadGroup.clear();

    roadEdgesGroup.clear();

    centerLineGroup.clear();

    const startZ =
        newCenter -
        V12_ROAD_HALF_LENGTH;

    const endZ =
        newCenter +
        V12_ROAD_HALF_LENGTH;

    // MAIN ROAD

    roadGroup.add(
        buildV12RoadMesh(
            startZ,
            endZ,
            roadX,
            ROAD_WIDTH,
            v12RoadMaterial
        )
    );

    // SECONDARY ROAD

    secondaryRoadGroup.add(
        buildV12RoadMesh(
            startZ,
            endZ,
            secondaryRoadX,
            SECONDARY_ROAD_WIDTH,
            v12SecondaryMaterial
        )
    );

    // MAIN ROAD EDGES

    roadEdgesGroup.add(

        buildV12RoadLine(
            startZ,
            endZ,
            roadX,
            -ROAD_WIDTH / 2 +
                0.15,
            0.24,
            v12EdgeMaterial,
            0.285
        ),

        buildV12RoadLine(
            startZ,
            endZ,
            roadX,
            ROAD_WIDTH / 2 -
                0.15,
            0.24,
            v12EdgeMaterial,
            0.285
        ),

        // SECONDARY ROAD EDGES

        buildV12RoadLine(
            startZ,
            endZ,
            secondaryRoadX,
            -SECONDARY_ROAD_WIDTH / 2 +
                0.15,
            0.22,
            v12SecondaryEdgeMaterial,
            0.285
        ),

        buildV12RoadLine(
            startZ,
            endZ,
            secondaryRoadX,
            SECONDARY_ROAD_WIDTH / 2 -
                0.15,
            0.22,
            v12SecondaryEdgeMaterial,
            0.285
        )
    );

    // CENTER LINES

    centerLineGroup.add(
        buildV12Dashes(
            startZ,
            endZ,
            roadX
        )
    );

    centerLineGroup.add(
        buildV12Dashes(
            startZ,
            endZ,
            secondaryRoadX,
            0.18
        )
    );
}

// ============================================================
// INITIAL ROAD
// ============================================================

rebuildV12Road(
    0,
    true
);

// ============================================================
// V11 ROAD COMPATIBILITY
// ============================================================

function createRoadSegment() {
    return null;
}

function createRoadStrip() {
    return null;
}

function createCenterDashes() {
    return [];
}

function createSecondaryRoadChunk() {
    return null;
}

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

    mountain.castShadow =
        true;

    scene.add(
        mountain
    );
}

const mountainsGroup =
    new THREE.Group();

const renderedMountainSegments =
    new Map();

const MOUNTAIN_SEED =
    42;

function createMountainsForSegment(
    startZ,
    endZ
) {

    for (
        let z =
            Math.ceil(
                startZ / 450
            ) * 450;

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

        const scaleL =
            0.8 +
            (
                randomL -
                Math.floor(randomL)
            ) *
            0.6;

        const scaleR =
            0.8 +
            (
                randomR -
                Math.floor(randomR)
            ) *
            0.6;

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
            250 * scaleL,
            z
        );

        mountain1.scale.setScalar(
            scaleL
        );

        mountain1.castShadow =
            true;

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
            250 * scaleR,
            z
        );

        mountain2.scale.setScalar(
            scaleR
        );

        mountain2.castShadow =
            true;

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

    trunk.position.y =
        3.5;

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

        layer.castShadow =
            true;

        leaves.add(
            layer
        );
    }

    trunk.castShadow =
        true;

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
// TREES — DYNAMIC
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
            Math.ceil(
                startZ / 85
            ) * 85;

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

        const valueL =
            randomL -
            Math.floor(
                randomL
            );

        const valueR =
            randomR -
            Math.floor(
                randomR
            );

        createTree(
            center -
                45 -
                valueL * 50,

            z +
                valueL * 30,

            0.7 +
                valueL * 0.6,

            treesGroup
        );

        createTree(
            center +
                45 +
                valueR * 50,

            z +
                valueR * 30,

            0.7 +
                valueR * 0.6,

            treesGroup
        );
    }
}

// ============================================================
// INITIAL TREES
// ============================================================

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

    building.castShadow =
        true;

    building.receiveShadow =
        true;

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

    roof.castShadow =
        true;

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
            Math.ceil(
                startZ / 330
            ) * 330;

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
                    Math.abs(
                        z % 90
                    )
                ),

            z + 28,

            11 +
                Math.abs(
                    z % 8
                ),

            9 +
                Math.abs(
                    z % 10
                ),

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
                Math.abs(
                    z % 9
                ),

            13 +
                Math.abs(
                    z % 16
                ),

            15,

            0x78909c
        );
    }
}

// ============================================================
// INITIAL BUILDINGS
// ============================================================

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
// V12 CITY MAP
// ============================================================

const v12CityGroup =
    new THREE.Group();

scene.add(
    v12CityGroup
);

function v12Box(
    x,
    y,
    z,
    w,
    h,
    d,
    color,
    parent = v12CityGroup
) {

    const mesh =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                w,
                h,
                d
            ),
            new THREE.MeshStandardMaterial({
                color,
                roughness: 0.82
            })
        );

    mesh.position.set(
        x,
        y + h / 2,
        z
    );

    mesh.castShadow =
        true;

    mesh.receiveShadow =
        true;

    parent.add(
        mesh
    );

    return mesh;
}

function v12Tower(
    x,
    z,
    w,
    h,
    color
) {

    v12Box(
        x,
        0,
        z,
        w,
        h,
        w,
        color
    );

    v12Box(
        x,
        h,
        z,
        w * 0.82,
        1.5,
        w * 0.82,
        0x202a31
    );
}

function v12Label(
    text,
    x,
    y,
    z,
    size = 3
) {

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width =
        512;

    canvas.height =
        128;

    const ctx =
        canvas.getContext(
            "2d"
        );

    ctx.fillStyle =
        "rgba(20,25,30,0.86)";

    ctx.fillRect(
        0,
        0,
        512,
        128
    );

    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "bold 54px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.fillText(
        text,
        256,
        64
    );

    const texture =
        new THREE.CanvasTexture(
            canvas
        );

    const sprite =
        new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: texture,
                transparent: true
            })
        );

    sprite.position.set(
        x,
        y,
        z
    );

    sprite.scale.set(
        size * 3.5,
        size,
        1
    );

    v12CityGroup.add(
        sprite
    );

    return sprite;
}

function v12SideStreet(
    z,
    side,
    length = 180,
    width = 10
) {

    const center =
        roadX(z);

    const start =
        center +
        side *
        (
            ROAD_WIDTH / 2 +
            0.2
        );

    const street =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                length,
                0.08,
                width
            ),
            v12RoadMaterial
        );

    street.position.set(
        start +
            side *
            length / 2,

        0.24,

        z
    );

    v12CityGroup.add(
        street
    );
}

// ============================================================
// DOWNTOWN
// ============================================================

for (
    let i = 0;
    i < 18;
    i++
) {

    const z =
        -1050 -
        i * 105;

    const c =
        roadX(z);

    const side =
        i % 2
            ? 1
            : -1;

    v12Tower(
        c +
            side *
            (
                45 +
                (i % 3) * 18
            ),

        z,

        24 +
            (i % 4) * 5,

        55 +
            (i % 6) * 16,

        [
            0x607d8b,
            0x78909c,
            0x455a64,
            0x8d99ae
        ][i % 4]
    );

    v12Box(
        c -
            side * 105,

        0,

        z + 32,

        28,

        30 +
            (i % 4) * 7,

        24,

        0x9eaaaf
    );

    v12SideStreet(
        z,
        side,
        150
    );
}

v12Label(
    "DOWNTOWN",
    roadX(-1600),
    55,
    -1600,
    4
);

// ============================================================
// BUSINESS DISTRICT
// ============================================================

for (
    let i = 0;
    i < 16;
    i++
) {

    const z =
        -2200 -
        i * 110;

    const c =
        roadX(z);

    const side =
        i % 2
            ? 1
            : -1;

    v12Box(
        c +
            side * 62,

        0,

        z,

        34,

        28 +
            (i % 5) * 8,

        38,

        0x546e7a
    );

    v12Box(
        c -
            side * 88,

        0,

        z + 35,

        30,

        22 +
            (i % 4) * 6,

        34,

        0x90a4ae
    );

    v12SideStreet(
        z,
        side,
        190
    );
}

v12Label(
    "BUSINESS DISTRICT",
    roadX(-2850),
    42,
    -2850,
    3.2
);

// ============================================================
// SHOPPING DISTRICT
// ============================================================

for (
    let i = 0;
    i < 12;
    i++
) {

    const z =
        -3300 -
        i * 75;

    const c =
        roadX(z);

    const side =
        i % 2
            ? 1
            : -1;

    const store =
        v12Box(
            c +
                side * 58,

            0,

            z,

            44,

            8 +
                (i % 3) * 2,

            30,

            [
                0x8e44ad,
                0x1976d2,
                0xd35400,
                0x00897b
            ][i % 4]
        );

    store.userData.v12Store =
        true;

    store.userData.storeName =
        "CITY STORE";

    v12SideStreet(
        z,
        side,
        130
    );
}

v12Label(
    "SHOPPING",
    roadX(-3750) + 70,
    20,
    -3750,
    3.5
);

// ============================================================
// RESIDENTIAL DISTRICT
// ============================================================

for (
    let i = 0;
    i < 28;
    i++
) {

    const z =
        -4200 -
        Math.floor(
            i / 2
        ) *
        105;

    const c =
        roadX(z);

    const side =
        i % 2
            ? 1
            : -1;

    const x =
        c +
        side *
        (
            58 +
            (i % 4) * 24
        );

    const h =
        8 +
        (i % 3) * 3;

    v12Box(
        x,
        0,
        z +
            (i % 3) * 18,

        20,
        h,
        18,

        [
            0xc8a27a,
            0x90a4ae,
            0xa5b68d,
            0xb07d62
        ][i % 4]
    );

    v12Box(
        x,
        h,
        z +
            (i % 3) * 18,

        17,
        3,
        15,

        0x5d4037
    );
}

v12Label(
    "RESIDENTIAL",
    roadX(-5150),
    18,
    -5150,
    3.5
);

// ============================================================
// PARK
// ============================================================

const v12Park =
    new THREE.Mesh(
        new THREE.CircleGeometry(
            235,
            48
        ),
        new THREE.MeshStandardMaterial({
            color: 0x4f914b,
            roughness: 1
        })
    );

v12Park.rotation.x =
    -Math.PI / 2;

v12Park.position.set(
    roadX(-4050) + 250,
    -0.045,
    -4050
);

v12CityGroup.add(
    v12Park
);

// ============================================================
// V12 LAKE
// ============================================================

const v12Lake =
    new THREE.Mesh(
        new THREE.CircleGeometry(
            145,
            48
        ),
        new THREE.MeshStandardMaterial({
            color: 0x2b91cf,
            roughness: 0.2,
            metalness: 0.1
        })
    );

v12Lake.rotation.x =
    -Math.PI / 2;

v12Lake.position.set(
    roadX(-4050) + 250,
    0,
    -4050
);

v12CityGroup.add(
    v12Lake
);

// ============================================================
// LAKE TREES
// ============================================================

for (
    let i = 0;
    i < 22;
    i++
) {

    const a =
        i /
        22 *
        Math.PI *
        2;

    createTree(
        roadX(-4050) +
            250 +
            Math.cos(a) *
            190,

        -4050 +
            Math.sin(a) *
            190,

        0.65 +
            (i % 3) *
            0.15,

        v12CityGroup
    );
}

v12Label(
    "CITY PARK",
    roadX(-4050) + 250,
    12,
    -4050,
    2.8
);

// ============================================================
// RIVER
// ============================================================

const v12River =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            3000,
            0.16,
            62
        ),
        new THREE.MeshStandardMaterial({
            color: 0x2389bd,
            roughness: 0.18,
            metalness: 0.08
        })
    );

v12River.position.set(
    0,
    -0.005,
    -6100
);

v12CityGroup.add(
    v12River
);

// ============================================================
// RIVER BRIDGE
// ============================================================

const bridgeX =
    roadX(-6100);

const bridge =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            ROAD_WIDTH + 8,
            0.18,
            82
        ),
        new THREE.MeshStandardMaterial({
            color: 0x777b80,
            roughness: 0.75
        })
    );

bridge.position.set(
    bridgeX,
    0.42,
    -6100
);

bridge.rotation.y =
    roadDirection(-6100);

v12CityGroup.add(
    bridge
);

// ============================================================
// BRIDGE RAILS
// ============================================================

for (
    const side of [
        -1,
        1
    ]
) {

    const rail =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.35,
                1.2,
                82
            ),
            new THREE.MeshStandardMaterial({
                color: 0x30353a,
                roughness: 0.65
            })
        );

    rail.position.set(
        bridgeX +
            side *
            (
                ROAD_WIDTH / 2 +
                3.5
            ),

        1.1,

        -6100
    );

    rail.rotation.y =
        roadDirection(
            -6100
        );

    v12CityGroup.add(
        rail
    );
}

v12Label(
    "RIVER",
    bridgeX + 20,
    8,
    -6100,
    2.5
);

// ============================================================
// INDUSTRIAL DISTRICT
// ============================================================

for (
    let i = 0;
    i < 18;
    i++
) {

    const z =
        -6750 -
        i * 125;

    const c =
        roadX(z);

    const side =
        i % 2
            ? 1
            : -1;

    v12Box(
        c +
            side * 75,

        0,

        z,

        62,

        12 +
            (i % 4) * 3,

        70,

        [
            0x6d7275,
            0x7b6d5d,
            0x59666b
        ][i % 3]
    );

    const tank =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                7,
                7,
                15,
                16
            ),
            new THREE.MeshStandardMaterial({
                color: 0x9aa0a3,
                roughness: 0.6,
                metalness: 0.25
            })
        );

    tank.position.set(
        c +
            side * 125,

        7.5,

        z + 25
    );

    v12CityGroup.add(
        tank
    );

    v12SideStreet(
        z,
        side,
        220
    );
}

v12Label(
    "INDUSTRIAL",
    roadX(-7600) + 80,
    25,
    -7600,
    3.5
);

// ============================================================
// AIRPORT
// ============================================================

const airportX =
    roadX(-9300) + 430;

// ============================================================
// AIRPORT TERMINAL
// ============================================================

v12Box(
    airportX,
    0,
    -9000,
    300,
    4,
    120,
    0xb0b6bb
);

v12Box(
    airportX,
    4,
    -9000,
    180,
    14,
    65,
    0x607d8b
);

v12Box(
    airportX,
    18,
    -9000,
    145,
    5,
    45,
    0x263238
);

v12Label(
    "CITY AIRPORT",
    airportX,
    34,
    -9000,
    4
);

// ============================================================
// AIRPORT CONTROL TOWER
// ============================================================

v12Box(
    airportX + 135,
    0,
    -9060,
    18,
    42,
    18,
    0x8d99a6
);

v12Box(
    airportX + 135,
    42,
    -9060,
    24,
    8,
    24,
    0x263238
);

// ============================================================
// AIRPORT APRON
// ============================================================

v12Box(
    airportX,
    0,
    -9180,
    360,
    0.18,
    180,
    0x555a5f
);

// ============================================================
// AIRPORT RUNWAYS
// ============================================================

for (
    const rz of [
        -9700,
        -10800
    ]
) {

    v12Box(
        airportX + 210,
        0,
        rz,
        1200,
        0.10,
        70,
        0x383b3e
    );

    for (
        let x =
            airportX - 340;

        x <
            airportX + 780;

        x += 70
    ) {

        const mark =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    30,
                    0.035,
                    2.2
                ),
                new THREE.MeshBasicMaterial({
                    color: 0xffffff
                })
            );

        mark.position.set(
            x,
            0.16,
            rz
        );

        v12CityGroup.add(
            mark
        );
    }
}

// ============================================================
// AIRPORT TAXIWAY
// ============================================================

v12Box(
    airportX + 210,
    0,
    -10250,
    900,
    0.12,
    18,
    0x4b4f53
);

// ============================================================
// AIRPORT HANGARS
// ============================================================

for (
    let i = 0;
    i < 6;
    i++
) {

    v12Box(
        airportX -
            130 +
            i * 55,

        0,

        -10400,

        45,
        16,
        65,

        0x7b858b
    );
}

// ============================================================
// AIRPORT PARKING
// ============================================================

v12Box(
    airportX,
    0,
    -8750,
    310,
    0.08,
    110,
    0x4d5257
);

// ============================================================
// AIRPORT PARKING LINES
// ============================================================

for (
    let x =
        airportX - 140;

    x <
        airportX + 150;

    x += 18
) {

    const parkingLine =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.12,
                0.025,
                24
            ),
            new THREE.MeshBasicMaterial({
                color: 0xffffff
            })
        );

    parkingLine.position.set(
        x,
        0.14,
        -8750
    );

    v12CityGroup.add(
        parkingLine
    );
}

v12Label(
    "AIRPORT",
    airportX,
    25,
    -10450,
    3.8
);

// ============================================================
// AIRPORT APPROACH ROAD
// ============================================================

const airportApproach =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            11,
            0.08,
            650
        ),
        v12RoadMaterial
    );

airportApproach.position.set(
    airportX - 185,
    0.24,
    -8900
);

v12CityGroup.add(
    airportApproach
);

// ============================================================
// CITY CONNECTOR STREETS
// ============================================================

for (
    const z of [
        -1850,
        -3050,
        -3950,
        -5400,
        -6500,
        -8200
    ]
) {

    v12SideStreet(
        z,
        -1,
        250
    );

    v12SideStreet(
        z,
        1,
        250
    );
}

// ============================================================
// EXTRA SKYLINE LANDMARKS
// ============================================================

v12Tower(
    roadX(-1350) + 125,
    -1350,
    32,
    105,
    0x37474f
);

v12Tower(
    roadX(-1750) - 130,
    -1750,
    28,
    125,
    0x455a64
);

v12Tower(
    roadX(-2450) + 145,
    -2450,
    36,
    95,
    0x607d8b
);

// ============================================================
// V12 DYNAMIC WORLD UPDATE
// ============================================================

let generatedMinZ =
    ROAD_END - 600;

let generatedMaxZ =
    ROAD_START + 600;

const GENERATION_DISTANCE =
    1800;

const v12GeneratedScenery =
    new Set();

function generateSceneryChunk(
    startZ,
    endZ
) {

    const key =
        Math.round(
            startZ /
            ROAD_SEGMENT_LENGTH
        );

    if (
        v12GeneratedScenery.has(
            key
        )
    ) {
        return;
    }

    v12GeneratedScenery.add(
        key
    );

    createTreesForSegment(
        startZ,
        endZ
    );

    createBuildingsForSegment(
        startZ,
        endZ
    );
}

function updateDynamicScenery(
    playerZ
) {

    rebuildV12Road(
        playerZ
    );

    while (
        playerZ <
        generatedMinZ +
        GENERATION_DISTANCE
    ) {

        const newMinZ =
            generatedMinZ -
            ROAD_SEGMENT_LENGTH *
            4;

        generateSceneryChunk(
            newMinZ,
            generatedMinZ
        );

        generatedMinZ =
            newMinZ;
    }

    while (
        playerZ >
        generatedMaxZ -
        GENERATION_DISTANCE
    ) {

        const newMaxZ =
            generatedMaxZ +
            ROAD_SEGMENT_LENGTH *
            4;

        generateSceneryChunk(
            generatedMaxZ,
            newMaxZ
        );

        generatedMaxZ =
            newMaxZ;
    }
          }
// ============================================================
// CARS 13 — V12
// PLAYER CAR
// ============================================================

const playerCar =
    new THREE.Group();

// ============================================================
// CAR MATERIALS
// ============================================================

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
// MAIN CAR BODY
// ============================================================

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

// ============================================================
// LOWER BODY
// ============================================================

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

// ============================================================
// FRONT HOOD
// ============================================================

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

// ============================================================
// HOOD CENTER
// ============================================================

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

playerCar.add(
    hoodCenter
);

// ============================================================
// CABIN
// ============================================================

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

// ============================================================
// ROOF
// ============================================================

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

// ============================================================
// FRONT PILLARS
// ============================================================

for (
    const x of [
        -1.58,
        1.58
    ]
) {

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

    playerCar.add(
        pillar
    );
}

// ============================================================
// SIDE SKIRTS
// ============================================================

for (
    const x of [
        -2.32,
        2.32
    ]
) {

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

    sideSkirt.castShadow =
        true;

    playerCar.add(
        sideSkirt
    );
}

// ============================================================
// FRONT BUMPER
// ============================================================

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

playerCar.add(
    frontBumper
);

// ============================================================
// FRONT LIP
// ============================================================

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

playerCar.add(
    frontLip
);

// ============================================================
// REAR BUMPER
// ============================================================

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

playerCar.add(
    rearBumper
);

// ============================================================
// REAR DIFFUSER
// ============================================================

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

playerCar.add(
    rearDiffuser
);

// ============================================================
// REAR DECK
// ============================================================

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

playerCar.add(
    rearDeck
);

// ============================================================
// REAR SPOILER
// ============================================================

const spoiler =
    new THREE.Group();

const spoilerWing =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            4.1,
            0.18,
            0.45
        ),
        blackMaterial
    );

spoilerWing.position.set(
    0,
    2.05,
    3.65
);

spoiler.add(
    spoilerWing
);

for (
    const x of [
        -1.45,
        1.45
    ]
) {

    const spoilerSupport =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.18,
                0.72,
                0.18
            ),
            blackMaterial
        );

    spoilerSupport.position.set(
        x,
        1.72,
        3.55
    );

    spoiler.add(
        spoilerSupport
    );
}

playerCar.add(
    spoiler
);

// ============================================================
// HEADLIGHTS
// ============================================================

for (
    const x of [
        -1.42,
        1.42
    ]
) {

    const light =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.95,
                0.34,
                0.18
            ),
            headlightMaterial
        );

    light.position.set(
        x,
        1.28,
        -4.12
    );

    playerCar.add(
        light
    );
}

// ============================================================
// TAILLIGHTS
// ============================================================

for (
    const x of [
        -1.42,
        1.42
    ]
) {

    const light =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.95,
                0.34,
                0.18
            ),
            taillightMaterial
        );

    light.position.set(
        x,
        1.25,
        4.12
    );

    playerCar.add(
        light
    );
}

// ============================================================
// FRONT GRILLE
// ============================================================

const grille =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            1.65,
            0.48,
            0.08
        ),
        blackMaterial
    );

grille.position.set(
    0,
    0.96,
    -4.27
);

playerCar.add(
    grille
);

// ============================================================
// MIRRORS
// ============================================================

for (
    const x of [
        -2.02,
        2.02
    ]
) {

    const mirror =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.42,
                0.24,
                0.65
            ),
            blackMaterial
        );

    mirror.position.set(
        x,
        2.05,
        -0.9
    );

    playerCar.add(
        mirror
    );
}

// ============================================================
// WHEELS
// ============================================================

const wheelGroups = [];

function createWheel(
    x,
    z
) {

    const wheelGroup =
        new THREE.Group();

    const tire =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                1.08,
                1.08,
                0.55,
                24
            ),
            blackMaterial
        );

    tire.rotation.z =
        Math.PI / 2;

    wheelGroup.add(
        tire
    );

    const rim =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.58,
                0.58,
                0.58,
                16
            ),
            new THREE.MeshStandardMaterial({
                color: 0xb7bdc2,
                metalness: 0.75,
                roughness: 0.25
            })
        );

    rim.rotation.z =
        Math.PI / 2;

    wheelGroup.add(
        rim
    );

    wheelGroup.position.set(
        x,
        0.83,
        z
    );

    playerCar.add(
        wheelGroup
    );

    wheelGroups.push(
        wheelGroup
    );

    return wheelGroup;
}

createWheel(
    -2.32,
    -2.55
);

createWheel(
    2.32,
    -2.55
);

createWheel(
    -2.32,
    2.55
);

createWheel(
    2.32,
    2.55
);

// ============================================================
// CAR POSITION
// ============================================================

playerCar.position.set(
    roadX(0),
    0,
    0
);

playerCar.rotation.y =
    roadDirection(0);

scene.add(
    playerCar
);

// ============================================================
// CAR LIGHTS
// ============================================================

const leftHeadlight =
    new THREE.PointLight(
        0xffffcc,
        1.2,
        35
    );

leftHeadlight.position.set(
    -1.35,
    1.35,
    -4.3
);

playerCar.add(
    leftHeadlight
);

const rightHeadlight =
    new THREE.PointLight(
        0xffffcc,
        1.2,
        35
    );

rightHeadlight.position.set(
    1.35,
    1.35,
    -4.3
);

playerCar.add(
    rightHeadlight
);

// ============================================================
// PLAYER CHARACTER
// ============================================================

const playerCharacter =
    new THREE.Group();

const characterBody =
    new THREE.Mesh(
        new THREE.CapsuleGeometry(
            0.48,
            1.2,
            8,
            12
        ),
        new THREE.MeshStandardMaterial({
            color: 0x315b8a,
            roughness: 0.8
        })
    );

characterBody.position.y =
    1.25;

characterBody.castShadow =
    true;

playerCharacter.add(
    characterBody
);

const characterHead =
    new THREE.Mesh(
        new THREE.SphereGeometry(
            0.38,
            16,
            12
        ),
        new THREE.MeshStandardMaterial({
            color: 0xd29b72,
            roughness: 0.9
        })
    );

characterHead.position.y =
    2.35;

characterHead.castShadow =
    true;

playerCharacter.add(
    characterHead
);

playerCharacter.position.set(
    roadX(0),
    0,
    8
);

playerCharacter.visible =
    false;

scene.add(
    playerCharacter
);

// ============================================================
// GAME STATE
// ============================================================

let isDriving = true;

let speed = 0;

let heading =
    roadDirection(0);

let steering = 0;

let throttle = 0;

let brake = 0;

let handbrake = false;

// ============================================================
// DRIVING CONSTANTS
// ============================================================

const MAX_SPEED =
    2.4;

const REVERSE_SPEED =
    0.9;

const ACCELERATION =
    0.045;

const BRAKE_POWER =
    0.095;

const FRICTION =
    0.025;

const TURN_RATE =
    0.025;

const ROAD_LIMIT =
    ROAD_WIDTH * 0.42;

const ROAD_ASSIST =
    0.065;

// ============================================================
// INPUT STATE
// ============================================================

const keys = {};

window.addEventListener(
    "keydown",
    event => {

        keys[
            event.key.toLowerCase()
        ] = true;

        if (
            event.key ===
            " "
        ) {
            event.preventDefault();
        }
    }
);

window.addEventListener(
    "keyup",
    event => {

        keys[
            event.key.toLowerCase()
        ] = false;
    }
);

// ============================================================
// INPUT UPDATE
// ============================================================

function updateInput() {

    throttle =
        (
            keys["w"] ||
            keys["arrowup"]
        )
            ? 1
            : 0;

    brake =
        (
            keys["s"] ||
            keys["arrowdown"]
        )
            ? 1
            : 0;

    steering = 0;

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        steering -= 1;
    }

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        steering += 1;
    }

    handbrake =
        keys[" "]
            ? true
            : false;
}

// ============================================================
// ANGLE HELPER
// ============================================================

function lerpAngle(
    a,
    b,
    amount
) {

    let difference =
        b - a;

    while (
        difference > Math.PI
    ) {
        difference -=
            Math.PI * 2;
    }

    while (
        difference < -Math.PI
    ) {
        difference +=
            Math.PI * 2;
    }

    return (
        a +
        difference *
        amount
    );
}

// ============================================================
// V12 DRIVING UPDATE
// ============================================================

function updateDriving(
    delta
) {

    if (
        !isDriving
    ) {
        return;
    }

    const frameScale =
        Math.min(
            delta * 60,
            2
        );

    updateInput();

    // ACCELERATION

    if (
        throttle
    ) {

        speed +=
            ACCELERATION *
            frameScale;
    }

    // BRAKING

    if (
        brake
    ) {

        speed -=
            BRAKE_POWER *
            frameScale;
    }

    // NATURAL FRICTION

    if (
        !throttle &&
        !brake
    ) {

        if (
            speed > 0
        ) {

            speed =
                Math.max(
                    0,
                    speed -
                    FRICTION *
                    frameScale
                );

        } else if (
            speed < 0
        ) {

            speed =
                Math.min(
                    0,
                    speed +
                    FRICTION *
                    frameScale
                );
        }
    }

    // HANDBRAKE

    if (
        handbrake
    ) {

        speed *=
            Math.pow(
                0.92,
                frameScale
            );
    }

    speed =
        THREE.MathUtils.clamp(
            speed,
            -REVERSE_SPEED,
            MAX_SPEED
        );

    // STEERING

    const steeringStrength =
        Math.min(
            Math.abs(speed) /
                MAX_SPEED +
                0.15,
            1
        );

    heading +=
        -steering *
        speed *
        TURN_RATE *
        steeringStrength *
        frameScale;

    // ROAD FOLLOW ASSIST

    const roadHeading =
        roadDirection(
            playerCar.position.z
        );

    const roadAssist =
        ROAD_ASSIST *
        Math.min(
            Math.abs(speed) /
                MAX_SPEED +
                0.15,
            1
        );

    heading =
        lerpAngle(
            heading,
            roadHeading,
            roadAssist *
            frameScale
        );

    // MOVEMENT

    const forwardX =
        -Math.sin(
            heading
        );

    const forwardZ =
        -Math.cos(
            heading
        );

    const travel =
        speed *
        0.55 *
        frameScale;

    playerCar.position.x +=
        forwardX *
        travel;

    playerCar.position.z +=
        forwardZ *
        travel;

    // ROAD POSITION

    const roadCenter =
        roadX(
            playerCar.position.z
        );

    const roadOffset =
        playerCar.position.x -
        roadCenter;

    // KEEP CAR NEAR ROAD

    if (
        Math.abs(
            roadOffset
        ) >
        ROAD_LIMIT
    ) {

        playerCar.position.x =
            THREE.MathUtils.lerp(
                playerCar.position.x,
                roadCenter,
                0.035 *
                frameScale
            );
    }

    // CAR ROTATION

    playerCar.rotation.y =
        heading;

    // WHEEL ROTATION

    for (
        const wheel
        of wheelGroups
    ) {

        wheel.children[0]
            .rotation.x -=
            speed *
            0.65 *
            frameScale;
    }
}

// ============================================================
// EXIT / ENTER CAR
// ============================================================

function toggleDriving() {

    isDriving =
        !isDriving;

    if (
        isDriving
    ) {

        playerCharacter.visible =
            false;

        playerCar.visible =
            true;

        playerCar.position.x =
            roadX(
                playerCharacter.position.z
            );

        playerCar.position.z =
            playerCharacter.position.z;

        heading =
            roadDirection(
                playerCar.position.z
            );

        playerCar.rotation.y =
            heading;

    } else {

        playerCharacter.visible =
            true;

        playerCar.visible =
            false;

        playerCharacter.position.set(
            playerCar.position.x,
            0,
            playerCar.position.z + 7
        );
    }
}

window.addEventListener(
    "keydown",
    event => {

        if (
            event.key.toLowerCase() ===
            "e"
        ) {

            toggleDriving();
        }
    }
);

// ============================================================
// ON-FOOT MOVEMENT
// ============================================================

function updateOnFoot(
    delta
) {

    if (
        isDriving
    ) {
        return;
    }

    const moveSpeed =
        7 *
        delta;

    let forward = 0;

    let sideways = 0;

    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        forward += 1;
    }

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        forward -= 1;
    }

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        sideways -= 1;
    }

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        sideways += 1;
    }

    playerCharacter.position.z -=
        forward *
        moveSpeed;

    playerCharacter.position.x +=
        sideways *
        moveSpeed;

    playerCharacter.position.x =
        THREE.MathUtils.clamp(
            playerCharacter.position.x,
            -900,
            900
        );
}

// ============================================================
// CAMERA
// ============================================================

function updateCamera(
    delta
) {

    const target =
        isDriving
            ? playerCar
            : playerCharacter;

    const distance =
        isDriving
            ? 16
            : 9;

    const height =
        isDriving
            ? 7
            : 5;

    const targetX =
        target.position.x;

    const targetZ =
        target.position.z;

    const desiredX =
        targetX +
        Math.sin(
            target.rotation.y
        ) *
        distance;

    const desiredZ =
        targetZ +
        Math.cos(
            target.rotation.y
        ) *
        distance;

    camera.position.x =
        THREE.MathUtils.lerp(
            camera.position.x,
            desiredX,
            0.08
        );

    camera.position.y =
        THREE.MathUtils.lerp(
            camera.position.y,
            target.position.y +
                height,
            0.08
        );

    camera.position.z =
        THREE.MathUtils.lerp(
            camera.position.z,
            desiredZ,
            0.08
        );

    camera.lookAt(
        target.position.x,
        target.position.y +
            1.2,
        target.position.z
    );
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

    localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(gameSave)
    );

}

let selectedMode = "career";
let gameStarted = false;
let isDriving = true;
let checkpointZ = -360;
let activeCar = CAR_CATALOG[0];

function createDriver() {

    const driver = new THREE.Group();

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

    torso.position.y = 1.85;

    driver.add(torso);

    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.34,
                16,
                12
            ),
            skin
        );

    head.position.y = 2.76;

    driver.add(head);

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

        arm.name = "arm";

        driver.add(arm);

        const leg =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.24,
                    1.05,
                    0.24
                ),
                x < 0 ? clothes : shoes
            );

        leg.position.set(
            x,
            0.55,
            0
        );

        leg.name = "leg";

        driver.add(leg);

    }

    driver.traverse((part) => {

        if (part.isMesh) {
            part.castShadow = true;
        }

    });

    return driver;

}

const playerCharacter =
    createDriver();

playerCharacter.visible = false;

scene.add(playerCharacter);

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

checkpointRing.position.y = 5;
checkpointBase.position.y = 0.04;

checkpoint.add(
    checkpointRing,
    checkpointBase
);

checkpoint.visible = false;

scene.add(checkpoint);

function placeCheckpoint(z) {

    checkpointZ = z;

    checkpoint.position.set(
        roadX(checkpointZ),
        0,
        checkpointZ
    );

    checkpoint.rotation.y =
        roadDirection(checkpointZ);

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

const ROAD_LIMIT =
    ROAD_WIDTH * 0.42;

// ============================================================
// INPUT
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
        "arrowright"
    ]);
    }

    if (key === "e" && !event.repeat) {

        toggleVehicle();

    }

    keys[key] = true;

}

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

    button.setAttribute(
        "aria-pressed",
        "false"
    );

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
        (event) => {

            releasePointer(
                event.pointerId
            );

        }
    );

    button.addEventListener(
        "lostpointercapture",
        (event) => {

            releasePointer(
                event.pointerId
            );

        }
    );

}

setupButton("gas");
setupButton("brake");
setupButton("left");
setupButton("right");
setupButton("action");

// ============================================================
// V12 DYNAMIC WORLD UPDATE
// ============================================================

let generatedMinZ =
    ROAD_END - 600;

let generatedMaxZ =
    ROAD_START + 600;

const GENERATION_DISTANCE = 1800;

const v12GeneratedScenery =
    new Set();

function generateSceneryChunk(
    startZ,
    endZ
) {

    const key =
        Math.round(
            startZ / ROAD_SEGMENT_LENGTH
        );

    if (
        v12GeneratedScenery.has(key)
    ) {

        return;

    }

    v12GeneratedScenery.add(key);

    createTreesForSegment(
        startZ,
        endZ
    );

    createBuildingsForSegment(
        startZ,
        endZ
    );

}

function updateDynamicScenery(
    playerZ
) {

    rebuildV12Road(
        playerZ
    );

    while (
        playerZ <
        generatedMinZ +
        GENERATION_DISTANCE
    ) {

        const newMinZ =
            generatedMinZ -
            ROAD_SEGMENT_LENGTH * 4;

        generateSceneryChunk(
            newMinZ,
            generatedMinZ
        );

        generatedMinZ =
            newMinZ;

    }

    while (
        playerZ >
        generatedMaxZ -
        GENERATION_DISTANCE
    ) {

        const newMaxZ =
            generatedMaxZ +
            ROAD_SEGMENT_LENGTH * 4;

        generateSceneryChunk(
            generatedMaxZ,
            newMaxZ
        );

        generatedMaxZ =
            newMaxZ;

    }

}

// ============================================================
// DRIVING UPDATE
// ============================================================

function lerpAngle(
    from,
    to,
    amount
) {

    const difference =
        Math.atan2(
            Math.sin(to - from),
            Math.cos(to - from)
        );

    return (
        from +
        difference * amount
    );

}

function updateDriving(
    delta
) {

    if (
        !gameStarted ||
        !isDriving
    ) {

        speed =
            Math.max(
                0,
                speed -
                FRICTION * 2
            );

        steering =
            THREE.MathUtils.lerp(
                steering,
                0,
                0.15
            );

        return;

    }

    const frameScale =
        Math.min(
            delta * 60,
            2
        );

    const accelerating =
        isControlPressed("gas") ||
        keys["w"] ||
        keys["arrowup"];

    const braking =
        isControlPressed("brake") ||
        keys["s"] ||
        keys["arrowdown"];

    const steeringTarget =
        (
            isControlPressed("right") ||
            keys["d"] ||
            keys["arrowright"]
        ? 1
        : 0
        ) -
        (
            isControlPressed("left") ||
            keys["a"] ||
            keys["arrowleft"]
        ? 1
        : 0
        );

    if (accelerating) {

        speed +=
            ACCELERATION *
            frameScale;

    }

    if (braking) {

        speed -=
            BRAKING *
            frameScale;

    }

    if (
        !accelerating &&
        !braking
    ) {

        speed =
            Math.max(
                0,
                speed -
                FRICTION *
                frameScale
            );

    }

    speed =
        THREE.MathUtils.clamp(
            speed,
            0,
            MAX_SPEED
        );

    steering =
        THREE.MathUtils.lerp(
            steering,
            steeringTarget,
            1 -
            Math.exp(
                -10 * delta
            )
        );

    const roadHeading =
        roadDirection(
            playerCar.position.z
        );

    const roadAssist =
        1 -
        Math.exp(
            -1.1 * delta
        );

    heading +=
        -steering *
        speed *
        TURN_RATE *
        frameScale;

    heading =
        lerpAngle(
            heading,
            roadHeading,
            roadAssist
        );

    const forwardX =
        -Math.sin(
            heading
        );

    const forwardZ =
        -Math.cos(
            heading
        );

    const travel =
        speed *
        0.55 *
        frameScale;

    playerCar.position.x +=
        forwardX *
        travel;

    playerCar.position.z +=
        forwardZ *
        travel;

    const roadCenter =
        roadX(
            playerCar.position.z
        );

    const roadOffset =
        playerCar.position.x -
        roadCenter;

    if (
        Math.abs(roadOffset) >
        ROAD_LIMIT
    ) {

        playerCar.position.x =
            roadCenter +
            THREE.MathUtils.clamp(
                roadOffset,
                -ROAD_LIMIT,
                ROAD_LIMIT
            );

        heading =
            lerpAngle(
                heading,
                roadHeading,
                0.12
            );

        speed *= 0.985;

    }

    playerCar.rotation.y =
        heading;

    playerCar.rotation.z =
        steering * 0.045;

    for (
        const wheel of wheels
    ) {

        wheel.children[0].rotation.x +=
            speed *
            0.5 *
            frameScale;

    }

    for (
        const wheel of frontWheels
    ) {

        wheel.rotation.y =
            -steering *
            0.35;

    }

}

// ============================================================
// GAME MODES, GARAGE, AND EXPLORATION
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

let notificationText = "";

let notificationUntil = 0;

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

    carList.innerHTML = "";

    for (
        const car of CAR_CATALOG
    ) {

        const owned =
            gameSave.ownedCars
                .includes(car.id);

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
                .padStart(6, "0");

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

        if (selected) {

            button.textContent =
                "SELECTED";

            button.disabled =
                true;

        } else if (owned) {

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
                () => buyCar(car)
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

    careerModeButton.classList.toggle(
        "is-selected",
        selectedMode === "career"
    );

    freeModeButton.classList.toggle(
        "is-selected",
        selectedMode === "free"
    );

    startDriveButton.textContent =
        selectedMode === "career"
        ? "START CAREER"
        : "START FREE DRIVE";

    garageHint.textContent =
        "Cash: $" +
        gameSave.cash.toLocaleString() +
        " · Level " +
        gameSave.level;

}

function buyCar(car) {

    if (
        gameSave.ownedCars
            .includes(car.id) ||
        gameSave.cash < car.price
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

function startGame() {

    gameStarted = true;

    isDriving = true;

    playerCharacter.visible =
        false;

    speed = 0;

    applySelectedCar();

    garagePanel.classList.remove(
        "is-open"
    );

    checkpoint.visible =
        selectedMode === "career";

    if (
        selectedMode === "career"
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
            "Free Drive: explore the world at your own pace.",
            3400
        );

    }

}

function toggleGarage() {

    if (!gameStarted) return;

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

function isNearCar() {

    return (
        playerCharacter.position
            .distanceTo(
                playerCar.position
            ) < 8
    );

}

function exitVehicle() {

    speed = 0;

    isDriving = false;

    playerCharacter.visible =
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
        "You are on foot. Walk anywhere and return to your car to drive.",
        4000
    );

}

function enterVehicle() {

    isDriving = true;

    playerCharacter.visible =
        false;

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
        garagePanel.classList.contains(
            "is-open"
        )
    ) {

        return;

    }

    if (isDriving) {

        exitVehicle();

    } else if (isNearCar()) {

        enterVehicle();

    } else {

        announce(
            "Walk closer to your car to get in."
        );

    }

}

function updateOnFoot(delta) {

    if (
        !gameStarted ||
        isDriving
    ) {

        return;

    }

    const movement =
        new THREE.Vector2(
            (
                keys["d"] ||
                keys["arrowright"]
                ? 1
                : 0
            ) -
            (
                keys["a"] ||
                keys["arrowleft"]
                ? 1
                : 0
            ),

            (
                keys["s"] ||
                keys["arrowdown"]
                ? 1
                : 0
            ) -
            (
                keys["w"] ||
                keys["arrowup"]
                ? 1
                : 0
            )
        );

    if (
        movement.lengthSq() === 0
    ) {

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

    playerCharacter.rotation.y =
        Math.atan2(
            -movement.x,
            -movement.y
        );

    const stride =
        Math.sin(
            performance.now() *
            0.015
        ) *
        0.45;

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
    }

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

        gearElement.textContent =
            isDriving
                ? currentGear
                : "—";

    }

    if (modeElement) {

        modeElement.textContent =
            selectedMode === "career"
                ? "CAREER"
                : "FREE DRIVE";

    }

    if (levelElement) {

        levelElement.textContent =
            "LEVEL " +
            gameSave.level;

    }

    if (cashElement) {

        cashElement.textContent =
            "$" +
            gameSave.cash.toLocaleString();

    }

    drawMiniMap();

    if (actionButton) {

        actionButton.textContent =
            isDriving
                ? "EXIT"
                : (
                    isNearCar()
                        ? "ENTER"
                        : "CAR"
                );

    }

    if (
        performance.now() <
        notificationUntil
    ) {

        interactionPrompt.textContent =
            notificationText;

        interactionPrompt.classList.add(
            "is-visible"
        );

    } else if (
        gameStarted &&
        !isDriving
    ) {

        interactionPrompt.textContent =
            isNearCar()
                ? "Press E or ENTER to get back in your car"
                : "Explore on foot · return to your car to drive";

        interactionPrompt.classList.add(
            "is-visible"
        );

    } else {

        interactionPrompt.classList.remove(
            "is-visible"
        );

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

const clock =
    new THREE.Clock();

function animate() {

    requestAnimationFrame(
        animate
    );

    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );

    updateDriving(delta);

    updateOnFoot(delta);

    updateProgression(delta);

    const playerZ =
        isDriving
            ? playerCar.position.z
            : playerCharacter.position.z;

    updateDynamicScenery(
        playerZ
    );

    updateInfiniteGround(
        playerZ
    );

    updateCamera(delta);

    updateHUD();

    renderer.render(
        scene,
        camera
    );

}

animate();
