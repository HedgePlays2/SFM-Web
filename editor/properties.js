// editor/properties.js
// SFM-Web Properties Panel

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class PropertiesManager {

    constructor(
        container,
        selectionManager,
        cameraManager,
        sceneManager
    ) {

        this.container = container;
        this.selectionManager = selectionManager;
        this.cameraManager = cameraManager;
        this.sceneManager = sceneManager;

        this.unsubscribe =
            this.selectionManager.onSelectionChanged(
                () => this.render()
            );

        this.render();
    }


    // =====================================================
    // Render
    // =====================================================

    render() {

        if (!this.container)
            return;

        const object =
            this.selectionManager.getSelected();


        if (!object) {

            this.container.innerHTML = `
                <div class="empty">
                    Select an object.
                </div>
            `;

            return;
        }


        this.container.innerHTML = `

            <div class="properties-header">
                <strong>Object</strong>
            </div>


            <div class="property">

                <label>Name</label>

                <input
                    id="sfm-object-name"
                    type="text"
                    value="${this.escape(object.name)}"
                >

            </div>


            <div class="property-section">

                <div class="property-title">
                    Position
                </div>


                <div class="vector-row">

                    <span>X</span>

                    <input
                        id="sfm-pos-x"
                        type="number"
                        step="0.01"
                        value="${object.position.x}"
                    >

                </div>


                <div class="vector-row">

                    <span>Y</span>

                    <input
                        id="sfm-pos-y"
                        type="number"
                        step="0.01"
                        value="${object.position.y}"
                    >

                </div>


                <div class="vector-row">

                    <span>Z</span>

                    <input
                        id="sfm-pos-z"
                        type="number"
                        step="0.01"
                        value="${object.position.z}"
                    >

                </div>

            </div>


            <div class="property-section">

                <div class="property-title">
                    Rotation
                </div>


                <div class="vector-row">

                    <span>X</span>

                    <input
                        id="sfm-rot-x"
                        type="number"
                        step="0.1"
                        value="${THREE.MathUtils.radToDeg(
                            object.rotation.x
                        ).toFixed(2)}"
                    >

                </div>


                <div class="vector-row">

                    <span>Y</span>

                    <input
                        id="sfm-rot-y"
                        type="number"
                        step="0.1"
                        value="${THREE.MathUtils.radToDeg(
                            object.rotation.y
                        ).toFixed(2)}"
                    >

                </div>


                <div class="vector-row">

                    <span>Z</span>

                    <input
                        id="sfm-rot-z"
                        type="number"
                        step="0.1"
                        value="${THREE.MathUtils.radToDeg(
                            object.rotation.z
                        ).toFixed(2)}"
                    >

                </div>

            </div>


            <div class="property-section">

                <div class="property-title">
                    Scale
                </div>


                <div class="vector-row">

                    <span>X</span>

                    <input
                        id="sfm-scale-x"
                        type="number"
                        step="0.01"
                        value="${object.scale.x}"
                    >

                </div>


                <div class="vector-row">

                    <span>Y</span>

                    <input
                        id="sfm-scale-y"
                        type="number"
                        step="0.01"
                        value="${object.scale.y}"
                    >

                </div>


                <div class="vector-row">

                    <span>Z</span>

                    <input
                        id="sfm-scale-z"
                        type="number"
                        step="0.01"
                        value="${object.scale.z}"
                    >

                </div>

            </div>


            <div class="property-section">

                <div class="property-title">
                    Actions
                </div>


                <button
                    id="sfm-focus"
                    class="property-button"
                >
                    Focus Camera
                </button>


                <button
                    id="sfm-reset-transform"
                    class="property-button"
                >
                    Reset Transform
                </button>


                <button
                    id="sfm-delete"
                    class="property-button danger"
                >
                    Delete Object
                </button>

            </div>

        `;


        this.bindEvents(
            object
        );
    }


    // =====================================================
    // Bind UI
    // =====================================================

    bindEvents(
        object
    ) {

        const name =
            this.container.querySelector(
                "#sfm-object-name"
            );


        if (name) {

            name.addEventListener(
                "change",
                () => {

                    object.name =
                        name.value.trim() ||
                        "Object";

                    this.render();

                }
            );

        }


        this.bindInput(
            "#sfm-pos-x",
            value => {

                object.position.x =
                    value;

            }
        );


        this.bindInput(
            "#sfm-pos-y",
            value => {

                object.position.y =
                    value;

            }
        );


        this.bindInput(
            "#sfm-pos-z",
            value => {

                object.position.z =
                    value;

            }
        );


        this.bindInput(
            "#sfm-rot-x",
            value => {

                object.rotation.x =
                    THREE.MathUtils.degToRad(
                        value
                    );

            }
        );


        this.bindInput(
            "#sfm-rot-y",
            value => {

                object.rotation.y =
                    THREE.MathUtils.degToRad(
                        value
                    );

            }
        );


        this.bindInput(
            "#sfm-rot-z",
            value => {

                object.rotation.z =
                    THREE.MathUtils.degToRad(
                        value
                    );

            }
        );


        this.bindInput(
            "#sfm-scale-x",
            value => {

                object.scale.x =
                    value;

            }
        );


        this.bindInput(
            "#sfm-scale-y",
            value => {

                object.scale.y =
                    value;

            }
        );


        this.bindInput(
            "#sfm-scale-z",
            value => {

                object.scale.z =
                    value;

            }
        );


        const focus =
            this.container.querySelector(
                "#sfm-focus"
            );


        if (focus) {

            focus.addEventListener(
                "click",
                () => {

                    this.cameraManager.focusObject(
                        object
                    );

                }
            );

        }


        const reset =
            this.container.querySelector(
                "#sfm-reset-transform"
            );


        if (reset) {

            reset.addEventListener(
                "click",
                () => {

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


                    this.render();

                }
            );

        }


        const deleteButton =
            this.container.querySelector(
                "#sfm-delete"
            );


        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                () => {

                    this.sceneManager.removeObject(
                        object
                    );

                    this.selectionManager.clear();

                }
            );

        }

    }


    // =====================================================
    // Input helper
    // =====================================================

    bindInput(
        selector,
        callback
    ) {

        const input =
            this.container.querySelector(
                selector
            );


        if (!input)
            return;


        input.addEventListener(
            "change",
            () => {

                const value =
                    Number(
                        input.value
                    );


                if (
                    Number.isFinite(
                        value
                    )
                ) {

                    callback(
                        value
                    );

                }

            }
        );

    }


    // =====================================================
    // Escape HTML
    // =====================================================

    escape(
        value
    ) {

        return String(
            value
        ).replace(
            /[&<>"']/g,
            character => {

                const entities = {

                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;"

                };

                return entities[
                    character
                ];

            }
        );

    }


    // =====================================================
    // Refresh
    // =====================================================

    refresh() {

        this.render();

    }


    // =====================================================
    // Dispose
    // =====================================================

    dispose() {

        if (
            this.unsubscribe
        ) {

            this.unsubscribe();

        }

        this.container.innerHTML = "";

    }

}
