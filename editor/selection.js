// editor/selection.js
// SFM-Web selection system

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class SelectionManager {

    constructor(
        sceneManager
    ) {

        this.sceneManager =
            sceneManager;

        this.renderer =
            sceneManager.renderer;

        this.camera =
            sceneManager.camera;

        this.selected = null;

        this.raycaster =
            new THREE.Raycaster();

        this.mouse =
            new THREE.Vector2();

        this.listeners = [];

        this.enabled = true;

        this.pointerDownHandler =
            this.onPointerDown.bind(
                this
            );

        this.renderer.domElement.addEventListener(
            "pointerdown",
            this.pointerDownHandler
        );
    }


    // =========================================
    // Select object
    // =========================================

    select(
        object
    ) {

        if (!object) {

            this.clear();

            return;

        }


        if (
            !this.sceneManager.objects.includes(
                object
            )
        ) {

            return;

        }


        this.selected =
            object;


        this.notify();

    }


    // =========================================
    // Clear selection
    // =========================================

    clear() {

        if (
            this.selected === null
        ) {

            return;

        }


        this.selected =
            null;


        this.notify();

    }


    // =========================================
    // Get selected object
    // =========================================

    getSelected() {

        return this.selected;

    }


    // =========================================
    // Check selection
    // =========================================

    isSelected(
        object
    ) {

        return (
            this.selected ===
            object
        );

    }


    // =========================================
    // Add selection listener
    // =========================================

    onSelectionChanged(
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {

            return () => {};

        }


        this.listeners.push(
            callback
        );


        return () => {

            const index =
                this.listeners.indexOf(
                    callback
                );

            if (
                index !== -1
            ) {

                this.listeners.splice(
                    index,
                    1
                );

            }

        };

    }


    // =========================================
    // Notify listeners
    // =========================================

    notify() {

        for (
            const callback
            of this.listeners
        ) {

            callback(
                this.selected
            );

        }

    }


    // =========================================
    // Pointer selection
    // =========================================

    onPointerDown(
        event
    ) {

        if (!this.enabled) {

            return;

        }


        // Don't select while using
        // the middle mouse button.

        if (
            event.button === 1
        ) {

            return;

        }


        const rect =
            this.renderer.domElement
                .getBoundingClientRect();


        this.mouse.x =
            (
                (event.clientX -
                    rect.left) /
                rect.width
            ) * 2 - 1;


        this.mouse.y =
            -(
                (event.clientY -
                    rect.top) /
                rect.height
            ) * 2 + 1;


        this.raycaster.setFromCamera(
            this.mouse,
            this.camera
        );


        const hits =
            this.raycaster.intersectObjects(
                this.sceneManager.objects,
                true
            );


        if (!hits.length) {

            this.clear();

            return;

        }


        let object =
            hits[0].object;


        // Walk up the hierarchy until
        // we reach an object registered
        // with SceneManager.

        while (
            object.parent &&
            !this.sceneManager.objects.includes(
                object
            )
        ) {

            object =
                object.parent;

        }


        if (
            this.sceneManager.objects.includes(
                object
            )
        ) {

            this.select(
                object
            );

        }
        else {

            this.clear();

        }

    }


    // =========================================
    // Enable selection
    // =========================================

    enable() {

        this.enabled =
            true;

    }


    // =========================================
    // Disable selection
    // =========================================

    disable() {

        this.enabled =
            false;

    }


    // =========================================
    // Dispose
    // =========================================

    dispose() {

        this.renderer.domElement.removeEventListener(
            "pointerdown",
            this.pointerDownHandler
        );


        this.listeners.length = 0;

        this.selected =
            null;

    }

}
