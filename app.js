// app.js
// SFM-Web main controller

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

import { SceneManager } from "./editor/scene.js";
import { CameraManager } from "./editor/camera.js";
import { SelectionManager } from "./editor/selection.js";
import { GizmoManager } from "./editor/gizmos.js";


/* =========================================================
   DOM
   ========================================================= */

const viewport = document.querySelector("#viewport");
const status = document.querySelector("#status");
const outliner = document.querySelector("#outliner");
const properties = document.querySelector("#properties");

const timeline = document.querySelector("#timeline");
const timeLabel = document.querySelector("#timeLabel");

const aiPrompt = document.querySelector("#aiPrompt");
const aiOutput = document.querySelector("#aiOutput");


/* =========================================================
   CHECK VIEWPORT
   ========================================================= */

if (!viewport) {
    throw new Error(
        "SFM-Web: #viewport was not found in index.html"
    );
}


/* =========================================================
   CORE SYSTEMS
   ========================================================= */

const sceneManager =
    new SceneManager(viewport);

const scene =
    sceneManager.scene;

const camera =
    sceneManager.camera;

const renderer =
    sceneManager.renderer;


const cameraManager =
    new CameraManager(
        camera,
        renderer
    );


const selectionManager =
    new SelectionManager(
        sceneManager
    );


const gizmoManager =
    new GizmoManager(
        scene,
        camera,
        renderer,
        cameraManager,
        selectionManager
    );


/* =========================================================
   STATE
   ========================================================= */

let currentTool = "translate";
let playing = false;
let currentTime = 0;


/* =========================================================
   SELECTION
   ========================================================= */

selectionManager.onSelectionChanged(
    object => {

        refreshOutliner();
        renderProperties();

        if (object) {

            status.textContent =
                `Selected: ${object.name}`;

        } else {

            status.textContent =
                "Nothing selected";

        }

    }
);


function getSelected() {

    return selectionManager.getSelected();

}


/* =========================================================
   OUTLINER
   ========================================================= */

function refreshOutliner() {

    if (!outliner)
        return;

    outliner.innerHTML = "";

    for (
        const object
        of sceneManager.objects
    ) {

        const item =
            document.createElement("div");

        item.className =
            "tree-item";


        if (
            selectionManager.isSelected(
                object
            )
        ) {

            item.classList.add(
                "selected"
            );

        }


        item.textContent =
            object.name;


        item.addEventListener(
            "click",
            () => {

                selectionManager.select(
                    object
                );

            }
        );


        outliner.appendChild(
            item
        );
    }
}


/* =========================================================
   PROPERTIES
   ========================================================= */

