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
// Error display
// ============================================================

function showError(error) {

    console.error(error);

    const status =
        document.querySelector("#status");

    if (status) {

        status.textContent =
            "ERROR: " +
            (
                error?.message ||
                String(error)
            );

        status.style.color =
            "#ff5555";

    }

}


// Catch normal JavaScript errors
window.addEventListener(
    "error",
    event => {

        showError(
            event.error ||
            new Error(event.message)
        );

    }
);


// Catch failed promises
window.addEventListener(
    "unhandledrejection",
    event => {

        showError(
            event.reason
        );

    }
);


// ============================================================
// SFM Application
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
                "Viewport element #viewport was not found."
            );

        }


        // =====================================================
        // Scene
        // =====================================================

        this.sceneManager =
            new SceneManager(
                this.viewport
            );


        if (!this.sceneManager) {

            throw new Error(
                "SceneManager failed to initialize."
            );

        }


        // =====================================================
        // Camera
        // =====================================================

        this.cameraManager =
            new CameraManager(
                this.sceneManager.camera,
                this.sceneManager.renderer
            );


        // =====================================================
        // Selection
        // =====================================================

        this.selectionManager =
            new SelectionManager(
                this.sceneManager
            );


        // =====================================================
        // Gizmos
        // =====================================================

        this.gizmoManager =
            new GizmoManager(
                this.sceneManager.scene,
                this.sceneManager.camera,
                this.sceneManager.renderer,
                this.cameraManager,
                this.selectionManager
            );


        // =====================================================
        // Properties
        // =====================================================

        this.propertiesManager =
            new PropertiesManager(
                this.properties,
                this.selectionManager,
                this.cameraManager,
                this.sceneManager
            );


        // =====================================================
        // Connect systems
        // =====================================================

        this.selectionManager.onSelectionChanged(
            () => {

                this.propertiesManager.refresh();

                this.updateOutliner();

                this.updateStatus();

            }
        );


        this.gizmoManager.setObjectChangedCallback(
            () => {

                this.propertiesManager.refresh();

                this.updateStatus();

            }
        );


        // =====================================================
        // Setup UI
        // =====================================================

        this.setupButtons();

        this.setupKeyboard();


        // =====================================================
        // Create starting scene
        // =====================================================

        this.createDefaultScene();


        // =====================================================
        // Initial UI
        // =====================================================

        this.updateOutliner();

        this.updateStatus();


        // =====================================================
        // Start rendering
        // =====================================================

        this.animate();

    }


    // =========================================================
    // Create default scene
    // =========================================================

    createDefaultScene() {

        // -----------------------------------------------------
        // Cube
        // -----------------------------------------------------

        if (
            typeof this.sceneManager.createCube ===
            "function"
        ) {

            const cube =
                this.sceneManager.createCube(
                    "Cube"
                );


            cube.position.set(
                0,
                0.5,
                0
            );


            this.selectionManager.select(
                cube
            );

        }


        // -----------------------------------------------------
        // Light
        // -----------------------------------------------------

        if (
            typeof this.sceneManager.createLight ===
            "function"
        ) {

            const light =
                this.sceneManager.createLight(
                    "Scene Light"
                );


            light.position.set(
                3,
                5,
                3
            );

        }


        // -----------------------------------------------------
        // Camera
        // -----------------------------------------------------

        const selected =
            this.selectionManager.getSelected();


        if (selected) {

            this.cameraManager.focusObject(
                selected
            );

        }
        else {

            this.cameraManager.reset();

        }

    }


    // =========================================================
    // Buttons
    // =========================================================

    setupButtons() {

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


        // =====================================================
        // Add Cube
        // =====================================================

        this.bindButton(
            "#addCube",
            () => {

                if (
                    typeof this.sceneManager.createCube !==
                    "function"
                ) {

                    return;

                }


                const cube =
                    this.sceneManager.createCube(
                        "Cube"
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


        // =====================================================
        // Add Sphere
        // =====================================================

        this.bindButton(
            "#addSphere",
            () => {

                if (
                    typeof this.sceneManager.createSphere !==
                    "function"
                ) {

                    return;

                }


                const sphere =
                    this.sceneManager.createSphere(
                        "Sphere"
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


        // =====================================================
        // Add Light
        // =====================================================

        this.bindButton(
            "#addLight",
            () => {

                if (
                    typeof this.sceneManager.createLight !==
                    "function"
                ) {

                    return;

                }


                const light =
                    this.sceneManager.createLight(
                        "Light"
                    );


                this.selectionManager.select(
                    light
                );


                this.updateOutliner();

            }
        );


        // =====================================================
        // Delete
        // =====================================================

        this.bindButton(
            "#deleteObject",
            () => {

                this.deleteSelected();

            }
        );


        // =====================================================
        // Focus
        // =====================================================

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


        // =====================================================
        // Reset Camera
        // =====================================================

        this.bindButton(
            "#resetCamera",
            () => {

                this.cameraManager.reset();

                this.setStatus(
                    "Camera reset"
                );

            }
        );


        // =====================================================
        // Clear Scene
        // =====================================================

        this.bindButton(
            "#clearScene",
            () => {

                this.selectionManager.clear();


                if (
                    typeof this.sceneManager.clearObjects ===
                    "function"
                ) {

                    this.sceneManager.clearObjects();

                }


                this.updateOutliner();

                this.propertiesManager.refresh();

                this.setStatus(
                    "Scene cleared"
                );

            }
        );

    }


    // =========================================================
    // Button helper
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

                const target =
                    event.target;


                if (
                    target instanceof
                    HTMLInputElement ||
                    target instanceof
                    HTMLTextAreaElement
                ) {

                    return;

                }


                switch (
                    event.key.toLowerCase()
                ) {

                    // Move
                    case "w":

                        this.gizmoManager.setMode(
                            "translate"
                        );

                        break;


                    // Rotate
                    case "e":

                        this.gizmoManager.setMode(
                            "rotate"
                        );

                        break;


                    // Scale
                    case "r":

                        this.gizmoManager.setMode(
                            "scale"
                        );

                        break;


                    // Focus
                    case "f":

                        {

                            const object =
                                this.selectionManager.getSelected();


                            if (object) {

                                this.cameraManager.focusObject(
                                    object
                                );

                            }

                        }

                        break;


                    // Delete
                    case "delete":

                        this.deleteSelected();

                        break;


                    // Escape
                    case "escape":

                        this.selectionManager.clear();

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


        if (
            typeof this.sceneManager.removeObject ===
            "function"
        ) {

            this.sceneManager.removeObject(
                object
            );

        }


        this.updateOutliner();

        this.propertiesManager.refresh();

        this.setStatus(
            "Object deleted"
        );

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


        const objects =
            this.sceneManager.objects ||
            [];


        for (
            const object
            of objects
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
                object.type ||
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
            `Selected: ${object.name || object.type}`
        );

    }


    setStatus(
        text
    ) {

        if (!this.status) {

            return;

        }


        this.status.textContent =
            text;


        this.status.style.color =
            "";

    }


    // =========================================================
    // Render loop
    // =========================================================

    animate() {

        requestAnimationFrame(
            () => this.animate()
        );


        if (
            this.selectionManager
        ) {

            this.selectionManager.refresh();

        }


        if (
            this.sceneManager &&
            typeof this.sceneManager.render ===
            "function"
        ) {

            this.sceneManager.render();

        }

    }

}


// ============================================================
// Start
// ============================================================

function startSFM() {

    try {

        window.sfm =
            new SFMApp();


        const status =
            document.querySelector(
                "#status"
            );


        if (status) {

            status.textContent =
                "SFM-Web ready";

            status.style.color =
                "";

        }


        console.log(
            "SFM-Web initialized successfully."
        );

    }
    catch (error) {

        showError(
            error
        );

    }

}


// ============================================================
// Start after DOM
// ============================================================

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
