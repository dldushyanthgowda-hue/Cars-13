// ============================================================
// CARS 13 — V12 MAP UPGRADE
// ============================================================
// This file works ON TOP of game-v11.js.
// Do not delete or modify game-v11.js.
//
// V12 adds:
// - Compact city map
// - Stronger road curves
// - Large city buildings
// - Downtown towers
// - City plaza
// - Side roads
// - Trees
// - Street lights
// - Lake
// - City blocks
// - Infinite road continuation
// ============================================================

(function () {

    "use strict";

    // ========================================================
    // WAIT UNTIL V11 HAS LOADED
    // ========================================================

    function startV12Map() {

        if (
            typeof THREE === "undefined" ||
            typeof scene === "undefined" ||
            typeof roadGroup === "undefined"
        ) {
            setTimeout(startV12Map, 100);
            return;
        }

        console.log("CARS 13 V12 MAP: Loading...");

        // ====================================================
        // V12 SETTINGS
        // ====================================================

        const V12_TURN_STRENGTH = 1.45;

        const V12_CITY_SPREAD = 34;

        const V12_BUILDING_SPACING = 220;

        // ====================================================
        // NEW MAIN ROAD CURVE
        // ====================================================
        //
        // V11's driving code uses roadX(), so replacing the
        // function also changes the road position used by
        // the car and minimap.
        //
        // ====================================================

        roadX = function (z) {

            const gentleCurve =
                Math.sin(z * 0.0018) * 34;

            const largeTurn =
                Math.sin(z * 0.00075) * 42;

            const mediumTurn =
                Math.sin(z * 0.0035) * 13;

            const smallCurve =
                Math.sin(z * 0.010) * 4;

            return (
                gentleCurve +
                largeTurn +
                mediumTurn +
                smallCurve
            ) * V12_TURN_STRENGTH / 2;

        };

        // ====================================================
        // SECONDARY ROAD
        // ====================================================

        secondaryRoadX = function (z) {

            return (
                roadX(z) +
                72 +
                Math.sin(z * 0.003) * 12
            );

        };

        // ====================================================
        // ROAD DIRECTION
        // ====================================================

        roadDirection = function (z) {

            const x1 =
                roadX(z - 2);

            const x2 =
                roadX(z + 2);

            return Math.atan2(
                x2 - x1,
                4
            );

        };

        // ====================================================
        // CLEAR OLD V11 MAP
        // ====================================================

        function clearGroup(group) {

            if (!group) return;

            while (group.children.length > 0) {

                const object =
                    group.children.pop();

                if (object.geometry) {
                    object.geometry.dispose();
                }

                if (object.material) {

                    if (
                        Array.isArray(
                            object.material
                        )
                    ) {

                        object.material.forEach(
                            material =>
                                material.dispose()
                        );

                    } else {

                        object.material.dispose();

                    }

                }

            }

        }

        // Clear V11 road.

        clearGroup(roadGroup);

        // Clear V11 secondary road.

        clearGroup(secondaryRoadGroup);

        // Clear V11 road edges.

        clearGroup(roadEdgesGroup);

        // Clear V11 center lines.

        clearGroup(centerLineGroup);

        // Clear V11 buildings.

        clearGroup(worldLandmarks);

        // Clear V11 trees.

        clearGroup(treesGroup);

        // Clear V11 mountains.

        if (
            typeof mountainsGroup !== "undefined"
        ) {

            clearGroup(mountainsGroup);

        }

        // ====================================================
        // RESET V11 ROAD MAP REGISTRIES
        // ====================================================

        RENDERED_SEGMENTS.clear();

        RENDERED_SECONDARY_SEGMENTS.clear();

        if (
            typeof renderedTreeSegments !==
            "undefined"
        ) {

            renderedTreeSegments.clear();

        }

        if (
            typeof renderedMountainSegments !==
            "undefined"
        ) {

            renderedMountainSegments.clear();

        }

        // ====================================================
        // V12 ROAD GENERATION
        // ====================================================

        function createV12RoadSegment(
            startZ,
            endZ,
            path,
            width
        ) {

            const vertices = [];

            const indices = [];

            const step = 6;

            const count =
                Math.ceil(
                    Math.abs(endZ - startZ) /
                    step
                );

            for (
                let i = 0;
                i <= count;
                i++
            ) {

                const t =
                    i / count;

                const z =
                    startZ +
                    (endZ - startZ) * t;

                const x =
                    path(z);

                const angle =
                    Math.atan2(
                        path(z + 2) -
                        path(z - 2),
                        4
                    );

                // Normal to road direction.

                const nx =
                    Math.cos(angle);

                const nz =
                    Math.sin(angle);

                const leftX =
                    x -
                    nx *
                    width / 2;

                const leftZ =
                    z -
                    nz *
                    width / 2;

                const rightX =
                    x +
                    nx *
                    width / 2;

                const rightZ =
                    z +
                    nz *
                    width / 2;

                vertices.push(

                    leftX,
                    0.12,
                    leftZ,

                    rightX,
                    0.12,
                    rightZ

                );

            }

            for (
                let i = 0;
                i < count;
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

            geometry.setIndex(indices);

            geometry.computeVertexNormals();

            const material =
                new THREE.MeshStandardMaterial({

                    color: 0x282828,

                    roughness: 0.92,

                    side:
                        THREE.DoubleSide

                });

            const mesh =
                new THREE.Mesh(
                    geometry,
                    material
                );

            mesh.receiveShadow = false;

            return mesh;

        }

        // ====================================================
        // V12 ROAD MARKINGS
        // ====================================================

        function createV12RoadMarkings(
            startZ,
            endZ,
            path,
            width
        ) {

            const angleAt = function (z) {

                return Math.atan2(
                    path(z + 2) -
                    path(z - 2),
                    4
                );

            };

            // -----------------------------------------------
            // Edge lines
            // -----------------------------------------------

            const left =
                createRoadStrip(
                    -width / 2 + 0.15,
                    0.28,
                    0xffffff,
                    startZ,
                    endZ,
                    path
                );

            const right =
                createRoadStrip(
                    width / 2 - 0.15,
                    0.28,
                    0xffffff,
                    startZ,
                    endZ,
                    path
                );

            roadEdgesGroup.add(
                left,
                right
            );

            // -----------------------------------------------
            // Center dashes
            // -----------------------------------------------

            for (
                let z =
                    Math.ceil(startZ / 55) * 55;

                z < endZ;

                z += 55
            ) {

                const dash =
                    new THREE.Mesh(

                        new THREE.BoxGeometry(
                            0.24,
                            0.04,
                            20
                        ),

                        new THREE.MeshBasicMaterial({
                            color: 0xffe27a
                        })

                    );

                dash.position.set(
                    path(z),
                    0.16,
                    z
                );

                dash.rotation.y =
                    angleAt(z);

                dash.renderOrder = 3;

                centerLineGroup.add(
                    dash
                );

            }

        }

        // ====================================================
        // BUILDING MATERIALS
        // ====================================================

        const cityMaterials = [

            new THREE.MeshStandardMaterial({
                color: 0x607d8b,
                roughness: 0.72
            }),

            new THREE.MeshStandardMaterial({
                color: 0x78909c,
                roughness: 0.72
            }),

            new THREE.MeshStandardMaterial({
                color: 0x8d6e63,
                roughness: 0.76
            }),

            new THREE.MeshStandardMaterial({
                color: 0x546e7a,
                roughness: 0.72
            }),

            new THREE.MeshStandardMaterial({
                color: 0x7b8794,
                roughness: 0.74
            })

        ];

        const windowMaterial =
            new THREE.MeshStandardMaterial({

                color: 0xb9d9e6,

                roughness: 0.25,

                metalness: 0.12

            });

        // ====================================================
        // CITY BUILDING
        // ====================================================

        function createV12Building(
            x,
            z,
            width,
            height,
            depth,
            materialIndex
        ) {

            const group =
                new THREE.Group();

            const material =
                cityMaterials[
                    materialIndex %
                    cityMaterials.length
                ];

            // Main building.

            const body =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        width,
                        height,
                        depth
                    ),

                    material
                );

            body.position.y =
                height / 2;

            body.castShadow = true;

            body.receiveShadow = true;

            group.add(body);

            // Roof.

            const roof =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        width * 0.92,
                        0.7,
                        depth * 0.92
                    ),

                    new THREE.MeshStandardMaterial({

                        color: 0x37474f,

                        roughness: 0.75

                    })

                );

            roof.position.y =
                height + 0.35;

            roof.castShadow = true;

            group.add(roof);

            // Windows.

            const rows =
                Math.min(
                    14,
                    Math.floor(
                        height / 3.5
                    )
                );

            const columns =
                Math.max(
                    2,
                    Math.floor(
                        width / 3
                    )
                );

            for (
                let row = 0;
                row < rows;
                row++
            ) {

                for (
                    let column = 0;
                    column < columns;
                    column++
                ) {

                    const window =
                        new THREE.Mesh(

                            new THREE.BoxGeometry(
                                0.8,
                                0.65,
                                0.08
                            ),

                            windowMaterial
                        );

                    const xOffset =
                        (
                            column -
                            (columns - 1) / 2
                        ) *
                        2.4;

                    const y =
                        2.2 +
                        row * 3.4;

                    window.position.set(
                        xOffset,
                        y,
                        -depth / 2 - 0.06
                    );

                    group.add(
                        window
                    );

                }

            }

            group.position.set(
                x,
                0,
                z
            );

            worldLandmarks.add(
                group
            );

            return group;

        }

        // ====================================================
        // STREET LIGHT
        // ====================================================

        function createV12StreetLight(
            x,
            z
        ) {

            const group =
                new THREE.Group();

            const pole =
                new THREE.Mesh(

                    new THREE.CylinderGeometry(
                        0.09,
                        0.13,
                        7,
                        8
                    ),

                    new THREE.MeshStandardMaterial({
                        color: 0x252b30,
                        roughness: 0.8
                    })

                );

            pole.position.y =
                3.5;

            group.add(pole);

            const arm =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        1.4,
                        0.12,
                        0.12
                    ),

                    new THREE.MeshStandardMaterial({
                        color: 0x252b30
                    })

                );

            arm.position.set(
                0.55,
                6.7,
                0
            );

            group.add(arm);

            const lamp =
                new THREE.Mesh(

                    new THREE.SphereGeometry(
                        0.25,
                        10,
                        8
                    ),

                    new THREE.MeshStandardMaterial({

                        color: 0xffe7a5,

                        emissive: 0xffb300,

                        emissiveIntensity: 0.7

                    })

                );

            lamp.position.set(
                1.1,
                6.65,
                0
            );

            group.add(lamp);

            group.position.set(
                x,
                0,
                z
            );

            worldLandmarks.add(
                group
            );

        }

        // ====================================================
        // CITY BLOCK GENERATOR
        // ====================================================

        function createV12CityBlock(
            z,
            side
        ) {

            const center =
                roadX(z);

            const baseX =
                center +
                side *
                V12_CITY_SPREAD;

            const buildingCount =
                3;

            for (
                let i = 0;
                i < buildingCount;
                i++
            ) {

                const offset =
                    (
                        i -
                        1
                    ) *
                    15;

                const width =
                    11 +
                    (
                        i % 2
                    ) *
                    5;

                const height =
                    10 +
                    (
                        (Math.abs(
                            Math.floor(z)
                        ) +
                        i * 13) %
                        20
                    );

                const depth =
                    13 +
                    (
                        i % 2
                    ) *
                    4;

                createV12Building(

                    baseX +
                    offset,

                    z +
                    offset * 0.7,

                    width,

                    height,

                    depth,

                    i +
                    Math.abs(
                        Math.floor(z / 100)
                    )

                );

            }

            // Street lights.

            createV12StreetLight(

                center +
                side *
                (
                    ROAD_WIDTH / 2 +
                    3
                ),

                z - 35

            );

            createV12StreetLight(

                center +
                side *
                (
                    ROAD_WIDTH / 2 +
                    3
                ),

                z + 35

            );

        }

        // ====================================================
        // DOWNTOWN LANDMARK TOWER
        // ====================================================

        function createV12Tower(
            z,
            side,
            width,
            height,
            depth
        ) {

            const center =
                roadX(z);

            const x =
                center +
                side *
                42;

            const tower =
                new THREE.Group();

            const body =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        width,
                        height,
                        depth
                    ),

                    new THREE.MeshStandardMaterial({

                        color: 0x455a64,

                        roughness: 0.58,

                        metalness: 0.18

                    })

                );

            body.position.y =
                height / 2;

            body.castShadow = true;

            body.receiveShadow = true;

            tower.add(body);

            // Glass front.

            const glass =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        width * 0.72,
                        height * 0.82,
                        0.12
                    ),

                    new THREE.MeshStandardMaterial({

                        color: 0xa9d7e8,

                        roughness: 0.22,

                        metalness: 0.28

                    })

                );

            glass.position.set(
                0,
                height * 0.48,
                -depth / 2 - 0.08
            );

            tower.add(glass);

            // Crown.

            const crown =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        width * 0.7,
                        2,
                        depth * 0.7
                    ),

                    new THREE.MeshStandardMaterial({

                        color: 0x263238,

                        roughness: 0.55,

                        metalness: 0.25

                    })

                );

            crown.position.y =
                height + 1;

            crown.castShadow = true;

            tower.add(crown);

            // Antenna.

            const antenna =
                new THREE.Mesh(

                    new THREE.CylinderGeometry(
                        0.12,
                        0.12,
                        12,
                        8
                    ),

                    new THREE.MeshStandardMaterial({

                        color: 0x333333,

                        metalness: 0.7

                    })

                );

            antenna.position.y =
                height + 8;

            tower.add(antenna);

            tower.position.set(
                x,
                0,
                z
            );

            worldLandmarks.add(
                tower
            );

        }

        // ====================================================
        // CITY PLAZA
        // ====================================================

        function createV12Plaza(z) {

            const center =
                roadX(z);

            const plaza =
                new THREE.Mesh(

                    new THREE.CylinderGeometry(
                        25,
                        25,
                        0.35,
                        48
                    ),

                    new THREE.MeshStandardMaterial({

                        color: 0x737373,

                        roughness: 0.92

                    })

                );

            plaza.position.set(
                center + 55,
                0.04,
                z
            );

            plaza.receiveShadow = true;

            worldLandmarks.add(
                plaza
            );

            // Center fountain.

            const fountain =
                new THREE.Mesh(

                    new THREE.CylinderGeometry(
                        5,
                        6,
                        1,
                        32
                    ),

                    new THREE.MeshStandardMaterial({

                        color: 0x607d8b,

                        roughness: 0.35,

                        metalness: 0.25

                    })

                );

            fountain.position.set(
                center + 55,
                0.65,
                z
            );

            worldLandmarks.add(
                fountain
            );

        }

        // ====================================================
        // CITY LAKE
        // ====================================================

        function createV12Lake(z) {

            const center =
                roadX(z);

            const lake =
                new THREE.Mesh(

                    new THREE.CircleGeometry(
                        90,
                        64
                    ),

                    new THREE.MeshStandardMaterial({

                        color: 0x2386c4,

                        roughness: 0.18,

                        metalness: 0.18

                    })

                );

            lake.rotation.x =
                -Math.PI / 2;

            lake.position.set(
                center - 125,
                -0.02,
                z
            );

            worldLandmarks.add(
                lake
            );

        }

        // ====================================================
        // V12 ROAD NETWORK
        // ====================================================

        const V12_START =
            ROAD_END - 600;

        const V12_END =
            ROAD_START + 600;

        for (
            let z =
                V12_START;

            z < V12_END;

            z += ROAD_SEGMENT_LENGTH
        ) {

            const key =
                Math.round(
                    z /
                    ROAD_SEGMENT_LENGTH
                );

            const road =
                createV12RoadSegment(

                    z,

                    z +
                    ROAD_SEGMENT_LENGTH,

                    roadX,

                    ROAD_WIDTH

                );

            roadGroup.add(
                road
            );

            RENDERED_SEGMENTS.set(
                key,
                road
            );

            // Secondary road.

            const secondary =
                createV12RoadSegment(

                    z,

                    z +
                    ROAD_SEGMENT_LENGTH,

                    secondaryRoadX,

                    SECONDARY_ROAD_WIDTH

                );

            secondaryRoadGroup.add(
                secondary
            );

            RENDERED_SECONDARY_SEGMENTS.set(
                key,
                true
            );

            createV12RoadMarkings(
                z,
                z +
                ROAD_SEGMENT_LENGTH,
                roadX,
                ROAD_WIDTH
            );

        }

        // ====================================================
        // CITY BUILDINGS
        // ====================================================

        for (
            let z =
                Math.ceil(
                    V12_START /
                    V12_BUILDING_SPACING
                ) *
                V12_BUILDING_SPACING;

            z < V12_END;

            z += V12_BUILDING_SPACING
        ) {

            createV12CityBlock(
                z,
                -1
            );

            createV12CityBlock(
                z + 70,
                1
            );

        }

        // ====================================================
        // DOWNTOWN
        // ====================================================

        createV12Tower(
            -900,
            -1,
            24,
            58,
            24
        );

        createV12Tower(
            -1500,
            1,
            28,
            72,
            26
        );

        createV12Tower(
            -2200,
            -1,
            32,
            88,
            30
        );

        createV12Tower(
            -3000,
            1,
            26,
            66,
            25
        );

        createV12Tower(
            -3900,
            -1,
            34,
            96,
            32
        );

        // ====================================================
        // PLAZA
        // ====================================================

        createV12Plaza(
            -2500
        );

        // ====================================================
        // LAKE
        // ====================================================

        createV12Lake(
            -1400
        );

        // ====================================================
        // TREES
        // ====================================================

        for (
            let z =
                Math.ceil(
                    V12_START / 100
                ) * 100;

            z < V12_END;

            z += 100
        ) {

            const center =
                roadX(z);

            const random =
                Math.abs(
                    Math.sin(
                        z * 12.9898
                    )
                );

            createTree(

                center -
                55 -
                random * 35,

                z +
                random * 20,

                0.65 +
                random * 0.45,

                treesGroup

            );

            createTree(

                center +
                55 +
                random * 35,

                z +
                30,

                0.65 +
                random * 0.45,

                treesGroup

            );

        }

        // ====================================================
        // EXTRA CITY PARK
        // ====================================================

        const park =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    90,
                    0.15,
                    150
                ),

                new THREE.MeshStandardMaterial({

                    color: 0x467a3e,

                    roughness: 1

                })

            );

        park.position.set(
            roadX(-3400) + 110,
            0,
            -3400
        );

        worldLandmarks.add(
            park
        );

        // ====================================================
        // ADD GROUPS BACK TO SCENE
        // ====================================================

        if (
            !scene.children.includes(
                roadGroup
            )
        ) {

            scene.add(
                roadGroup
            );

        }

        if (
            !scene.children.includes(
                secondaryRoadGroup
            )
        ) {

            scene.add(
                secondaryRoadGroup
            );

        }

        if (
            !scene.children.includes(
                roadEdgesGroup
            )
        ) {

            scene.add(
                roadEdgesGroup
            );

        }

        if (
            !scene.children.includes(
                centerLineGroup
            )
        ) {

            scene.add(
                centerLineGroup
            );

        }

        if (
            !scene.children.includes(
                worldLandmarks
            )
        ) {

            scene.add(
                worldLandmarks
            );

        }

        if (
            !scene.children.includes(
                treesGroup
            )
        ) {

            scene.add(
                treesGroup
            );

        }

        // ====================================================
        // IMPORTANT:
        // RESET DYNAMIC GENERATION BOUNDARIES
        // ====================================================

        generatedMinZ =
            V12_START;

        generatedMaxZ =
            V12_END;

        // ====================================================
        // V12 FINISHED
        // ====================================================

        console.log(
            "CARS 13 V12 MAP: Ready!"
        );

    }

    startV12Map();

})();