function renderProperties() {

    if (!properties)
        return;


    const selected =
        getSelected();


    if (!selected) {

        properties.innerHTML =
            `<div class="empty">
                Select an object.
            </div>`;

        return;
    }


    properties.innerHTML = `

        <div class="prop">

            <label>Name</label>

            <input
                id="propName"
                value="${escapeHTML(selected.name)}"
            >

        </div>


        <div class="prop">

            <label>Position</label>

            <div class="vector-input">

                <input
                    id="posX"
                    value="${selected.position.x.toFixed(2)}"
                >

                <input
                    id="posY"
                    value="${selected.position.y.toFixed(2)}"
                >

                <input
                    id="posZ"
                    value="${selected.position.z.toFixed(2)}"
                >

            </div>

        </div>


        <div class="prop">

            <label>Rotation</label>

            <div class="vector-input">

                <input
                    id="rotX"
                    value="${THREE.MathUtils.radToDeg(
                        selected.rotation.x
                    ).toFixed(1)}"
                >

                <input
                    id="rotY"
                    value="${THREE.MathUtils.radToDeg(
                        selected.rotation.y
                    ).toFixed(1)}"
                >

                <input
                    id="rotZ"
                    value="${THREE.MathUtils.radToDeg(
                        selected.rotation.z
                    ).toFixed(1)}"
                >

            </div>

        </div>


        <div class="prop">

            <label>Scale</label>

            <div class="vector-input">

                <input
                    id="scaleX"
                    value="${selected.scale.x.toFixed(2)}"
                >

                <input
                    id="scaleY"
                    value="${selected.scale.y.toFixed(2)}"
                >

                <input
                    id="scaleZ"
                    value="${selected.scale.z.toFixed(2)}"
                >

            </div>

        </div>


        <button
            id="focusObject"
            class="wide"
        >
            Focus Camera
        </button>


        <button
            id="deleteObject"
            class="wide"
        >
            Delete Object
        </button>

    `;


    /* Position */

    bindNumber(
        "#posX",
        value => {
            selected.position.x = value;
        }
    );

    bindNumber(
        "#posY",
        value => {
            selected.position.y = value;
        }
    );

    bindNumber(
        "#posZ",
        value => {
            selected.position.z = value;
        }
    );


    /* Rotation */

    bindNumber(
        "#rotX",
        value => {

            selected.rotation.x =
                THREE.MathUtils.degToRad(
                    value
                );

        }
    );

    bindNumber(
        "#rotY",
        value => {

            selected.rotation.y =
                THREE.MathUtils.degToRad(
                    value
                );

        }
    );

    bindNumber(
        "#rotZ",
        value => {

            selected.rotation.z =
                THREE.MathUtils.degToRad(
                    value
                );

        }
    );


    /* Scale */

    bindNumber(
        "#scaleX",
        value => {
            selected.scale.x = value;
        }
    );

    bindNumber(
        "#scaleY",
        value => {
            selected.scale.y = value;
        }
    );

    bindNumber(
        "#scaleZ",
        value => {
            selected.scale.z = value;
        }
    );


    /* Name */

    const nameInput =
        document.querySelector(
            "#propName"
        );

    if (nameInput) {

        nameInput.addEventListener(
            "change",
            event => {

                selected.name =
                    event.target.value ||
                    "Object";

                refreshOutliner();

            }
        );
    }


    /* Focus */

    const focusButton =
        document.querySelector(
            "#focusObject"
        );

    if (focusButton) {

        focusButton.onclick =
            () => {

                cameraManager.focusObject(
                    selected
                );

            };
    }


    /* Delete */

    const deleteButton =
        document.querySelector(
            "#deleteObject"
        );

    if (deleteButton) {

        deleteButton.onclick =
            deleteSelectedObject;

    }
}


/* =========================================================
   NUMBER INPUT
   ========================================================= */

