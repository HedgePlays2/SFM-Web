// editor/properties.js
// SFM-Web Properties Panel

export class PropertiesManager {

    constructor(
        element,
        selectionManager,
        cameraManager,
        sceneManager
    ) {

        this.element =
            element;

        this.selectionManager =
            selectionManager;

        this.cameraManager =
            cameraManager;

        this.sceneManager =
            sceneManager;


        this.selectedObject =
            null;


        this.refresh();

    }


    // =====================================================
    // Refresh
    // =====================================================

    refresh() {

        if (!this.element)
            return;


        this.selectedObject =
            this.selectionManager.getSelected();


        if (!this.selectedObject) {

            this.element.innerHTML = `
                <div class="empty-properties">
                    Select an object
                </div>
            `;

            return;

        }


        this.render();

    }


    // =====================================================
    // Render properties
    // =====================================================

    render() {

        const object =
            this.selectedObject;


        this.element.innerHTML = "";


        // =================================================
        // Object information
        // =================================================

        const info =
            document.createElement("div");

        info.className =
            "property";


        info.innerHTML = `
            <div class="property-title">
                Object
            </div>

            <div class="property-row">
                <label>Name</label>
                <input
                    id="property-name"
                    type="text"
                    value="${this.escapeHTML(
                        object.name || "Object"
                    )}"
                >
            </div>

            <div class="property-row">
                <label>Type</label>
                <input
                    type="text"
                    value="${this.escapeHTML(
                        object.type || "Object"
                    )}"
                    disabled
                >
            </div>
        `;


        this.element.appendChild(
            info
        );


        // =================================================
        // Transform
        // =================================================

        const transform =
            document.createElement("div");

        transform.className =
            "property";


        transform.innerHTML = `
            <div class="property-title">
                Transform
            </div>

            <div class="property-row">
                <label>X</label>
                <input
                    id="position-x"
                    type="number"
                    step="0.01"
                    value="${object.position.x}"
                >
            </div>

            <div class="property-row">
                <label>Y</label>
                <input
                    id="position-y"
                    type="number"
                    step="0.01"
                    value="${object.position.y}"
                >
            </div>

            <div class="property-row">
                <label>Z</label>
                <input
                    id="position-z"
                    type="number"
                    step="0.01"
                    value="${object.position.z}"
                >
            </div>
        `;


        this.element.appendChild(
            transform
        );


        // =================================================
        // Rotation
        // =================================================

        const rotation =
            document.createElement("div");

        rotation.className =
            "property";


        rotation.innerHTML = `
            <div class="property-title">
                Rotation
            </div>

            <div class="property-row">
                <label>X</label>
                <input
                    id="rotation-x"
                    type="number"
                    step="1"
                    value="${this.radiansToDegrees(
                        object.rotation.x
                    )}"
                >
            </div>

            <div class="property-row">
                <label>Y</label>
                <input
                    id="rotation-y"
                    type="number"
                    step="1"
                    value="${this.radiansToDegrees(
                        object.rotation.y
                    )}"
                >
            </div>

            <div class="property-row">
                <label>Z</label>
                <input
                    id="rotation-z"
                    type="number"
                    step="1"
                    value="${this.radiansToDegrees(
                        object.rotation.z
                    )}"
                >
            </div>
        `;


        this.element.appendChild(
            rotation
        );


        // =================================================
        // Scale
        // =================================================

        const scale =
            document.createElement("div");

        scale.className =
            "property";


        scale.innerHTML = `
            <div class="property-title">
                Scale
            </div>

            <div class="property-row">
                <label>X</label>
                <input
                    id="scale-x"
                    type="number"
                    step="0.01"
                    value="${object.scale.x}"
                >
            </div>

            <div class="property-row">
                <label>Y</label>
                <input
                    id="scale-y"
                    type="number"
                    step="0.01"
                    value="${object.scale.y}"
                >
            </div>

            <div class="property-row">
                <label>Z</label>
                <input
                    id="scale-z"
                    type="number"
                    step="0.01"
                    value="${object.scale.z}"
                >
            </div>
        `;


        this.element.appendChild(
            scale
        );


        // =================================================
        // Actions
        // =================================================

        const actions =
            document.createElement("div");

        actions.className =
            "property";


        actions.innerHTML = `
            <div class="property-title">
                Actions
            </div>

            <div class="button-grid">

                <button id="focus-object">
                    Focus
                </button>

                <button id="reset-transform">
                    Reset
                </button>

            </div>
        `;


        this.element.appendChild(
            actions
        );


        this.setupInputs();

    }


