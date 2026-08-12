// editor/scene.js
// SFM-Web Scene Manager

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


export class SceneManager {

    constructor(
        viewport
    ) {

        this.viewport =
            viewport;

        this.objects =
            [];

        this.scene =
            new THREE.Scene();


        // =================================================
        // Scene appearance
        // =================================================

        this.scene.background =
            new THREE.Color(
                0x111315
            );


        // =================================================
        // Renderer
        // =================================================

        this.renderer =
            new THREE.WebGLRenderer({

                antialias: true

            });


        this.renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                2
            )
        );


        this.renderer.setSize(
            viewport.clientWidth,
            viewport.clientHeight
        );


        this.renderer.shadowMap.enabled =
            true;


        this.renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;


        viewport.appendChild(
            this.renderer.domElement
        );


        // =================================================
        // Camera
        // =================================================

        this.camera =
            new THREE.PerspectiveCamera(

                60,

                viewport.clientWidth /
                Math.max(
                    viewport.clientHeight,
                    1
                ),

                0.1,

                5000

            );


        this.camera.position.set(
            8,
            6,
            10
        );


        this.camera.lookAt(
            0,
            0,
            0
        );


        // =================================================
        // Lighting
        // =================================================

        this.createDefaultLights();


        // =================================================
        // Grid
        // =================================================

        this.grid =
            new THREE.GridHelper(
                100,
                100
            );


        this.scene.add(
            this.grid
        );


        // =================================================
        // Axis helper
        // =================================================

        this.axes =
            new THREE.AxesHelper(
                5
            );


        this.scene.add(
            this.axes
        );


        // =================================================
        // Resize
        // =================================================

        this.resizeObserver =
            new ResizeObserver(
                () => {

                    this.resize();

                }
            );


        this.resizeObserver.observe(
            viewport
        );

    }


    // =====================================================
    // Default lights
    // =====================================================

    createDefaultLights() {

        const ambient =
            new THREE.HemisphereLight(

                0xffffff,
                0x333333,
                2

            );


        ambient.name =
            "Ambient Light";


        this.scene.add(
            ambient
        );


        const key =
            new THREE.DirectionalLight(

                0xffffff,
                3

            );


        key.name =
            "Key Light";


        key.position.set(
            5,
            10,
            5
        );


        key.castShadow =
            true;


        key.shadow.mapSize.width =
            2048;


        key.shadow.mapSize.height =
            2048;


        key.shadow.camera.near =
            0.1;


        key.shadow.camera.far =
            100;


        this.scene.add(
            key
        );

    }


    // =====================================================
    // Create cube
    // =====================================================

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

                color: 0x6688cc,

                roughness: 0.65,

                metalness: 0.05

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


        this.addObject(
            cube
        );


        return cube;

    }


    // =====================================================
    // Create sphere
    // =====================================================

    createSphere(
        name = "Sphere"
    ) {

        const geometry =
            new THREE.SphereGeometry(
                0.75,
                32,
                20
            );


        const material =
            new THREE.MeshStandardMaterial({

                color: 0xcc8866,

                roughness: 0.6

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


        this.addObject(
            sphere
        );


        return sphere;

    }


    // =====================================================
    // Create light
    // =====================================================

    createLight(
        name = "Light"
    ) {

        const light =
            new THREE.PointLight(

                0xffffff,

                50,

                50

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


        this.addObject(
            light
        );


        /*
         * Add a visible helper so the
         * light can be seen in the editor.
         */

        const helper =
            new THREE.PointLightHelper(
                light,
                0.25
            );


        helper.name =
            `${name}_Helper`;


        light.userData.helper =
            helper;


        this.scene.add(
            helper
        );


        return light;

    }


    // =====================================================
    // Add existing object
    // =====================================================

    addObject(
        object,
        name = null
    ) {

        if (!object)
            return null;


        if (name) {

            object.name =
                name;

        }


        this.scene.add(
            object
        );


        if (
            !this.objects.includes(
                object
            )
        ) {

            this.objects.push(
                object
            );

        }


        return object;

    }


    // =====================================================
    // Remove object
    // =====================================================

    removeObject(
        object
    ) {

        if (!object)
            return;


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


        /*
         * Remove helper if this
         * object owns one.
         */

        if (
            object.userData &&
            object.userData.helper
        ) {

            this.scene.remove(
                object.userData.helper
            );

        }


        this.scene.remove(
            object
        );


        this.disposeObject(
            object
        );

    }


    // =====================================================
    // Dispose object resources
    // =====================================================

    disposeObject(
        object
    ) {

        if (!object)
            return;


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

                    if (
                        Array.isArray(
                            child.material
                        )
                    ) {

                        child.material.forEach(
                            material =>
                                this.disposeMaterial(
                                    material
                                )
                        );

                    }
                    else {

                        this.disposeMaterial(
                            child.material
                        );

                    }

                }

            }
        );

    }


    // =====================================================
    // Dispose material
    // =====================================================

    disposeMaterial(
        material
    ) {

        if (!material)
            return;


        for (
            const key
            of Object.keys(
                material
            )
        ) {

            const value =
                material[key];


            if (
                value &&
                value.isTexture
            ) {

                value.dispose();

            }

        }


        material.dispose();

    }


    // =====================================================
    // Clear objects
    // =====================================================

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

    }


    // =====================================================
    // Find object by UUID
    // =====================================================

    getObjectByUUID(
        uuid
    ) {

        return this.objects.find(
            object =>
                object.uuid ===
                uuid
        ) || null;

    }


    // =====================================================
    // Find object by name
    // =====================================================

    getObjectByName(
        name
    ) {

        return this.objects.find(
            object =>
                object.name ===
                name
        ) || null;

    }


    // =====================================================
    // Get all objects
    // =====================================================

    getObjects() {

        return this.objects;

    }


    // =====================================================
    // Resize renderer
    // =====================================================

    resize() {

        if (!this.viewport)
            return;


        const width =
            Math.max(
                this.viewport.clientWidth,
                1
            );


        const height =
            Math.max(
                this.viewport.clientHeight,
                1
            );


        this.camera.aspect =
            width / height;


        this.camera.updateProjectionMatrix();


        this.renderer.setSize(
            width,
            height,
            false
        );

    }


    // =====================================================
    // Render
    // =====================================================

    render() {

        this.renderer.render(
            this.scene,
            this.camera
        );

    }


    // =====================================================
    // Get scene
    // =====================================================

    getScene() {

        return this.scene;

    }


    // =====================================================
    // Get camera
    // =====================================================

    getCamera() {

        return this.camera;

    }


    // =====================================================
    // Set grid visibility
    // =====================================================

    setGridVisible(
        visible
    ) {

        this.grid.visible =
            Boolean(
                visible
            );

    }


    // =====================================================
    // Set axes visibility
    // =====================================================

    setAxesVisible(
        visible
    ) {

        this.axes.visible =
            Boolean(
                visible
            );

    }


    // =====================================================
    // Cleanup
    // =====================================================

    destroy() {

        this.clearObjects();


        if (
            this.resizeObserver
        ) {

            this.resizeObserver.disconnect();

        }


        this.renderer.dispose();


        if (
            this.renderer.domElement.parentNode
        ) {

            this.renderer.domElement.parentNode.removeChild(
                this.renderer.domElement
            );

        }

    }

}
