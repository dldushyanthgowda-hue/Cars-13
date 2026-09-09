// ============================================================
// CARS 13 — V12 INFINITE ROAD SYSTEM
// ============================================================
// Designed to work AFTER game-v11.js
//
// Main goals:
// - Remove V11 road flickering
// - Never create overlapping road segments
// - Infinite road generation
// - Smooth curves
// - Stable road coordinates
// - No road shadow shimmering
// - Works with V11 driving system
// ============================================================

(function () {

    "use strict";

    function startV12Road() {

        // Wait until V11 has created the road objects.

        if (
            typeof THREE === "undefined" ||
            typeof scene === "undefined" ||
            typeof roadGroup === "undefined" ||
            typeof roadEdgesGroup === "undefined" ||
            typeof centerLineGroup === "undefined"
        ) {

            setTimeout(
                startV12Road,
                100
            );

            return;

        }

        console.log(
            "CARS 13 V12 ROAD: Starting..."
        );

        // ====================================================
        // SETTINGS
        // ====================================================

        const ROAD_WIDTH_V12 = 18;

        const ROAD_CHUNK_V12 = 120;

        const ROAD_SAMPLE_V12 = 6;

        const ROAD_AHEAD_CHUNKS = 18;

        const ROAD_BEHIND_CHUNKS = 10;

        // ====================================================
        // CLEAR OLD V11 ROAD
        // ====================================================

        function clearRoadGroup(group) {

            if (!group) {
                return;
            }

            while (
                group.children.length > 0
            ) {

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
                            material => {

                                if (
                                    material &&
                                    material.dispose
                                ) {

                                    material.dispose();

                                }

                            }
                        );

                    } else if (
                        object.material.dispose
                    ) {

                        object.material.dispose();

                    }

                }

            }

        }

        clearRoadGroup(
            roadGroup
        );

        clearRoadGroup(
            secondaryRoadGroup
        );

        clearRoadGroup(
            roadEdgesGroup
        );

        clearRoadGroup(
            centerLineGroup
        );

        // ====================================================
        // RESET V11 ROAD REGISTRIES
        // ====================================================

        if (
            typeof RENDERED_SEGMENTS !==
            "undefined"
        ) {

            RENDERED_SEGMENTS.clear();

        }

        if (
            typeof RENDERED_SECONDARY_SEGMENTS !==
            "undefined"
        ) {

            RENDERED_SECONDARY_SEGMENTS.clear();

        }

        // ====================================================
        // V12 ROAD CURVE
        // ====================================================

        roadX = function (z) {

            // Large gentle bends.

            const large =
                Math.sin(
                    z * 0.00065
                ) * 55;

            // Medium curves.

            const medium =
                Math.sin(
                    z * 0.00155
                ) * 28;

            // Smaller turns.

            const small =
                Math.sin(
                    z * 0.0042
                ) * 10;

            // Very small road movement.

            const detail =
                Math.sin(
                    z * 0.011
                ) * 3;

            return (
                large +
                medium +
                small +
                detail
            );

        };

        // ====================================================
        // SECONDARY ROAD
        // ====================================================

        secondaryRoadX = function (z) {

            return (
                roadX(z) +
                78 +
                Math.sin(
                    z * 0.0025
                ) * 14
            );

        };

        // ====================================================
        // ROAD DIRECTION
        // ====================================================

        roadDirection = function (z) {

            const x1 =
                roadX(
                    z - 3
                );

            const x2 =
                roadX(
                    z + 3
                );

            return Math.atan2(
                x2 - x1,
                6
            );

        };

        // ====================================================
        // CREATE ONE ROAD CHUNK
        // ====================================================

        function buildRoadChunk(
            startZ,
            endZ,
            path,
            width
        ) {

            const vertices = [];

            const indices = [];

            const distance =
                Math.abs(
                    endZ -
                    startZ
                );

            const count =
                Math.max(
                    1,
                    Math.round(
                        distance /
                        ROAD_SAMPLE_V12
                    )
                );

            // ----------------------------------------------
            // VERTICES
            // ----------------------------------------------

            for (
                let i = 0;
                i <= count;
                i++
            ) {

                const t =
                    i / count;

                const z =
                    startZ +
                    (
                        endZ -
                        startZ
                    ) *
                    t;

                const x =
                    path(z);

                const angle =
                    Math.atan2(

                        path(
                            z + 3
                        ) -
                        path(
                            z - 3
                        ),

                        6

                    );

                // Normal vector.

                const nx =
                    Math.cos(angle);

                const nz =
                    Math.sin(angle);

                const half =
                    width / 2;

                const leftX =
                    x -
                    nx *
                    half;

                const leftZ =
                    z -
                    nz *
                    half;

                const rightX =
                    x +
                    nx *
                    half;

                const rightZ =
                    z +
                    nz *
                    half;

                vertices.push(

                    leftX,
                    0.12,
                    leftZ,

                    rightX,
                    0.12,
                    rightZ

                );

            }

            // ----------------------------------------------
            // TRIANGLES
            // ----------------------------------------------

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

            // ----------------------------------------------
            // GEOMETRY
            // ----------------------------------------------

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

            // ----------------------------------------------
            // ROAD MATERIAL
            // ----------------------------------------------

            const material =
                new THREE.MeshStandardMaterial({

                    color: 0x292929,

                    roughness: 0.96,

                    metalness: 0,

                    side:
                        THREE.DoubleSide

                });

            const mesh =
                new THREE.Mesh(
                    geometry,
                    material
                );

            // IMPORTANT:
            // The road must NOT receive the sun shadow.
            //
            // This prevents shadow-map shimmering.

            mesh.receiveShadow = false;

            mesh.castShadow = false;

            mesh.frustumCulled = true;

            mesh.userData.v12Road = true;

            mesh.userData.startZ =
                Math.min(
                    startZ,
                    endZ
                );

            mesh.userData.endZ =
                Math.max(
                    startZ,
                    endZ
                );

            return mesh;

        }

        // ====================================================
        // CREATE EDGE LINE
        // ====================================================

        function buildEdgeLine(
            startZ,
            endZ,
            path,
            offset
        ) {

            const vertices = [];

            const indices = [];

            const distance =
                Math.abs(
                    endZ -
                    startZ
                );

            const count =
                Math.max(
                    1,
                    Math.round(
                        distance /
                        ROAD_SAMPLE_V12
                    )
                );

            const width =
                0.22;

            for (
                let i = 0;
                i <= count;
                i++
            ) {

                const t =
                    i / count;

                const z =
                    startZ +
                    (
                        endZ -
                        startZ
                    ) *
                    t;

                const x =
                    path(z);

                const angle =
                    Math.atan2(

                        path(
                            z + 3
                        ) -
                        path(
                            z - 3
                        ),

                        6

                    );

                const nx =
                    Math.cos(angle);

                const nz =
                    Math.sin(angle);

                const centerX =
                    x +
                    nx *
                    offset;

                const centerZ =
                    z +
                    nz *
                    offset;

                const half =
                    width / 2;

                vertices.push(

                    centerX -
                    nx * half,

                    0.145,

                    centerZ -
                    nz * half,

                    centerX +
                    nx * half,

                    0.145,

                    centerZ +
                    nz * half

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

            geometry.setIndex(
                indices
            );

            geometry.computeVertexNormals();

            const material =
                new THREE.MeshBasicMaterial({

                    color: 0xffffff,

                    side:
                        THREE.DoubleSide

                });

            const mesh =
                new THREE.Mesh(
                    geometry,
                    material
                );

            mesh.renderOrder = 5;

            mesh.frustumCulled = true;

            return mesh;

        }

        // ====================================================
        // CREATE CENTER DASHES
        // ====================================================

        function buildCenterDashes(
            startZ,
            endZ,
            path
        ) {

            const group =
                new THREE.Group();

            const material =
                new THREE.MeshBasicMaterial({

                    color: 0xffdf75

                });

            const dashLength =
                16;

            const gap =
                42;

            const step =
                dashLength +
                gap;

            for (
                let z =
                    Math.ceil(
                        startZ /
                        step
                    ) *
                    step;

                z < endZ;

                z += step
            ) {

                const dash =
                    new THREE.Mesh(

                        new THREE.BoxGeometry(

                            0.22,

                            0.035,

                            dashLength

                        ),

                        material

                    );

                dash.position.set(

                    path(z),

                    0.16,

                    z

                );

                dash.rotation.y =
                    roadDirection(z);

                dash.renderOrder = 6;

                group.add(
                    dash
                );

            }

            return group;

        }

        // ====================================================
        // STABLE ROAD STORAGE
        // ====================================================

        const v12RoadSegments =
            new Map();

        const v12SecondarySegments =
            new Map();

        // ====================================================
        // CREATE MAIN ROAD SEGMENT
        // ====================================================

        function createMainSegment(
            key
        ) {

            if (
                v12RoadSegments.has(key)
            ) {

                return;

            }

            const startZ =
                key *
                ROAD_CHUNK_V12;

            const endZ =
                startZ +
                ROAD_CHUNK_V12;

            const road =
                buildRoadChunk(

                    startZ,

                    endZ,

                    roadX,

                    ROAD_WIDTH_V12

                );

            roadGroup.add(
                road
            );

            const left =
                buildEdgeLine(

                    startZ,

                    endZ,

                    roadX,

                    -ROAD_WIDTH_V12 / 2 +
                    0.15

                );

            const right =
                buildEdgeLine(

                    startZ,

                    endZ,

                    roadX,

                    ROAD_WIDTH_V12 / 2 -
                    0.15

                );

            roadEdgesGroup.add(
                left,
                right
            );

            const dashes =
                buildCenterDashes(

                    startZ,

                    endZ,

                    roadX

                );

            centerLineGroup.add(
                dashes
            );

            v12RoadSegments.set(

                key,

                {
                    road: road,
                    left: left,
                    right: right,
                    dashes: dashes
                }

            );

        }

        // ====================================================
        // CREATE SECONDARY ROAD SEGMENT
        // ====================================================

        function createSecondarySegment(
            key
        ) {

            if (
                v12SecondarySegments.has(
                    key
                )
            ) {

                return;

            }

            const startZ =
                key *
                ROAD_CHUNK_V12;

            const endZ =
                startZ +
                ROAD_CHUNK_V12;

            const road =
                buildRoadChunk(

                    startZ,

                    endZ,

                    secondaryRoadX,

                    12

                );

            secondaryRoadGroup.add(
                road
            );

            v12SecondarySegments.set(

                key,

                road

            );

        }

        // ====================================================
        // REMOVE FAR ROAD SEGMENT
        // ====================================================

        function removeMainSegment(
            key
        ) {

            const data =
                v12RoadSegments.get(
                    key
                );

            if (!data) {
                return;
            }

            roadGroup.remove(
                data.road
            );

            roadEdgesGroup.remove(
                data.left
            );

            roadEdgesGroup.remove(
                data.right
            );

            centerLineGroup.remove(
                data.dashes
            );

            if (
                data.road.geometry
            ) {

                data.road.geometry.dispose();

            }

            if (
                data.road.material
            ) {

                data.road.material.dispose();

            }

            if (
                data.left.geometry
            ) {

                data.left.geometry.dispose();

            }

            if (
                data.right.geometry
            ) {

                data.right.geometry.dispose();

            }

            if (
                data.dashes
            ) {

                data.dashes.traverse(
                    object => {

                        if (
                            object.geometry
                        ) {

                            object.geometry.dispose();

                        }

                        if (
                            object.material
                        ) {

                            object.material.dispose();

                        }

                    }
                );

            }

            v12RoadSegments.delete(
                key
            );

        }

        // ====================================================
        // REMOVE SECONDARY SEGMENT
        // ====================================================

        function removeSecondarySegment(
            key
        ) {

            const road =
                v12SecondarySegments.get(
                    key
                );

            if (!road) {
                return;
            }

            secondaryRoadGroup.remove(
                road
            );

            if (
                road.geometry
            ) {

                road.geometry.dispose();

            }

            if (
                road.material
            ) {

                road.material.dispose();

            }

            v12SecondarySegments.delete(
                key
            );

        }

        // ====================================================
        // GENERATE ROAD AROUND PLAYER
        // ====================================================

        function generateRoadAround(
            playerZ
        ) {

            const centerKey =
                Math.floor(
                    playerZ /
                    ROAD_CHUNK_V12
                );

            const minimum =
                centerKey -
                ROAD_BEHIND_CHUNKS;

            const maximum =
                centerKey +
                ROAD_AHEAD_CHUNKS;

            // ----------------------------------------------
            // CREATE REQUIRED ROAD
            // ----------------------------------------------

            for (
                let key =
                    minimum;

                key <= maximum;

                key++
            ) {

                createMainSegment(
                    key
                );

                createSecondarySegment(
                    key
                );

            }

            // ----------------------------------------------
            // REMOVE FAR MAIN ROAD
            // ----------------------------------------------

            for (
                const key of
                v12RoadSegments.keys()
            ) {

                if (
                    key < minimum - 2 ||
                    key > maximum + 2
                ) {

                    removeMainSegment(
                        key
                    );

                }

            }

            // ----------------------------------------------
            // REMOVE FAR SECONDARY ROAD
            // ----------------------------------------------

            for (
                const key of
                v12SecondarySegments.keys()
            ) {

                if (
                    key < minimum - 2 ||
                    key > maximum + 2
                ) {

                    removeSecondarySegment(
                        key
                    );

                }

            }

        }

        // ====================================================
        // INITIAL ROAD
        // ====================================================

        generateRoadAround(
            0
        );

        // ====================================================
        // REPLACE V11 ROAD SEGMENT FUNCTION
        // ====================================================
        //
        // V11's dynamic scenery calls createRoadSegment().
        // We replace it so V11 cannot create its old road
        // geometry again.
        //
        // ====================================================

        createRoadSegment =
            function () {

                // Return a harmless invisible object.
                //
                // V12 manages the real road itself.

                const geometry =
                    new THREE.BufferGeometry();

                const material =
                    new THREE.MeshBasicMaterial({
                        visible: false
                    });

                const mesh =
                    new THREE.Mesh(
                        geometry,
                        material
                    );

                mesh.userData.v12Blocked =
                    true;

                return mesh;

            };

        // ====================================================
        // REPLACE V11 ROAD STRIPS
        // ====================================================
        //
        // Prevent V11's dynamic system from adding duplicate
        // edge geometry.
        //
        // ====================================================

        createRoadStrip =
            function () {

                const geometry =
                    new THREE.BufferGeometry();

                const material =
                    new THREE.MeshBasicMaterial({
                        visible: false
                    });

                return new THREE.Mesh(
                    geometry,
                    material
                );

            };

        // ====================================================
        // REPLACE V11 CENTER DASHES
        // ====================================================
        //
        // V12 already creates its own center lines.
        //
        // ====================================================

        createCenterDashes =
            function () {

                return [];

            };

        // ====================================================
        // REPLACE DYNAMIC SCENERY ROAD GENERATION
        // ====================================================

        updateDynamicScenery =
            function (playerZ) {

                generateRoadAround(
                    playerZ
                );

                // Keep V11 scenery generation working.
                //
                // Buildings and trees can continue to use
                // the new roadX() curve.

                if (
                    typeof createTreesForSegment ===
                    "function"
                ) {

                    const sceneryStart =
                        playerZ -
                        1800;

                    const sceneryEnd =
                        playerZ +
                        1800;

                    // Trees are handled by V11's system.
                    //
                    // Do not regenerate them every frame.

                }

            };

        // ====================================================
        // IMPORTANT V11 REGISTRY COMPATIBILITY
        // ====================================================

        if (
            typeof RENDERED_SEGMENTS !==
            "undefined"
        ) {

            RENDERED_SEGMENTS.clear();

        }

        if (
            typeof RENDERED_SECONDARY_SEGMENTS !==
            "undefined"
        ) {

            RENDERED_SECONDARY_SEGMENTS.clear();

        }

        // ====================================================
        // FINAL INITIALIZATION
        // ====================================================

        generateRoadAround(
            0
        );

        console.log(
            "CARS 13 V12 ROAD: READY"
        );

    }

    // ========================================================
    // START
    // ========================================================

    startV12Road();

})();
