// ============================================================
// SFM-WEB
// Main Application
// ============================================================

import { SceneManager } from "./editor/scene.js";
import { CameraManager } from "./editor/camera.js";
import { SelectionManager } from "./editor/selection.js";
import { GizmoManager } from "./editor/gizmos.js";
import { PropertiesManager } from "./editor/properties.js";


// ============================================================
// Application
// ============================================================

class SFMApp {

    constructor() {

        this.viewport =
            document.querySelector("#viewport");

        this.outliner =
            document.querySelector("#outliner");

        this.properties =
            document.querySelector("#properties");

        this.status =
            document.querySelector("#status");


        if (!this.viewport) {

            throw new Error(
                "SFM-Web: #viewport was not found."
            );

        }


        // ====================================================
        // Scene
        // ====================================================

        this.sceneManager =
            new SceneManager(
                this.viewport
            );


        // ====================================================
        // Camera
        // ====================================================

        this.cameraManager =
            new CameraManager(
                this.sceneManager.camera,
                this.sceneManager.renderer
            );


        // ====================================================
        // Selection
        // ====================================================

        this.selectionManager =
            new SelectionManager(
                this.sceneManager
            );


        // ====================================================
        // Gizmos
        // ====================================================

        this.gizmoManager =
            new GizmoManager(
                this.sceneManager.scene,
                this.sceneManager.camera,
                this.sceneManager.renderer,
                this.cameraManager,
                this.selectionManager
            );


        // ====================================================
        // Properties
        // ====================================================

        this.propertiesManager =
            new PropertiesManager(
                this.properties,
                this.selectionManager,
                this.cameraManager,
                this.sceneManager
            );


        // ====================================================
        // Connect selection → properties
        // ====================================================

        this.selectionManager.onSelectionChanged(
            () => {

                this.propertiesManager.refresh();

                this.updateOutliner();

                this.updateStatus();

            }
        );


        // ====================================================
        // Connect gizmo → properties
        // ====================================================

        this.gizmoManager.setObjectChangedCallback(
            () => {

                this.propertiesManager.refresh();

                this.updateStatus();

            }
        );


        // ====================================================
        // Buttons
        // ====================================================

        this.setupButtons();


        // ====================================================
        // Keyboard
        // ====================================================

        this.setupKeyboard();


        // ====================================================
        // Create starting scene
        // ====================================================

        this.createDefaultScene();


        // ====================================================
        // Start
        // ====================================================

        this.updateOutliner();

        this.updateStatus();

        this.animate();

    }


    // =========================================================
    // Default scene
    // =========================================================

    createDefaultScene() {

        const cube =
            this.sceneManager.createCube(
                "Cube"
            );


        cube.position.set(
            0,
            0.5,
            0
        );


        const light =
            this.sceneManager.createLight(
                "Scene Light"
            );


        light.position.set(
            3,
            5,
            3
        );


        this.selectionManager.select(
            cube
        );


        this.cameraManager.focusObject(
            cube
        );

    }


    // =========================================================
    // Buttons
    // =========================================================

    setupButtons() {

        // -----------------------------------------------------
        // Move
        // -----------------------------------------------------

        this.bindButton(
            "#moveTool",
            () => {

                this.gizmoManager.setMode(
                    "translate"
                );

                this.setStatus(
                    "Move tool"
                );

            }
        );


        // -----------------------------------------------------
        // Rotate
        // -----------------------------------------------------

        this.bindButton(
            "#rotateTool",
            () => {

                this.gizmoManager.setMode(
                    "rotate"
                );

                this.setStatus(
                    "Rotate tool"
                );

            }
        );


        // -----------------------------------------------------
        // Scale
        // -----------------------------------------------------

        this.bindButton(
            "#scaleTool",
            () => {

                this.gizmoManager.setMode(
                    "scale"
                );

                this.setStatus(
                    "Scale tool"
                );

            }
        );


        // -----------------------------------------------------
        // Add cube
        // -----------------------------------------------------

        this.bindButton(
            "#addCube",
            () => {

                const cube =
                    this.sceneManager.createCube(
                        `Cube ${this.sceneManager.objects.length + 1}`
                    );


                cube.position.set(
                    0,
                    0.5,
                    0
                );


                this.selectionManager.select(
                    cube
                );


                this.updateOutliner();

            }
        );


        // -----------------------------------------------------
        // Add sphere
        // -----------------------------------------------------

        this.bindButton(
            "#addSphere",
            () => {

                const sphere =
                    this.sceneManager.createSphere(
                        `Sphere ${this.sceneManager.objects.length + 1}`
                    );


                sphere.position.set(
                    0,
                    0.75,
                    0
                );


                this.selectionManager.select(
                    sphere
                );


                this.updateOutliner();

            }
        );


        // -----------------------------------------------------
        // Add light
        // -----------------------------------------------------

        this.bindButton(
            "#addLight",
            () => {

                const light =
                    this.sceneManager.createLight(
                        `Light ${this.sceneManager.objects.length + 1}`
                    );


                this.selectionManager.select(
                    light
                );


                this.updateOutliner();

            }
        );


        // -----------------------------------------------------
        // Delete
        // -----------------------------------------------------

        this.bindButton(
            "#deleteObject",
            () => {

                const object =
                    this.selectionManager.getSelected();


                if (!object) {

                    return;

                }


                this.selectionManager.clear();


                this.sceneManager.removeObject(
                    object
                );


                this.updateOutliner();

                this.propertiesManager.refresh();

            }
        );


        // -----------------------------------------------------
        // Focus
        // -----------------------------------------------------

        this.bindButton(
            "#focusObject",
            () => {

                const object =
                    this.selectionManager.getSelected();


                if (object) {

                    this.cameraManager.focusObject(
                        object
                    );

                }

            }
        );


        // -----------------------------------------------------
        // Reset camera
        // -----------------------------------------------------

        this.bindButton(
            "#resetCamera",
            () => {

                this.cameraManager.reset();

                this.setStatus(
                    "Camera reset"
                );

            }
        );


        // -----------------------------------------------------
        // Clear scene
        // -----------------------------------------------------

        this.bindButton(
            "#clearScene",
            () => {

                this.selectionManager.clear();

                this.sceneManager.clearObjects();

                this.updateOutliner();

                this.propertiesManager.refresh();

                this.setStatus(
                    "Scene cleared"
                );

            }
        );

    }


