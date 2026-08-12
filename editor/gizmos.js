// editor/gizmos.js
// SFM-Web Transform Gizmos

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { TransformControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/TransformControls.js";


export class GizmoManager {

    constructor(
        scene,
        camera,
        renderer,
        cameraManager,
        selectionManager
    ) {

        this.scene =
            scene;

        this.camera =
            camera;

        this.renderer =
            renderer;

        this.cameraManager =
            cameraManager;

        this.selectionManager =
            selectionManager;


        this.mode =
            "translate";


        this.enabled =
            true;


        this.objectChangedCallback =
            null;


        // =================================================
        // TransformControls
        // =================================================

        this.controls =
            new TransformControls(
                camera,
                renderer.domElement
            );


        this.controls.setMode(
            this.mode
        );


        this.controls.setSize(
            0.9
        );


        this.scene.add(
            this.controls.getHelper()
        );


        // =================================================
        // Events
        // =================================================

        this.controls.addEventListener(
            "dragging-changed",
            event => {

                /*
                 * Disable editor camera controls while
                 * dragging a gizmo.
                 */

                if (
                    this.cameraManager
                ) {

                    this.cameraManager.enabled =
                        !event.value;

                }

            }
        );


        this.controls.addEventListener(
            "change",
            () => {

                if (
                    this.objectChangedCallback
                ) {

                    this.objectChangedCallback(
                        this.controls.object
                    );

                }

            }
        );


        // =================================================
        // Selection listener
        // =================================================

        this.selectionManager.onSelectionChanged(
            object => {

                this.attach(
                    object
                );

            }
        );

    }


    // =====================================================
    // Set transform mode
    // =====================================================

    setMode(
        mode
    ) {

        const allowed = [
            "translate",
            "rotate",
            "scale"
        ];


        if (
            !allowed.includes(
                mode
            )
        ) {

            return;

        }


        this.mode =
            mode;


        this.controls.setMode(
            mode
        );

    }


    // =====================================================
    // Get current mode
    // =====================================================

    getMode() {

        return this.mode;

    }


    // =====================================================
    // Attach to object
    // =====================================================

    attach(
        object
    ) {

        if (
            !this.enabled
        ) {

            return;

        }


        if (!object) {

            this.detach();

            return;

        }


        /*
         * Lights, meshes, models and groups can
         * all be manipulated.
         */

        this.controls.attach(
            object
        );


        this.controls.setMode(
            this.mode
        );

    }


    // =====================================================
    // Detach
    // =====================================================

    detach() {

        this.controls.detach();

    }


    // =====================================================
    // Enable
    // =====================================================

    setEnabled(
        enabled
    ) {

        this.enabled =
            Boolean(
                enabled
            );


        this.controls.enabled =
            this.enabled;


        if (
            !this.enabled
        ) {

            this.detach();

        }
        else {

            this.attach(
                this.selectionManager.getSelected()
            );

        }

    }


    // =====================================================
    // Is enabled
    // =====================================================

    isEnabled() {

        return this.enabled;

    }


    // =====================================================
    // Space
    // =====================================================

    setSpace(
        space
    ) {

        if (
            space !== "world" &&
            space !== "local"
        ) {

            return;

        }


        this.controls.setSpace(
            space
        );

    }


    // =====================================================
    // Get space
    // =====================================================

    getSpace() {

        return this.controls.space;

    }


    // =====================================================
    // Size
    // =====================================================

    setSize(
        size
    ) {

        this.controls.setSize(
            Math.max(
                0.1,
                Number(size) || 1
            )
        );

    }


    // =====================================================
    // Snapping
    // =====================================================

    setTranslationSnap(
        value
    ) {

        if (
            value === null ||
            value === undefined ||
            value <= 0
        ) {

            this.controls.setTranslationSnap(
                null
            );

            return;

        }


        this.controls.setTranslationSnap(
            value
        );

    }


    setRotationSnap(
        value
    ) {

        if (
            value === null ||
            value === undefined ||
            value <= 0
        ) {

            this.controls.setRotationSnap(
                null
            );

            return;

        }


        this.controls.setRotationSnap(
            THREE.MathUtils.degToRad(
                value
            )
        );

    }


    setScaleSnap(
        value
    ) {

        if (
            value === null ||
            value === undefined ||
            value <= 0
        ) {

            this.controls.setScaleSnap(
                null
            );

            return;

        }


        this.controls.setScaleSnap(
            value
        );

    }


    // =====================================================
    // Reset transform
    // =====================================================

    resetTransform() {

        const object =
            this.selectionManager.getSelected();


        if (!object)
            return;


        object.position.set(
            0,
            0,
            0
        );


        object.rotation.set(
            0,
            0,
            0
        );


        object.scale.set(
            1,
            1,
            1
        );


        if (
            this.objectChangedCallback
        ) {

            this.objectChangedCallback(
                object
            );

        }

    }


    // =====================================================
    // Focus selected object
    // =====================================================

    focusSelected() {

        const object =
            this.selectionManager.getSelected();


        if (
            object &&
            this.cameraManager
        ) {

            this.cameraManager.focusObject(
                object
            );

        }

    }


    // =====================================================
    // Object changed callback
    // =====================================================

    setObjectChangedCallback(
        callback
    ) {

        this.objectChangedCallback =
            typeof callback ===
            "function"
                ? callback
                : null;

    }


    // =====================================================
    // Get selected object
    // =====================================================

    getObject() {

        return this.controls.object ||
            null;

    }


    // =====================================================
    // Dispose
    // =====================================================

    dispose() {

        this.detach();


        if (
            this.controls.getHelper()
        ) {

            this.scene.remove(
                this.controls.getHelper()
            );

        }


        this.controls.dispose();

    }

}
