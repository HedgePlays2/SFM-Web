// app.js
// SFM-Web main controller

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

import { SceneManager } from "./editor/scene.js";
import { CameraManager } from "./editor/camera.js";


/* =========================================================
   DOM
   ========================================================= */

const viewport =
    document.querySelector("#viewport");

const status =
    document.querySelector("#status");

const outliner =
    document.querySelector("#outliner");

const properties =
    document.querySelector("#properties");

const timeline =
    document.querySelector("#timeline");

const timeLabel =
    document.querySelector("#timeLabel");

const aiPrompt =
    document.querySelector("#aiPrompt");

const aiOutput =
    document.querySelector("#aiOutput");


/* =========================================================
   CORE SYSTEMS
   ========================================================= */

const sceneManager =
    new SceneManager(
        viewport
    );

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


/* =========================================================
   EDITOR STATE
   ========================================================= */

let selected = null;

let currentTool =
    "translate";

let playing = false;

let currentTime = 0;


/* =========================================================
   SELECTION
   ========================================================= */

function selectObject(
    object
) {

    selected = object;

    refreshOutliner();

    renderProperties();
}


/* =========================================================
   OUTLINER
   ========================================================= */

function refreshOutliner() {

    outliner.innerHTML = "";

    for (
        const object
        of sceneManager.objects
    ) {

        const row =
            document.createElement(
                "div"
            );

        row.className =
            "tree-item";

        if (
            object === selected
        ) {

            row.classList.add(
                "selected"
            );

        }

        row.textContent =
            object.name;

        row.onclick =
            () =>
                selectObject(
                    object
                );

        outliner.appendChild(
            row
        );
    }
}


/* =========================================================
   PROPERTIES
   ========================================================= */

function renderProperties() {

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

            <input
                id="posX"
                placeholder="X"
                value="${selected.position.x.toFixed(2)}"
            >

            <input
                id="posY"
                placeholder="Y"
                value="${selected.position.y.toFixed(2)}"
            >

            <input
                id="posZ"
                placeholder="Z"
                value="${selected.position.z.toFixed(2)}"
            >

        </div>


        <div class="prop">

            <label>Rotation</label>

            <input
                id="rotX"
                placeholder="X"
                value="${THREE.MathUtils.radToDeg(
                    selected.rotation.x
                ).toFixed(1)}"
            >

            <input
                id="rotY"
                placeholder="Y"
                value="${THREE.MathUtils.radToDeg(
                    selected.rotation.y
                ).toFixed(1)}"
            >

            <input
                id="rotZ"
                placeholder="Z"
                value="${THREE.MathUtils.radToDeg(
                    selected.rotation.z
                ).toFixed(1)}"
            >

        </div>


        <div class="prop">

            <label>Scale</label>

            <input
                id="scaleX"
                placeholder="X"
                value="${selected.scale.x.toFixed(2)}"
            >

            <input
                id="scaleY"
                placeholder="Y"
                value="${selected.scale.y.toFixed(2)}"
            >

            <input
                id="scaleZ"
                placeholder="Z"
                value="${selected.scale.z.toFixed(2)}"
            >

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


    /* -----------------------------------------
       NAME
       ----------------------------------------- */

    document.querySelector(
        "#propName"
    ).addEventListener(
        "change",
        event => {

            selected.name =
                event.target.value ||
                "Object";

            refreshOutliner();

        }
    );


    /* -----------------------------------------
       POSITION
       ----------------------------------------- */

    bindNumber(
        "#posX",
        value =>
            selected.position.x =
                value
    );

    bindNumber(
        "#posY",
        value =>
            selected.position.y =
                value
    );

    bindNumber(
        "#posZ",
        value =>
            selected.position.z =
                value
    );


    /* -----------------------------------------
       ROTATION
       ----------------------------------------- */

    bindNumber(
        "#rotX",
        value =>
            selected.rotation.x =
                THREE.MathUtils.degToRad(
                    value
                )
    );

    bindNumber(
        "#rotY",
        value =>
            selected.rotation.y =
                THREE.MathUtils.degToRad(
                    value
                )
    );

    bindNumber(
        "#rotZ",
        value =>
            selected.rotation.z =
                THREE.MathUtils.degToRad(
                    value
                )
    );


    /* -----------------------------------------
       SCALE
       ----------------------------------------- */

    bindNumber(
        "#scaleX",
        value =>
            selected.scale.x =
                value
    );

    bindNumber(
        "#scaleY",
        value =>
            selected.scale.y =
                value
    );

    bindNumber(
        "#scaleZ",
        value =>
            selected.scale.z =
                value
    );


    /* -----------------------------------------
       FOCUS
       ----------------------------------------- */

    document.querySelector(
        "#focusObject"
    ).onclick =
        () => {

            cameraManager.focusObject(
                selected
            );

        };


    /* -----------------------------------------
       DELETE
       ----------------------------------------- */

    document.querySelector(
        "#deleteObject"
    ).onclick =
        deleteSelectedObject;
}


/* =========================================================
   PROPERTY HELPER
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

    if (!selected)
        return;

    sceneManager.removeObject(
        selected
    );

    selected = null;

    refreshOutliner();

    renderProperties();

    status.textContent =
        "Object deleted";
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(
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


/* =========================================================
   ADD CUBE
   ========================================================= */

