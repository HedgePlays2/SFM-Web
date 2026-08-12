// app.js
// SFM-Web main controller

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

import { SceneManager } from "./editor/scene.js";
import { CameraManager } from "./editor/camera.js";
import { SelectionManager } from "./editor/selection.js";
import { GizmoManager } from "./editor/gizmos.js";
import { PropertiesManager } from "./editor/properties.js";

import { KeyframeManager } from "./animation/keyframes.js";
import { Animator } from "./animation/animator.js";
import { Timeline } from "./animation/timeline.js";
import { BoneManager } from "./animation/bones.js";


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

const timelineElement =
    document.querySelector("#timeline");

const timeLabel =
    document.querySelector("#timeLabel");

const aiPrompt =
    document.querySelector("#aiPrompt");

const aiOutput =
    document.querySelector("#aiOutput");


/* =========================================================
   VIEWPORT CHECK
   ========================================================= */

if (!viewport) {

    throw new Error(
        "SFM-Web: #viewport was not found."
    );

}


/* =========================================================
   CORE
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


const propertiesManager =
    new PropertiesManager(
        properties,
        selectionManager,
        cameraManager,
        sceneManager
    );


/* =========================================================
   ANIMATION SYSTEM
   ========================================================= */

const keyframeManager =
    new KeyframeManager();


const animator =
    new Animator(
        keyframeManager
    );


animator.setObjectProvider(
    () => sceneManager.objects
);


const timeline =
    new Timeline(
        timelineElement,
        animator,
        keyframeManager
    );


timeline.setDuration(
    10
);


/* =========================================================
   BONES
   ========================================================= */

const boneManager =
    new BoneManager();


/* =========================================================
   STATE
   ========================================================= */

let currentTool =
    "translate";


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
   SELECTION
   ========================================================= */

selectionManager.onSelectionChanged(
    object => {

        refreshOutliner();

        propertiesManager.refresh();

        timeline.setSelectedObject(
            object
        );


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
   GIZMO CHANGES
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
   KEYBOARD
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


        else if (
            event.key === "Delete"
        ) {

            deleteSelected();

        }


        /* Space = play/pause */

        else if (
            event.code === "Space"
        ) {

            event.preventDefault();

            togglePlayback();

        }


        /* Left arrow = previous keyframe */

        else if (
            event.key === "ArrowLeft"
        ) {

            timeline.previousKeyframe();

        }


        /* Right arrow = next keyframe */

        else if (
            event.key === "ArrowRight"
        ) {

            timeline.nextKeyframe();

        }

    }
);


/* =========================================================
   DELETE
   ========================================================= */

