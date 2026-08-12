// app.js
// SFM-Web main controller

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

import { SceneManager } from "./editor/scene.js";
import { CameraManager } from "./editor/camera.js";
import { SelectionManager } from "./editor/selection.js";
import { GizmoManager } from "./editor/gizmos.js";
import { PropertiesManager } from "./editor/properties.js";


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
   SAFETY CHECK
   ========================================================= */

if (!viewport) {

    throw new Error(
        "SFM-Web: #viewport was not found."
    );

}


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


const propertiesManager =
    new PropertiesManager(
        properties,
        selectionManager,
        cameraManager,
        sceneManager
    );


/* =========================================================
   STATE
   ========================================================= */

let currentTool =
    "translate";

let playing =
    false;

let currentTime =
    0;


/* =========================================================
   STATUS
   ========================================================= */

function setStatus(
    message
) {

    if (status) {

        status.textContent =
            message;

    }

}


/* =========================================================
   OUTLINER
   ========================================================= */

function refreshOutliner() {

    if (!outliner)
        return;


    outliner.innerHTML =
        "";


    for (
        const object
        of sceneManager.objects
    ) {

        const item =
            document.createElement(
                "div"
            );


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
   SELECTION UPDATES
   ========================================================= */

selectionManager.onSelectionChanged(
    object => {

        refreshOutliner();

        propertiesManager.refresh();


        if (object) {

            setStatus(
                `Selected: ${object.name}`
            );

        }
        else {

            setStatus(
                "Nothing selected"
            );

        }

    }
);


/* =========================================================
   GIZMO
   ========================================================= */

gizmoManager.setObjectChangedCallback(
    () => {

        propertiesManager.refresh();

    }
);


/* =========================================================
   ADD CUBE
   ========================================================= */

const addCube =
    document.querySelector(
        "#addCube"
    );


if (addCube) {

    addCube.addEventListener(
        "click",
        () => {

            const cube =
                sceneManager.createCube(
                    "Cube"
                );


            selectionManager.select(
                cube
            );


            setStatus(
                "Cube added"
            );

        }
    );

}


/* =========================================================
   ADD LIGHT
   ========================================================= */

const addLight =
    document.querySelector(
        "#addLight"
    );


if (addLight) {

    addLight.addEventListener(
        "click",
        () => {

            const light =
                sceneManager.createLight(
                    "Light"
                );


            selectionManager.select(
                light
            );


            setStatus(
                "Light added"
            );

        }
    );

}


/* =========================================================
   TRANSFORM TOOLS
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


                    setStatus(
                        `Tool: ${tool}`
                    );

                }
            );

        }
    );


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

window.addEventListener(
    "keydown",
    event => {

        if (
            event.target instanceof
                HTMLInputElement ||
            event.target instanceof
                HTMLTextAreaElement
        ) {

            return;

        }


        const key =
            event.key.toLowerCase();


        /* Move */

        if (key === "w") {

            currentTool =
                "translate";

            gizmoManager.setMode(
                "translate"
            );

            setStatus(
                "Tool: translate"
            );

        }


        /* Rotate */

        else if (key === "e") {

            currentTool =
                "rotate";

            gizmoManager.setMode(
                "rotate"
            );

            setStatus(
                "Tool: rotate"
            );

        }


        /* Scale */

        else if (key === "r") {

            currentTool =
                "scale";

            gizmoManager.setMode(
                "scale"
            );

            setStatus(
                "Tool: scale"
            );

        }


        /* Focus */

        else if (key === "f") {

            const selected =
                selectionManager.getSelected();


            if (selected) {

                cameraManager.focusObject(
                    selected
                );

                setStatus(
                    "Camera focused"
                );

            }

        }


        /* Delete */

        else if (
            event.key === "Delete" ||
            event.key === "Backspace"
        ) {

            const selected =
                selectionManager.getSelected();


            if (selected) {

                sceneManager.removeObject(
                    selected
                );


                selectionManager.clear();


                setStatus(
                    "Object deleted"
                );

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

    newScene.addEventListener(
        "click",
        () => {

            sceneManager.clearObjects();

            selectionManager.clear();

            cameraManager.reset();


            currentTime =
                0;

            playing =
                false;


            if (timeline) {

                timeline.value =
                    "0";

            }


            if (timeLabel) {

                timeLabel.textContent =
                    "0.00s";

            }


            refreshOutliner();

            propertiesManager.refresh();


            setStatus(
                "New scene"
            );

        }
    );

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
                event.target.files?.[0];


            if (!file)
                return;


            const url =
                URL.createObjectURL(
                    file
                );


            const loader =
                new GLTFLoader();


            setStatus(
                `Loading ${file.name}...`
            );


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


                    setStatus(
                        `Imported ${file.name}`
                    );


                    URL.revokeObjectURL(
                        url
                    );

                    modelInput.value =
                        "";

                },

                undefined,

                error => {

                    console.error(
                        "Model import error:",
                        error
                    );


                    setStatus(
                        "Model import failed"
                    );


                    URL.revokeObjectURL(
                        url
                    );

                    modelInput.value =
                        "";

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

    play.addEventListener(
        "click",
        () => {

            playing =
                true;


            setStatus(
                "Playing"
            );

        }
    );

}


/* =========================================================
   PAUSE
   ========================================================= */

const pause =
    document.querySelector(
        "#pause"
    );


if (pause) {

    pause.addEventListener(
        "click",
        () => {

            playing =
                false;


            setStatus(
                "Paused"
            );

        }
    );

}


/* =========================================================
   STOP
   ========================================================= */

const stop =
    document.querySelector(
        "#stop"
    );


if (stop) {

    stop.addEventListener(
        "click",
        () => {

            playing =
                false;

            currentTime =
                0;


            if (timeline) {

                timeline.value =
                    "0";

            }


            if (timeLabel) {

                timeLabel.textContent =
                    "0.00s";

            }


            setStatus(
                "Stopped"
            );

        }
    );

}


/* =========================================================
   PUTER SAVE
   ========================================================= */

const saveScene =
    document.querySelector(
        "#saveScene"
    );


if (saveScene) {

    saveScene.addEventListener(
        "click",
        async () => {

            try {

                const data =
                    serializeScene();


                if (
                    typeof puter ===
                    "undefined"
                ) {

                    throw new Error(
                        "Puter.js is not loaded."
                    );

                }


                await puter.fs.write(
                    "sfm-web-project.json",
                    JSON.stringify(
                        data,
                        null,
                        2
                    )
                );


                setStatus(
                    "Scene saved"
                );

            }
            catch (error) {

                console.error(
                    error
                );


                setStatus(
                    "Save failed"
                );

            }

        }
    );

}


/* =========================================================
   PUTER LOAD
   ========================================================= */

const loadScene =
    document.querySelector(
        "#loadScene"
    );


if (loadScene) {

    loadScene.addEventListener(
        "click",
        async () => {

            try {

                if (
                    typeof puter ===
                    "undefined"
                ) {

                    throw new Error(
                        "Puter.js is not loaded."
                    );

                }


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


                setStatus(
                    "Scene loaded"
                );

            }
            catch (error) {

                console.error(
                    error
                );


                setStatus(
                    "Load failed"
                );

            }

        }
    );

}


/* =========================================================
   SERIALIZE SCENE
   ========================================================= */

function serializeScene() {

    return {

        version:
            3,


        camera:
            typeof cameraManager.serialize ===
                "function"
                ? cameraManager.serialize()
                : null,


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

    selectionManager.clear();


    if (
        data &&
        data.camera &&
        typeof cameraManager.restore ===
            "function"
    ) {

        cameraManager.restore(
            data.camera
        );

    }


    for (
        const objectData
        of data?.objects || []
    ) {

        if (
            objectData.type !==
            "Mesh"
        ) {

            continue;

        }


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

            object.rotation.set(
                objectData.rotation[0] || 0,
                objectData.rotation[1] || 0,
                objectData.rotation[2] || 0
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


    refreshOutliner();

    propertiesManager.refresh();

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

    askAI.addEventListener(
        "click",
        async () => {

            const prompt =
                aiPrompt.value.trim();


            if (!prompt)
                return;


            if (
                typeof puter ===
                "undefined"
            ) {

                aiOutput.textContent =
                    "Puter.js is not loaded.";

                return;

            }


            aiOutput.textContent =
                "Thinking...";


            try {

                const response =
                    await puter.ai.chat(
                        prompt
                    );


                if (
                    typeof response ===
                    "string"
                ) {

                    aiOutput.textContent =
                        response;

                }
                else if (
                    response?.message?.content
                ) {

                    aiOutput.textContent =
                        response.message.content;

                }
                else if (
                    response?.text
                ) {

                    aiOutput.textContent =
                        response.text;

                }
                else {

                    aiOutput.textContent =
                        JSON.stringify(
                            response,
                            null,
                            2
                        );

                }

            }
            catch (error) {

                console.error(
                    error
                );


                aiOutput.textContent =
                    "AI error: " +
                    error.message;

            }

        }
    );

}


/* =========================================================
   AI BUTTON
   ========================================================= */

const aiButton =
    document.querySelector(
        "#aiButton"
    );


if (aiButton) {

    aiButton.addEventListener(
        "click",
        () => {

            if (aiPrompt) {

                aiPrompt.focus();

            }

        }
    );

}


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

            currentTime =
                0;

        }


        if (timeline) {

            timeline.value =
                String(
                    currentTime
                );

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
   STARTUP
   ========================================================= */

const firstCube =
    sceneManager.createCube(
        "Cube"
    );


firstCube.position.set(
    0,
    0.5,
    0
);


selectionManager.select(
    firstCube
);


refreshOutliner();

propertiesManager.refresh();


setStatus(
    "SFM-Web ready"
);


animate(
    performance.now()
);
