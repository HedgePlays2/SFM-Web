// ============================================================
// SFM-WEB
// 3D Scene Manager
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


export class SceneManager {

    constructor(viewport) {

        this.viewport =
            viewport;

        if (!this.viewport) {

            throw new Error(
                "SceneManager: viewport was not found."
            );

        }


        // =====================================================
        // Object collection
        // =====================================================

        this.objects = [];


        // =====================================================
        // Scene
        // =====================================================

        this.scene =
            new THREE.Scene();


        this.scene.background =
            new THREE.Color(
                0x17191d
            );


        // =====================================================
        // Camera
        // =====================================================

        this.camera =
            new THREE.PerspectiveCamera(
                60,
                1,
                0.01,
                5000
            );


        this.camera.position.set(
            8,
            6,
            8
        );


        this.camera.lookAt(
            0,
            0,
            0
        );


        // =====================================================
        // Renderer
        // =====================================================

        this.renderer =
            new THREE.WebGLRenderer({
                antialias: true,
                alpha: false
            });


        this.renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                2
            )
        );


        this.renderer.setSize(
            this.viewport.clientWidth || 800,
            this.viewport.clientHeight || 500,
            false
        );


        this.renderer.shadowMap.enabled =
            true;


        this.renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;


        this.renderer.outputColorSpace =
            THREE.SRGBColorSpace;


        this.renderer.toneMapping =
            THREE.ACESFilmicToneMapping;


        this.renderer.toneMappingExposure =
            1;


        this.renderer.domElement.id =
            "sfmCanvas";


        this.renderer.domElement.style.display =
            "block";


        this.renderer.domElement.style.width =
            "100%";


        this.renderer.domElement.style.height =
            "100%";


        this.renderer.domElement.style.touchAction =
            "none";


        this.viewport.appendChild(
            this.renderer.domElement
        );


        // =====================================================
        // Environment
        // =====================================================

        this.createWorld();


        // =====================================================
        // Grid
        // =====================================================

        this.createGrid();


        // =====================================================
        // Axes
        // =====================================================

        this.createAxes();


        // =====================================================
        // Default lighting
        // =====================================================

        this.createDefaultLights();


        // =====================================================
        // Resize
        // =====================================================

        this.resizeObserver =
            new ResizeObserver(
                () => {

                    this.resize();

                }
            );


        this.resizeObserver.observe(
            this.viewport
        );


        window.addEventListener(
            "resize",
            () => {

                this.resize();

            }
        );


        this.resize();

    }


    // =========================================================
    // World
    // =========================================================

    createWorld() {

        /*
         * A large plane gives the editor a visible floor.
         */

        const floorGeometry =
            new THREE.PlaneGeometry(
                2000,
                2000
            );


        const floorMaterial =
            new THREE.MeshStandardMaterial({

                color:
                    0x202329,

                roughness:
                    0.9,

                metalness:
                    0.05

            });


        this.floor =
            new THREE.Mesh(
                floorGeometry,
                floorMaterial
            );


        this.floor.rotation.x =
            -Math.PI / 2;


        this.floor.position.y =
            0;


        this.floor.receiveShadow =
            true;


        this.floor.name =
            "__SFM_FLOOR__";


        this.scene.add(
            this.floor
        );

    }


    // =========================================================
    // Grid
    // =========================================================

    createGrid() {

        this.grid =
            new THREE.GridHelper(
                200,
                200,
                0x555b66,
                0x30343b
            );


        this.grid.position.y =
            0.002;


        this.grid.name =
            "__SFM_GRID__";


        this.scene.add(
            this.grid
        );

    }


    // =========================================================
    // Axes
    // =========================================================

    createAxes() {

        this.axes =
            new THREE.AxesHelper(
                3
            );


        this.axes.position.set(
            0,
            0.01,
            0
        );


        this.axes.name =
            "__SFM_AXES__";


        this.scene.add(
            this.axes
        );

    }


    // =========================================================
    // Default lights
    // =========================================================

    createDefaultLights() {

        // -----------------------------------------------------
        // Ambient
        // -----------------------------------------------------

        this.ambientLight =
            new THREE.HemisphereLight(
                0xffffff,
                0x444444,
                1.5
            );


        this.ambientLight.name =
            "__SFM_AMBIENT__";


        this.scene.add(
            this.ambientLight
        );


        // -----------------------------------------------------
        // Main directional light
        // -----------------------------------------------------

        this.mainLight =
            new THREE.DirectionalLight(
                0xffffff,
                3
            );


        this.mainLight.position.set(
            5,
            10,
            5
        );


        this.mainLight.castShadow =
            true;


        this.mainLight.shadow.mapSize.width =
            2048;


        this.mainLight.shadow.mapSize.height =
            2048;


        this.mainLight.shadow.camera.near =
            0.1;


        this.mainLight.shadow.camera.far =
            100;


        this.mainLight.shadow.camera.left =
            -30;


        this.mainLight.shadow.camera.right =
            30;


        this.mainLight.shadow.camera.top =
            30;


        this.mainLight.shadow.camera.bottom =
            -30;


        this.mainLight.name =
            "__SFM_MAIN_LIGHT__";


        this.scene.add(
            this.mainLight
        );


        // -----------------------------------------------------
        // Fill light
        // -----------------------------------------------------

        this.fillLight =
            new THREE.DirectionalLight(
                0x8899ff,
                0.7
            );


        this.fillLight.position.set(
            -5,
            5,
            -5
        );


        this.fillLight.name =
            "__SFM_FILL_LIGHT__";


        this.scene.add(
            this.fillLight
        );

    }


    // =========================================================
    // Create cube
    // =========================================================

    createCube(
        name = "Cube"
    ) {

        const geometry =
            new THREE.BoxGeometry(
                1,
                1,
                1
            );


        const material =
            new THREE.MeshStandardMaterial({

                color:
                    0x4d8cff,

                roughness:
                    0.55,

                metalness:
                    0.05

            });


        const cube =
            new THREE.Mesh(
                geometry,
                material
            );


        cube.name =
            name;


        cube.castShadow =
            true;


        cube.receiveShadow =
            true;


        cube.position.y =
            0.5;


        this.addObject(
            cube
        );


        return cube;

    }


    // =========================================================
    // Create sphere
    // =========================================================

    createSphere(
        name = "Sphere"
    ) {

        const geometry =
            new THREE.SphereGeometry(
                0.6,
                32,
                20
            );


        const material =
            new THREE.MeshStandardMaterial({

                color:
                    0xff5577,

                roughness:
                    0.45,

                metalness:
                    0.05

            });


        const sphere =
            new THREE.Mesh(
                geometry,
                material
            );


        sphere.name =
            name;


        sphere.castShadow =
            true;


        sphere.receiveShadow =
            true;


        sphere.position.y =
            0.6;


        this.addObject(
            sphere
        );


        return sphere;

    }


    // =========================================================
    // Create light
    // =========================================================

    createLight(
        name = "Light"
    ) {

        const light =
            new THREE.PointLight(
                0xffffff,
                10,
                25
            );


        light.name =
            name;


        light.position.set(
            2,
            4,
            2
        );


        light.castShadow =
            true;


        light.shadow.mapSize.width =
            1024;


        light.shadow.mapSize.height =
            1024;


        /*
         * Create a visible helper so the light
         * can be selected in the editor.
         */

        const helper =
            new THREE.PointLightHelper(
                light,
                0.25
            );


        helper.name =
            "__SFM_LIGHT_HELPER__";


        light.add(
            helper
        );


        this.addObject(
            light
        );


        return light;

    }


    // =========================================================
    // Add arbitrary object
    // =========================================================

    addObject(
        object
    ) {

        if (!object) {

            return null;

        }


        /*
         * Don't add editor-only objects to the
         * user object collection.
         */

        if (
            object.name?.startsWith(
                "__SFM_"
            )
        ) {

            this.scene.add(
                object
            );

            return object;

        }


        if (
            !this.objects.includes(
                object
            )
        ) {

            this.objects.push(
                object
            );

        }


        this.scene.add(
            object
        );


        return object;

    }


    // =========================================================
    // Remove object
    // =========================================================

    removeObject(
        object
    ) {

        if (!object) {

            return;

        }


        const index =
            this.objects.indexOf(
                object
            );


        if (
            index !== -1
        ) {

            this.objects.splice(
                index,
                1
            );

        }


        this.scene.remove(
            object
        );


        this.disposeObject(
            object
        );

    }


    // =========================================================
    // Dispose object
    // =========================================================

    disposeObject(
        object
    ) {

        if (!object) {

            return;

        }


        object.traverse(
            child => {

                if (
                    child.geometry
                ) {

                    child.geometry.dispose();

                }


                if (
                    child.material
                ) {

                    const materials =
                        Array.isArray(
                            child.material
                        )
                            ? child.material
                            : [
                                child.material
                            ];


                    for (
                        const material
                        of materials
                    ) {

                        if (
                            material.map
                        ) {

                            material.map.dispose();

                        }


                        if (
                            material.normalMap
                        ) {

                            material.normalMap.dispose();

                        }


                        if (
                            material.roughnessMap
                        ) {

                            material.roughnessMap.dispose();

                        }


                        if (
                            material.metalnessMap
                        ) {

                            material.metalnessMap.dispose();

                        }


                        material.dispose();

                    }

                }

            }
        );

    }


    // =========================================================
    // Clear user objects
    // =========================================================

    clearObjects() {

        const objects =
            [...this.objects];


        for (
            const object
            of objects
        ) {

            this.removeObject(
                object
            );

        }


        this.objects =
            [];

    }


    // =========================================================
    // Find object by UUID
    // =========================================================

    getObjectByUUID(
        uuid
    ) {

        for (
            const object
            of this.objects
        ) {

            const found =
                object.getObjectByProperty(
                    "uuid",
                    uuid
                );


            if (found) {

                return found;

            }

        }


        return null;

    }


    // =========================================================
    // Find object by name
    // =========================================================

    getObjectByName(
        name
    ) {

        for (
            const object
            of this.objects
        ) {

            if (
                object.name ===
                name
            ) {

                return object;

            }

        }


        return null;

    }


    // =========================================================
    // Resize
    // =========================================================

    resize() {

        const width =
            this.viewport.clientWidth;


        const height =
            this.viewport.clientHeight;


        if (
            width <= 0 ||
            height <= 0
        ) {

            return;

        }


        this.camera.aspect =
            width /
            height;


        this.camera.updateProjectionMatrix();


        this.renderer.setSize(
            width,
            height,
            false
        );

    }


    // =========================================================
    // Render
    // =========================================================

    render() {

        this.renderer.render(
            this.scene,
            this.camera
        );

    }


    // =========================================================
    // Get scene
    // =========================================================

    getScene() {

        return this.scene;

    }


    // =========================================================
    // Get camera
    // =========================================================

    getCamera() {

        return this.camera;

    }


    // =========================================================
    // Get renderer
    // =========================================================

    getRenderer() {

        return this.renderer;

    }


    // =========================================================
    // Cleanup
    // =========================================================

    dispose() {

        this.clearObjects();


        if (
            this.resizeObserver
        ) {

            this.resizeObserver.disconnect();

        }


        window.removeEventListener(
            "resize",
            () => this.resize()
        );


        if (
            this.renderer
        ) {

            this.renderer.dispose();

        }


        if (
            this.floor
        ) {

            this.floor.geometry.dispose();

            this.floor.material.dispose();

        }


        if (
            this.grid
        ) {

            this.grid.geometry.dispose();

            this.grid.material.dispose();

        }


        if (
            this.viewport &&
            this.renderer.domElement.parentElement ===
            this.viewport
        ) {

            this.viewport.removeChild(
                this.renderer.domElement
            );

        }

    }

}