function deleteSelected() {

    const object =
        selectionManager.getSelected();


    if (!object)
        return;


    keyframeManager.removeObject(
        object
    );


    boneManager.removeModel(
        object
    );


    sceneManager.removeObject(
        object
    );


    selectionManager.clear();


    setStatus(
        "Object deleted"
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


                    /*
                     * If this model contains
                     * bones, register it.
                     */

                    const bones = [];

                    model.traverse(
                        object => {

                            if (
                                object.isBone
                            ) {

                                bones.push(
                                    object
                                );

                            }

                        }
                    );


                    if (
                        bones.length > 0
                    ) {

                        boneManager.registerModel(
                            model
                        );

                        setStatus(
                            `Imported rigged model: ${name}`
                        );

                    }
                    else {

                        setStatus(
                            `Imported ${name}`
                        );

                    }


                    selectionManager.select(
                        model
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
   KEYFRAME HELPERS
   ========================================================= */

function createTransformKeyframes() {

    const object =
        selectionManager.getSelected();


    if (!object) {

        setStatus(
            "Select an object first"
        );

        return;

    }


    const time =
        timeline.getTime();


    keyframeManager.addKeyframe(
        object,
        "position",
        time,
        object.position.toArray()
    );


    keyframeManager.addKeyframe(
        object,
        "rotation",
        time,
        [
            object.rotation.x,
            object.rotation.y,
            object.rotation.z
        ]
    );


    keyframeManager.addKeyframe(
        object,
        "scale",
        time,
        object.scale.toArray()
    );


    setStatus(
        `Keyframe added at ${time.toFixed(2)}s`
    );

}


/* =========================================================
   KEYFRAME BUTTON
   ========================================================= */

const addKeyframe =
    document.querySelector(
        "#addKeyframe"
    );


if (addKeyframe) {

    addKeyframe.addEventListener(
        "click",
        createTransformKeyframes
    );

}


/* =========================================================
   DELETE KEYFRAME
   ========================================================= */

const deleteKeyframe =
    document.querySelector(
        "#deleteKeyframe"
    );


if (deleteKeyframe) {

    deleteKeyframe.addEventListener(
        "click",
        () => {

            const object =
                selectionManager.getSelected();


            if (!object)
                return;


            const time =
                timeline.getTime();


            keyframeManager.removeKeyframe(
                object,
                "position",
                time
            );


            keyframeManager.removeKeyframe(
                object,
                "rotation",
                time
            );


            keyframeManager.removeKeyframe(
                object,
                "scale",
                time
            );


            setStatus(
                `Keyframe removed at ${time.toFixed(2)}s`
            );

        }
    );

}


/* =========================================================
   PLAY / PAUSE
   ========================================================= */

function togglePlayback() {

    if (
        animator.isPlaying()
    ) {

        animator.pause();

        setStatus(
            "Paused"
        );

    }
    else {

        animator.play();

        setStatus(
            "Playing"
        );

    }

}


const play =
    document.querySelector(
        "#play"
    );


if (play) {

    play.addEventListener(
        "click",
        () => {

            animator.play();

            setStatus(
                "Playing"
            );

        }
    );

}


const pause =
    document.querySelector(
        "#pause"
    );


if (pause) {

    pause.addEventListener(
        "click",
        () => {

            animator.pause();

            setStatus(
                "Paused"
            );

        }
    );

}


const stop =
    document.querySelector(
        "#stop"
    );


if (stop) {

    stop.addEventListener(
        "click",
        () => {

            animator.stop();

            timeline.setTime(
                0,
                false
            );

            setStatus(
                "Stopped"
            );

        }
    );

}


/* =========================================================
   TIMELINE CALLBACK
   ========================================================= */

timeline.onTimeChange(
    time => {

        currentTime =
            time;


        if (timeLabel) {

            timeLabel.textContent =
                time.toFixed(2) +
                "s";

        }

    }
);


/* =========================================================
   TIMELINE DURATION
   ========================================================= */

const durationInput =
    document.querySelector(
        "#duration"
    );


if (durationInput) {

    durationInput.addEventListener(
        "change",
        () => {

            timeline.setDuration(
                Number(
                    durationInput.value
                )
            );

        }
    );

}


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

            animator.stop();

            keyframeManager.clear();

            boneManager.clear();

            sceneManager.clearObjects();

            selectionManager.clear();

            cameraManager.reset();

            timeline.clear();


            refreshOutliner();

            propertiesManager.refresh();


            setStatus(
                "New scene"
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

                if (
                    typeof puter ===
                    "undefined"
                ) {

                    throw new Error(
                        "Puter.js is not loaded."
                    );

                }


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
   SERIALIZE
   ========================================================= */

function serializeScene() {

    return {

        version:
            4,


        camera:
            typeof cameraManager.serialize ===
            "function"
                ? cameraManager.serialize()
                : null,


        objects:
            sceneManager.objects.map(
                object => ({

                    uuid:
                        object.uuid,

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
            ),


        keyframes:
            keyframeManager.serialize()

    };

}


/* =========================================================
   RESTORE
   ========================================================= */

function restoreScene(
    data
) {

    animator.stop();

    keyframeManager.clear();

    boneManager.clear();

    sceneManager.clearObjects();

    selectionManager.clear();


    if (
        data?.camera &&
        typeof cameraManager.restore ===
        "function"
    ) {

        cameraManager.restore(
            data.camera
        );

    }


    const uuidMap =
        new Map();


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


        object.position.fromArray(
            objectData.position ||
            [0, 0, 0]
        );


        object.rotation.set(
            objectData.rotation?.[0] || 0,
            objectData.rotation?.[1] || 0,
            objectData.rotation?.[2] || 0
        );


        object.scale.fromArray(
            objectData.scale ||
            [1, 1, 1]
        );


        uuidMap.set(
            objectData.uuid,
            object
        );

    }


    /*
     * Keyframes use UUIDs.
     *
     * Since loaded objects receive
     * new UUIDs, rebuild the
     * keyframe data using the
     * saved object order.
     */

    if (
        data?.keyframes
    ) {

        const savedObjects =
            data.objects || [];


        for (
            const savedObject
            of savedObjects
        ) {

            const object =
                uuidMap.get(
                    savedObject.uuid
                );


            if (!object)
                continue;


            const tracks =
                data.keyframes[
                    savedObject.uuid
                ];


            if (!tracks)
                continue;


            for (
                const property
                of Object.keys(
                    tracks
                )
            ) {

                for (
                    const keyframe
                    of tracks[property]
                ) {

                    keyframeManager.addKeyframe(
                        object,
                        property,
                        keyframe.time,
                        keyframe.value
                    );

                }

            }

        }

    }


    refreshOutliner();

    propertiesManager.refresh();


    const firstObject =
        sceneManager.objects[0];


    if (firstObject) {

        selectionManager.select(
            firstObject
        );

    }

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

            aiPrompt?.focus();

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
        Math.min(
            (now - lastTime) / 1000,
            0.1
        );


    lastTime =
        now;


    animator.update(
        delta
    );


    timeline.update();


    cameraManager.update();

    sceneManager.render();

}


/* =========================================================
   INITIAL SCENE
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


timeline.setSelectedObject(
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
