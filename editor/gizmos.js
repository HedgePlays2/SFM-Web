// editor/gizmos.js
// SFM-Web transform gizmo system

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { TransformControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/TransformControls.js";

export class GizmoManager {

    constructor(
        camera,
        renderer,
        cameraManager,
        selectionManager
    ) {

        this.camera = camera;
        this.renderer = renderer;
        this.cameraManager = cameraManager;
        this.selectionManager = selectionManager;

        this.controls =
            new TransformControls(
                camera,
                renderer.domElement
            );

        this.controls.setMode(
            "translate"
        );

        this.controls.setSpace(
            "world"
        );

        this.controls.setSize(
            0.9
        );

        this.controls.addEventListener(
            "dragging-changed",
            event => {

                this.cameraManager.controls.enabled =
                    !event.value;

            }
        );

        this.controls.addEventListener(
            "objectChange",
            () => {

                if (
                    this.onObjectChanged
                ) {

                    this.onObjectChanged(
                        this.controls.object
                    );

                }

            }
        );

        this.selectionUnsubscribe =
            this.selectionManager.onSelectionChanged(
                object => {

                    this.attach(
                        object
                    );

                }
            );

        this.renderer.domElement.parentElement.appendChild(
            this.controls.domElement
        );
    }


    // =========================================
    // Attach to selected object
    // =========================================

    attach(
        object
    ) {

        if (!object) {

            this.controls.detach();

            return;

        }

        this.controls.attach(
            object
        );
    }


    // =========================================
    // Detach
    // =========================================

    detach() {

        this.controls.detach();

    }


    // =========================================
    // Set transform mode
    // =========================================

    setMode(
        mode
    ) {

        if (
            mode !== "translate" &&
            mode !== "rotate" &&
            mode !== "scale"
        ) {

            return;

        }

        this.controls.setMode(
            mode
        );

    }


    // =========================================
    // Get mode
    // =========================================

    getMode() {

        return this.controls.getMode();

    }


    // =========================================
    // Toggle world/local space
    // =========================================

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


    // =========================================
    // Toggle visibility
    // =========================================

    setVisible(
        visible
    ) {

        this.controls.visible =
            visible;

    }


    // =========================================
    // Change gizmo size
    // =========================================

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


    // =========================================
    // Object changed callback
    // =========================================

    setObjectChangedCallback(
        callback
    ) {

        this.onObjectChanged =
            typeof callback === "function"
                ? callback
                : null;

    }


    // =========================================
    // Dispose
    // =========================================

    dispose() {

        if (
            this.selectionUnsubscribe
        ) {

            this.selectionUnsubscribe();

        }

        this.controls.dispose();

    }

}