    // =========================================================
    // Bind button helper
    // =========================================================

    bindButton(
        selector,
        callback
    ) {

        const element =
            document.querySelector(
                selector
            );


        if (!element) {

            return;

        }


        element.addEventListener(
            "click",
            callback
        );

    }


    // =========================================================
    // Keyboard
    // =========================================================

    setupKeyboard() {

        window.addEventListener(
            "keydown",
            event => {

                /*
                 * Don't trigger editor shortcuts while
                 * typing into an input.
                 */

                if (
                    event.target instanceof
                    HTMLInputElement ||
                    event.target instanceof
                    HTMLTextAreaElement
                ) {

                    return;

                }


                switch (
                    event.key.toLowerCase()
                ) {

                    case "w":

                        this.gizmoManager.setMode(
                            "translate"
                        );

                        break;


                    case "e":

                        this.gizmoManager.setMode(
                            "rotate"
                        );

                        break;


                    case "r":

                        this.gizmoManager.setMode(
                            "scale"
                        );

                        break;


                    case "f":

                        this.cameraManager.focusObject(
                            this.selectionManager.getSelected()
                        );

                        break;


                    case "delete":

                        this.deleteSelected();

                        break;

                }

            }
        );

    }


    // =========================================================
    // Delete selected
    // =========================================================

    deleteSelected() {

        const object =
            this.selectionManager.getSelected();


        if (!object) {

            return;

        }


        this.selectionManager.clear();

        this.sceneManager.removeObject(
            object
        );


        this.updateOutliner();

        this.propertiesManager.refresh();

    }


    // =========================================================
    // Outliner
    // =========================================================

    updateOutliner() {

        if (!this.outliner) {

            return;

        }


        this.outliner.innerHTML =
            "";


        const selected =
            this.selectionManager.getSelected();


        for (
            const object
            of this.sceneManager.objects
        ) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "tree-item";


            if (
                object === selected
            ) {

                item.classList.add(
                    "selected"
                );

            }


            item.textContent =
                object.name ||
                "Object";


            item.addEventListener(
                "click",
                () => {

                    this.selectionManager.select(
                        object
                    );

                }
            );


            this.outliner.appendChild(
                item
            );

        }

    }


    // =========================================================
    // Status
    // =========================================================

    updateStatus() {

        const object =
            this.selectionManager.getSelected();


        if (!object) {

            this.setStatus(
                "No object selected"
            );

            return;

        }


        this.setStatus(
            `Selected: ${object.name}`
        );

    }


    setStatus(
        text
    ) {

        if (this.status) {

            this.status.textContent =
                text;

        }

    }


    // =========================================================
    // Render loop
    // =========================================================

    animate() {

        requestAnimationFrame(
            () => this.animate()
        );


        this.selectionManager.refresh();


        this.sceneManager.render();

    }

}


// ============================================================
// Start application
// ============================================================

function startSFM() {

    try {

        window.sfm =
            new SFMApp();


        console.log(
            "SFM-Web initialized."
        );

    }
    catch (error) {

        console.error(
            "SFM-Web failed to initialize:",
            error
        );

    }

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startSFM
    );

}
else {

    startSFM();

}
