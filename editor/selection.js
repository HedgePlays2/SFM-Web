// editor/selection.js
// SFM-Web Object Selection System

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


export class SelectionManager {

    constructor(
        sceneManager
    ) {

        this.sceneManager =
            sceneManager;

        this.camera =
            sceneManager.camera;

        this.renderer =
            sceneManager.renderer;

        this.canvas =
            this.renderer.domElement;


        this.raycaster =
            new THREE.Raycaster();

        this.mouse =
            new THREE.Vector2();


        this.selected =
            null;

        this.previousSelected =
            null;


        this.highlight =
            null;


        this.onSelectionChangedCallback =
            null;


        this.pointerDownX =
            0;

        this.pointerDownY =
            0;


        this.setupMouse();

    }


    // =====================================================
    // Mouse setup
    // =====================================================

    setupMouse() {

        this.canvas.addEventListener(
            "pointerdown",
            event => {

                this.pointerDownX =
                    event.clientX;

                this.pointerDownY =
                    event.clientY;

            }
        );


        this.canvas.addEventListener(
            "pointerup",
            event => {

                const dx =
                    Math.abs(
                        event.clientX -
                        this.pointerDownX
                    );


                const dy =
                    Math.abs(
                        event.clientY -
                        this.pointerDownY
                    );


                /*
                 * Don't select an object if the
                 * mouse was being used to orbit/pan.
                 */

                if (
                    dx > 5 ||
                    dy > 5
                ) {

                    return;

                }


                /*
                 * Right and middle mouse are
                 * camera controls.
                 */

                if (
                    event.button !== 0
                ) {

                    return;

                }


                this.selectAtPointer(
                    event
                );

            }
        );


        window.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    this.clear();

                }

            }
        );

    }


    // =====================================================
    // Convert mouse position to NDC
    // =====================================================

    updateMouse(
        event
    ) {

        const rect =
            this.canvas.getBoundingClientRect();


        this.mouse.x =
            (
                (
                    event.clientX -
                    rect.left
                ) /
                rect.width
            ) *
            2 -
            1;


        this.mouse.y =
            -(
                (
                    event.clientY -
                    rect.top
                ) /
                rect.height
            ) *
            2 +
            1;

    }


    // =====================================================
    // Raycast
    // =====================================================

    raycast(
        event
    ) {

        this.updateMouse(
            event
        );


        this.raycaster.setFromCamera(
            this.mouse,
            this.camera
        );


        const objects =
            this.sceneManager.objects;


        const meshes = [];


        for (
            const object
            of objects
        ) {

            object.traverse(
                child => {

                    if (
                        child.isMesh
                    ) {

                        meshes.push(
                            child
                        );

                    }

                }
            );

        }


        return this.raycaster.intersectObjects(
            meshes,
            false
        );

    }


    // =====================================================
    // Select object at pointer
    // =====================================================

    selectAtPointer(
        event
    ) {

        const hits =
            this.raycast(
                event
            );


        if (
            hits.length === 0
        ) {

            this.clear();

            return null;

        }


        const object =
            this.findSelectableRoot(
                hits[0].object
            );


        if (!object) {

            this.clear();

            return null;

        }


        this.select(
            object
        );


        return object;

    }


    // =====================================================
    // Find selectable root
    // =====================================================

    findSelectableRoot(
        object
    ) {

        if (!object)
            return null;


        let current =
            object;


        /*
         * Walk upward until we find one
         * of the objects registered with
         * SceneManager.
         */

        while (
            current &&
            current !== this.sceneManager.scene
        ) {

            if (
                this.sceneManager.objects.includes(
                    current
                )
            ) {

                return current;

            }


            current =
                current.parent;

        }


        /*
         * If it isn't registered directly,
         * return the top-level object.
         */

        return object;

    }


    // =====================================================
    // Select
    // =====================================================

    select(
        object
    ) {

        if (!object) {

            this.clear();

            return;

        }


        if (
            this.selected ===
            object
        ) {

            this.updateHighlight();

            return;

        }


        this.previousSelected =
            this.selected;


        this.removeHighlight();


        this.selected =
            object;


        this.addHighlight();


        this.emitSelectionChanged();

    }


    // =====================================================
    // Clear selection
    // =====================================================

    clear() {

        if (
            this.selected ===
            null
        ) {

            return;

        }


        this.previousSelected =
            this.selected;


        this.removeHighlight();


        this.selected =
            null;


        this.emitSelectionChanged();

    }


    // =====================================================
    // Get selected object
    // =====================================================

    getSelected() {

        return this.selected;

    }


    // =====================================================
    // Get previous selection
    // =====================================================

    getPreviousSelected() {

        return this.previousSelected;

    }


    // =====================================================
    // Is selected?
    // =====================================================

    isSelected(
        object
    ) {

        return (
            this.selected ===
            object
        );

    }


    // =====================================================
    // Highlight
    // =====================================================

    addHighlight() {

        if (!this.selected)
            return;


        /*
         * Use a BoxHelper rather than changing
         * the model's materials.
         */

        this.highlight =
            new THREE.BoxHelper(
                this.selected,
                0xffff00
            );


        this.highlight.name =
            "__SFM_SELECTION__";


        this.sceneManager.scene.add(
            this.highlight
        );

    }


    // =====================================================
    // Remove highlight
    // =====================================================

    removeHighlight() {

        if (
            !this.highlight
        ) {

            return;

        }


        this.sceneManager.scene.remove(
            this.highlight
        );


        this.highlight.geometry.dispose();


        if (
            this.highlight.material
        ) {

            this.highlight.material.dispose();

        }


        this.highlight =
            null;

    }


    // =====================================================
    // Update highlight
    // =====================================================

    updateHighlight() {

        if (
            !this.highlight
        ) {

            if (
                this.selected
            ) {

                this.addHighlight();

            }

            return;

        }


        this.highlight.update();

    }


    // =====================================================
    // Selection callback
    // =====================================================

    onSelectionChanged(
        callback
    ) {

        this.onSelectionChangedCallback =
            typeof callback ===
            "function"
                ? callback
                : null;

    }


    // =====================================================
    // Emit selection changed
    // =====================================================

    emitSelectionChanged() {

        if (
            this.onSelectionChangedCallback
        ) {

            this.onSelectionChangedCallback(
                this.selected,
                this.previousSelected
            );

        }

    }


    // =====================================================
    // Select by UUID
    // =====================================================

    selectByUUID(
        uuid
    ) {

        const object =
            this.sceneManager.getObjectByUUID(
                uuid
            );


        if (object) {

            this.select(
                object
            );

        }
        else {

            this.clear();

        }


        return object;

    }


    // =====================================================
    // Select by name
    // =====================================================

    selectByName(
        name
    ) {

        const object =
            this.sceneManager.getObjectByName(
                name
            );


        if (object) {

            this.select(
                object
            );

        }
        else {

            this.clear();

        }


        return object;

    }


    // =====================================================
    // Refresh
    // =====================================================

    refresh() {

        if (
            this.selected &&
            !this.sceneManager.objects.includes(
                this.selected
            )
        ) {

            this.clear();

            return;

        }


        this.updateHighlight();

    }


    // =====================================================
    // Cleanup
    // =====================================================

    destroy() {

        this.removeHighlight();

        this.selected =
            null;

        this.previousSelected =
            null;

    }

}