function bindNumber(
    selector,
    callback
) {

    const element =
        document.querySelector(
            selector
        );

    if (!element)
        return;


    element.addEventListener(
        "change",
        () => {

            const value =
                Number(
                    element.value
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


/* =========================================================
   DELETE OBJECT
   ========================================================= */

function deleteSelectedObject() {

    const selected =
        getSelected();


    if (!selected)
        return;


    sceneManager.removeObject(
        selected
    );


    selectionManager.clear();


    status.textContent =
        "Object deleted";
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(
    value
) {

    return String(value).replace(
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


/* =========================================================
   ADD CUBE
   ========================================================= */

const addCube =
    document.querySelector(
        "#addCube"
    );


if (addCube) {

    addCube.onclick =
        () => {

            const cube =
                sceneManager.createCube(
                    "Cube"
                );


            selectionManager.select(
                cube
            );


            status.textContent =
                "Cube added";

        };
}


/* =========================================================
   ADD LIGHT
   ========================================================= */

const addLight =
    document.querySelector(
        "#addLight"
    );


if (addLight) {

    addLight.onclick =
        () => {

            const light =
                sceneManager.createLight(
                    "Light"
                );


            selectionManager.select(
                light
            );


            status.textContent =
                "Light added";

        };
}


/* =========================================================
   GIZMO TOOLS
   ========================================================= */

document
    .querySelectorAll(
        "[data-tool]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const tool =
                        button.dataset.tool;


                    if (
                        tool !== "translate" &&
                        tool !== "rotate" &&
                        tool !== "scale"
                    ) {

                        return;

                    }


                    currentTool =
                        tool;


                    gizmoManager.setMode(
                        tool
                    );


                    status.textContent =
                        `Tool: ${tool}`;

                }
            );

        }
    );


/* =========================================================
   KEYBOARD GIZMO SHORTCUTS
   ========================================================= */

window.addEventListener(
    "keydown",
    event => {

        if (
            event.target.tagName ===
                "INPUT" ||
            event.target.tagName ===
                "TEXTAREA"
        ) {

            return;
        }


        const key =
            event.key.toLowerCase();


        if (key === "w") {

            currentTool =
                "translate";

            gizmoManager.setMode(
                "translate"
            );

            status.textContent =
                "Tool: translate";

        }


        if (key === "e") {

            currentTool =
                "rotate";

            gizmoManager.setMode(
                "rotate"
            );

            status.textContent =
                "Tool: rotate";

        }


        if (key === "r") {

            currentTool =
                "scale";

            gizmoManager.setMode(
                "scale"
            );

            status.textContent =
                "Tool: scale";

        }


        if (key === "f") {

            const selected =
                getSelected();


            if (selected) {

                cameraManager.focusObject(
                    selected
                );

                status.textContent =
                    "Camera focused";

            }

        }

    }
);


/* =========================================================
   NEW SCENE
   ========================================================= */

const newScene =
    document.querySelector(
        "#newScene"
    );


if (newScene) {

    newScene.onclick =
        () => {

            sceneManager.clearObjects();

            selectionManager.clear();

            cameraManager.reset();

            currentTime = 0;

            playing = false;


            if (timeline) {

                timeline.value =
                    0;

            }


            if (timeLabel) {

                timeLabel.textContent =
                    "0.00s";

            }


            refreshOutliner();

            renderProperties();


            status.textContent =
                "New scene";

        };
}


/* =========================================================
   MODEL IMPORT
   ========================================================= */

const modelInput =
    document.querySelector(
        "#modelInput"
    );


if (modelInput) {

    modelInput.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (!file)
                return;


            const url =
                URL.createObjectURL(
                    file
                );


            const loader =
                new GLTFLoader();


            status.textContent =
                `Loading ${file.name}...`;


            loader.load(

                url,

                gltf => {

                    const model =
                        gltf.scene;


                    model.position.set(
                        0,
                        0,
                        0
                    );


                    model.traverse(
                        object => {

                            if (
                                object.isMesh
                            ) {

                                object.castShadow =
                                    true;

                                object.receiveShadow =
                                    true;

                            }

                        }
                    );


                    const name =
                        file.name.replace(
                            /\.(glb|gltf)$/i,
                            ""
                        );


                    sceneManager.addObject(
                        model,
                        name
                    );


                    selectionManager.select(
                        model
                    );


                    status.textContent =
                        `Imported ${file.name}`;


                    URL.revokeObjectURL(
                        url
                    );

                },

                undefined,

                error => {

                    console.error(
                        error
                    );


                    status.textContent =
                        "Model import failed";


                    URL.revokeObjectURL(
                        url
                    );

                }

            );

        }
    );
}


/* =========================================================
   TIMELINE
   ========================================================= */

if (timeline) {

    timeline.addEventListener(
        "input",
        () => {

            currentTime =
                Number(
                    timeline.value
                );


            if (timeLabel) {

                timeLabel.textContent =
                    currentTime.toFixed(2) +
                    "s";

            }

        }
    );
}


/* =========================================================
   PLAY
   ========================================================= */

const play =
    document.querySelector(
        "#play"
    );


if (play) {

    play.onclick =
        () => {

            playing = true;

            status.textContent =
                "Playing";

        };

}


/* =========================================================
   STOP
   ========================================================= */

const stop =
    document.querySelector(
        "#stop"
    );


if (stop) {

    stop.onclick =
        () => {

            playing = false;

            currentTime = 0;


            if (timeline) {

                timeline.value =
                    0;

            }


            if (timeLabel) {

                timeLabel.textContent =
                    "0.00s";

            }


            status.textContent =
                "Stopped";

        };

}


/* =========================================================
   PUTER SAVE
   ========================================================= */

const saveScene =
    document.querySelector(
        "#saveScene"
    );


if (saveScene) {

    saveScene.onclick =
        async () => {

            try {

                const data =
                    serializeScene();


                await puter.fs.write(
                    "sfm-web-project.json",
                    JSON.stringify(
                        data,
                        null,
                        2
                    )
                );


                status.textContent =
                    "Saved to Puter";

            }
            catch (error) {

                console.error(
                    error
                );


                status.textContent =
                    "Save failed";

            }

        };

}


/* =========================================================
   PUTER LOAD
   ========================================================= */

const loadScene =
    document.querySelector(
        "#loadScene"
    );


if (loadScene) {

    loadScene.onclick =
        async () => {

            try {

                const file =
                    await puter.fs.read(
                        "sfm-web-project.json"
                    );


                const text =
                    await file.text();


                const data =
                    JSON.parse(
                        text
                    );


                restoreScene(
                    data
                );


                status.textContent =
                    "Loaded from Puter";

            }
            catch (error) {

                console.error(
                    error
                );


                status.textContent =
                    "Could not load project";

            }

        };

}


/* =========================================================
   SERIALIZE
   ========================================================= */

function serializeScene() {

    return {

        version: 2,

        camera:
            cameraManager.serialize(),

        objects:
            sceneManager.objects.map(
                object => ({

                    name:
                        object.name,

                    type:
                        object.type,

                    position:
                        object.position.toArray(),

                    rotation: [

                        object.rotation.x,
                        object.rotation.y,
                        object.rotation.z

                    ],

                    scale:
                        object.scale.toArray()

                })
            )

    };
}


/* =========================================================
   RESTORE
   ========================================================= */

function restoreScene(
    data
) {

    sceneManager.clearObjects();

    selectionManager.clear();


    if (data.camera) {

        cameraManager.restore(
            data.camera
        );

    }


    for (
        const objectData
        of data.objects || []
    ) {

        if (
            objectData.type ===
            "Mesh"
        ) {

            const object =
                sceneManager.createCube(
                    objectData.name ||
                    "Cube"
                );


            if (
                Array.isArray(
                    objectData.position
                )
            ) {

                object.position.fromArray(
                    objectData.position
                );

            }


            if (
                Array.isArray(
                    objectData.rotation
                )
            ) {

                object.rotation.fromArray(
                    objectData.rotation
                );

            }


            if (
                Array.isArray(
                    objectData.scale
                )
            ) {

                object.scale.fromArray(
                    objectData.scale
                );

            }

        }

    }


    refreshOutliner();

    renderProperties();
}


/* =========================================================
   PUTER AI
   ========================================================= */

const askAI =
    document.querySelector(
        "#askAI"
    );


if (
    askAI &&
    aiPrompt &&
    aiOutput
) {

    askAI.onclick =
        async () => {

            const prompt =
                aiPrompt.value.trim();


            if (!prompt)
                return;


            aiOutput.textContent =
                "Thinking...";


            try {

                const response =
                    await puter.ai.chat(

                        `You are the AI assistant
inside SFM-Web, a browser-based
Source Filmmaker-style editor.

Help with:

- filmmaking
- camera composition
- lighting
- posing
- animation
- scene setup
- troubleshooting

User request:

${prompt}`,

                        {
                            model:
                                "gpt-5.4-nano"
                        }

                    );


                aiOutput.textContent =
                    response?.message?.content ??
                    response?.text ??
                    String(response);

            }
            catch (error) {

                console.error(
                    error
                );


                aiOutput.textContent =
                    "AI error: " +
                    error.message;

            }

        };

}


/* =========================================================
   AI BUTTON
   ========================================================= */

const aiButton =
    document.querySelector(
        "#aiButton"
    );


if (aiButton) {

    aiButton.onclick =
        () => {

            if (aiPrompt) {

                aiPrompt.focus();

            }

        };

}


/* =========================================================
   GIZMO CHANGE CALLBACK
   ========================================================= */

gizmoManager.setObjectChangedCallback(
    object => {

        if (!object)
            return;


        renderProperties();

    }
);


/* =========================================================
   ANIMATION LOOP
   ========================================================= */

let lastTime =
    performance.now();


function animate(
    now
) {

    requestAnimationFrame(
        animate
    );


    const delta =
        (now - lastTime) /
        1000;


    lastTime =
        now;


    if (playing) {

        currentTime +=
            delta;


        const duration =
            Number(
                timeline?.max || 10
            );


        if (
            currentTime >
            duration
        ) {

            currentTime = 0;

        }


        if (timeline) {

            timeline.value =
                currentTime;

        }


        if (timeLabel) {

            timeLabel.textContent =
                currentTime.toFixed(2) +
                "s";

        }

    }


    cameraManager.update();

    sceneManager.render();

}


/* =========================================================
   START
   ========================================================= */

const firstCube =
    sceneManager.createCube(
        "Cube"
    );


selectionManager.select(
    firstCube
);


status.textContent =
    "SFM-Web ready";


animate(
    performance.now()
);
