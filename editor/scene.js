// editor/scene.js
// SFM-Web scene manager

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class SceneManager {
    constructor(viewport) {
        this.viewport = viewport;
        this.objects = [];

        // -----------------------------------------
        // Scene
        // -----------------------------------------

        this.scene = new THREE.Scene();

        this.scene.background =
            new THREE.Color(0x101218);

        // -----------------------------------------
        // Camera
        // -----------------------------------------

        this.camera =
            new THREE.PerspectiveCamera(
                55,
                1,
                0.1,
                1000
            );

        this.camera.position.set(
            6,
            4,
            8
        );

        // -----------------------------------------
        // Renderer
        // -----------------------------------------

        this.renderer =
            new THREE.WebGLRenderer({
                antialias: true
            });

        this.renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                2
            )
        );

        this.renderer.shadowMap.enabled = true;

        this.viewport.appendChild(
            this.renderer.domElement
        );

        // -----------------------------------------
        // Lighting
        // -----------------------------------------

        this.setupLighting();

        // -----------------------------------------
        // Editor grid
        // -----------------------------------------

        this.grid =
            new THREE.GridHelper(
                30,
                30,
                0x4b515c,
                0x292d35
            );

        this.scene.add(
            this.grid
        );

        // -----------------------------------------
        // Resize
        // -----------------------------------------

        this.resize();

        this.resizeObserver =
            new ResizeObserver(
                () => this.resize()
            );

        this.resizeObserver.observe(
            this.viewport
        );
    }

    // =========================================
    // Lighting
    // =========================================

    setupLighting() {

        this.hemisphereLight =
            new THREE.HemisphereLight(
                0xb9c7ff,
                0x222222,
                2
            );

        this.scene.add(
            this.hemisphereLight
        );


        this.keyLight =
            new THREE.DirectionalLight(
                0xffffff,
                3
            );

        this.keyLight.position.set(
            5,
            8,
            5
        );

        this.keyLight.castShadow = true;

        this.scene.add(
            this.keyLight
        );
    }

    // =========================================
    // Add object
    // =========================================

    addObject(
        object,
        name = "Object"
    ) {

        object.name = name;

        object.userData.editorObject = true;

        this.scene.add(
            object
        );

        this.objects.push(
            object
        );

        return object;
    }

    // =========================================
    // Remove object
    // =========================================

    removeObject(
        object
    ) {

        if (!object)
            return;

        this.scene.remove(
            object
        );

        const index =
            this.objects.indexOf(
                object
            );

        if (index !== -1) {

            this.objects.splice(
                index,
                1
            );

        }

        // Dispose geometry/materials
        object.traverse(
            child => {

                if (child.geometry) {

                    child.geometry.dispose();

                }

                if (child.material) {

                    const materials =
                        Array.isArray(
                            child.material
                        )
                            ? child.material
                            : [child.material];

                    for (
                        const material
                        of materials
                    ) {

                        material.dispose();

                    }

                }

            }
        );
    }

    // =========================================
    // Clear scene objects
    // =========================================

    clearObjects() {

        for (
            const object
            of [...this.objects]
        ) {

            this.removeObject(
                object
            );

        }
    }

    // =========================================
    // Create cube
    // =========================================

    createCube(
        name = "Cube"
    ) {

        const geometry =
            new THREE.BoxGeometry(
                1.5,
                1.5,
                1.5
            );

        const material =
            new THREE.MeshStandardMaterial({
                color: 0x7b8cff,
                roughness: 0.65
            });

        const cube =
            new THREE.Mesh(
                geometry,
                material
            );

        cube.position.y =
            0.75;

        cube.castShadow = true;

        cube.receiveShadow = true;

        return this.addObject(
            cube,
            name
        );
    }

    // =========================================
    // Create point light
    // =========================================

    createLight(
        name = "Light"
    ) {

        const light =
            new THREE.PointLight(
                0xffddaa,
                30,
                15
            );

        light.position.set(
            2,
            4,
            2
        );

        // Small editor marker
        const marker =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.12
                ),
                new THREE.MeshBasicMaterial({
                    color: 0xffddaa
                })
            );

        marker.userData.editorMarker = true;

        light.add(
            marker
        );

        return this.addObject(
            light,
            name
        );
    }

    // =========================================
    // Find object
    // =========================================

    findObject(
        name
    ) {

        return this.objects.find(
            object =>
                object.name === name
        );
    }

    // =========================================
    // Resize renderer
    // =========================================

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
            width / height;

        this.camera.updateProjectionMatrix();

        this.renderer.setSize(
            width,
            height,
            false
        );
    }

    // =========================================
    // Render
    // =========================================

    render() {

        this.renderer.render(
            this.scene,
            this.camera
        );
    }

    // =========================================
    // Dispose
    // =========================================

    dispose() {

        this.resizeObserver.disconnect();

        this.clearObjects();

        this.renderer.dispose();

        this.viewport.removeChild(
            this.renderer.domElement
        );
    }
}