const addCubeButton =
    document.querySelector(
        "#addCube"
    );

if (addCubeButton) {

    addCubeButton.onclick =
        () => {

            const cube =
                sceneManager.createCube(
                    "Cube"
                );

            selectObject(
                cube
            );

            status.textContent =
                "Cube added";
        };
}


/* =========================================================
   ADD LIGHT
   ========================================================= */

const addLightButton =
    document.querySelector(
        "#addLight"
    );

if (addLightButton) {

    addLightButton.onclick =
        () => {

            const light =
                sceneManager.createLight(
                    "Light"
                );

            selectObject(
                light
            );

            status.textContent =
                "Light added";
        };
}


/* =========================================================
   EDITOR TOOLS
   ========================================================= */

document
    .querySelectorAll(
        "[data-tool]"
    )
    .forEach(
        button => {

            button.onclick =
                () => {

                    currentTool =
                        button.dataset.tool;

                    status.textContent =
                        "Tool: " +
                        currentTool;
                };
        }
    );


/* =========================================================
   NEW SCENE
   ========================================================= */

const newSceneButton =
    document.querySelector(
        "#newScene"
    );

if (newSceneButton) {

    newSceneButton.onclick =
        () => {

            sceneManager.clearObjects();

            selected = null;

            currentTime = 0;

            timeline.value = 0;

            timeLabel.textContent =
                "0.00s";

            refreshOutliner();

            renderProperties();

            status.textContent =
                "New scene";
        };
}


/* =========================================================
   VIEWPORT OBJECT SELECTION
   ========================================================= */

const raycaster =
    new THREE.Raycaster();

const mouse =
    new THREE.Vector2();


renderer.domElement.addEventListener(
    "pointerdown",
    event => {

        const rect =
            renderer.domElement
                .getBoundingClientRect();


        mouse.x =
            (
                (event.clientX -
                    rect.left) /
                rect.width
            ) * 2 - 1;


        mouse.y =
            -(
                (event.clientY -
                    rect.top) /
                rect.height
            ) * 2 + 1;


        raycaster.setFromCamera(
            mouse,
            camera
        );


        const hits =
            raycaster.intersectObjects(
                sceneManager.objects,
                true
            );


        if (!hits.length)
            return;


        let object =
            hits[0].object;


        while (
            object.parent &&
            !sceneManager.objects.includes(
                object
            )
        ) {

            object =
                object.parent;
        }


        if (
            sceneManager.objects.includes(
                object
            )
        ) {

            selectObject(
                object
            );
        }
    }
);


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


                    selectObject(
                        model
                    );


                    status.textContent =
                        "Imported " +
                        file.name;


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

            timeLabel.textContent =
                currentTime.toFixed(
                    2
                ) + "s";
        }
    );
}


/* =========================================================
   PLAY
   ========================================================= */

const playButton =
    document.querySelector(
        "#play"
    );

if (playButton) {

    playButton.onclick =
        () => {

            playing = true;

            status.textContent =
                "Playing";
        };
}


/* =========================================================
   STOP
   ========================================================= */

const stopButton =
    document.querySelector(
        "#stop"
    );

if (stopButton) {

    stopButton.onclick =
        () => {

            playing = false;

            currentTime = 0;

            timeline.value = 0;

            timeLabel.textContent =
                "0.00s";

            status.textContent =
                "Stopped";
        };
}


/* =========================================================
   PUTER SAVE
   ========================================================= */

const saveButton =
    document.querySelector(
        "#saveScene"
    );

if (saveButton) {

    saveButton.onclick =
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

const loadButton =
    document.querySelector(
        "#loadScene"
    );

if (loadButton) {

    loadButton.onclick =
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
                    "No saved project found";
            }
        };
}


/* =========================================================
   SERIALIZE SCENE
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
   RESTORE SCENE
   ========================================================= */

function restoreScene(
    data
) {

    sceneManager.clearObjects();

    selected = null;


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

const askAIButton =
    document.querySelector(
        "#askAI"
    );

if (
    askAIButton &&
    aiPrompt &&
    aiOutput
) {

    askAIButton.onclick =
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

Help the user with:

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
   FOCUS SELECTED OBJECT
   ========================================================= */

window.addEventListener(
    "keydown",
    event => {

        // Don't steal F from text inputs.
        if (
            event.target.tagName ===
                "INPUT" ||
            event.target.tagName ===
                "TEXTAREA"
        ) {

            return;
        }


        if (
            event.key.toLowerCase() ===
            "f"
        ) {

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


    lastTime = now;


    if (playing) {

        currentTime +=
            delta;


        if (
            currentTime > 10
        ) {

            currentTime = 0;
        }


        timeline.value =
            currentTime;


        timeLabel.textContent =
            currentTime.toFixed(
                2
            ) + "s";
    }


    cameraManager.update();

    sceneManager.render();
}


/* =========================================================
   START EDITOR
   ========================================================= */

const firstCube =
    sceneManager.createCube(
        "Cube"
    );

selectObject(
    firstCube
);


status.textContent =
    "SFM-Web ready";


animate(
    performance.now()
);