    // =====================================================
    // Setup inputs
    // =====================================================

    setupInputs() {

        const object =
            this.selectedObject;


        if (!object)
            return;


        // =================================================
        // Name
        // =================================================

        const nameInput =
            this.element.querySelector(
                "#property-name"
            );


        if (nameInput) {

            nameInput.addEventListener(
                "change",
                () => {

                    object.name =
                        nameInput.value ||
                        "Object";

                    this.refreshOutliner();

                }
            );

        }


        // =================================================
        // Position
        // =================================================

        this.bindNumber(
            "#position-x",
            value => {

                object.position.x =
                    value;

            }
        );


        this.bindNumber(
            "#position-y",
            value => {

                object.position.y =
                    value;

            }
        );


        this.bindNumber(
            "#position-z",
            value => {

                object.position.z =
                    value;

            }
        );


        // =================================================
        // Rotation
        // =================================================

        this.bindNumber(
            "#rotation-x",
            value => {

                object.rotation.x =
                    this.degreesToRadians(
                        value
                    );

            }
        );


        this.bindNumber(
            "#rotation-y",
            value => {

                object.rotation.y =
                    this.degreesToRadians(
                        value
                    );

            }
        );


        this.bindNumber(
            "#rotation-z",
            value => {

                object.rotation.z =
                    this.degreesToRadians(
                        value
                    );

            }
        );


        // =================================================
        // Scale
        // =================================================

        this.bindNumber(
            "#scale-x",
            value => {

                object.scale.x =
                    value;

            }
        );


        this.bindNumber(
            "#scale-y",
            value => {

                object.scale.y =
                    value;

            }
        );


        this.bindNumber(
            "#scale-z",
            value => {

                object.scale.z =
                    value;

            }
        );


        // =================================================
        // Focus
        // =================================================

        const focus =
            this.element.querySelector(
                "#focus-object"
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


        // =================================================
        // Reset
        // =================================================

        const reset =
            this.element.querySelector(
                "#reset-transform"
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


                    this.refresh();

                }
            );

        }

    }


    // =====================================================
    // Bind number input
    // =====================================================

    bindNumber(
        selector,
        callback
    ) {

        const input =
            this.element.querySelector(
                selector
            );


        if (!input)
            return;


        input.addEventListener(
            "input",
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
    // Refresh outliner
    // =====================================================

    refreshOutliner() {

        const outliner =
            document.querySelector(
                "#outliner"
            );


        if (!outliner)
            return;


        const selected =
            this.selectionManager.getSelected();


        outliner
            .querySelectorAll(
                ".tree-item"
            )
            .forEach(
                item => {

                    if (
                        item.textContent ===
                        selected?.name
                    ) {

                        item.classList.add(
                            "selected"
                        );

                    }
                    else {

                        item.classList.remove(
                            "selected"
                        );

                    }

                }
            );

    }


    // =====================================================
    // Degrees → radians
    // =====================================================

    degreesToRadians(
        degrees
    ) {

        return (
            degrees *
            Math.PI /
            180
        );

    }


    // =====================================================
    // Radians → degrees
    // =====================================================

    radiansToDegrees(
        radians
    ) {

        return (
            radians *
            180 /
            Math.PI
        );

    }


    // =====================================================
    // Escape HTML
    // =====================================================

    escapeHTML(
        value
    ) {

        return String(
            value
        )
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );

    }

}
