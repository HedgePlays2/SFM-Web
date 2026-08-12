// app.js
// SFM-Web main controller

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

import { SceneManager } from "./editor/scene.js";


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
   SCENE MANAGER
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


/* =========================================================
   CAMERA CONTROLS
   ========================================================= */

const controls =
    new OrbitControls(
        camera,
        renderer.domElement
    );

controls.target.set(
    0,
    1,
    0
);

controls.enableDamping = true;


/* =========================================================
   STATE
   ========================================================= */

let selected = null;

let currentTool =
    "translate";

let playing = false;

let currentTime = 0;


/* =========================================================
   SELECT OBJECT
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


        <div class="prop">

            <label>Rotation</label>

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


        <div class="prop">

            <label>Scale</label>

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


        <button
            id="deleteObject"
            class="wide"
        >
            Delete Object
        </button>
    `;


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

document.querySelector(
    "#addCube"
).onclick =
    () => {

        const cube =
            sceneManager.createCube();

        selectObject(
            cube
        );

        status.textContent =
            "Cube added";
    };


/* =========================================================
   ADD LIGHT
   ========================================================= */

document.querySelector(
    "#addLight"
).onclick =
    () => {

        const light =
            sceneManager.createLight();

        selectObject(
            light
        );

        status.textContent =
            "Light added";
    };


/* =========================================================
   TOOLS
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

document.querySelector(
    "#newScene"
).onclick =
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


/* =========================================================
   OBJECT PICKING
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


/* =========================================================
   TIMELINE
   ========================================================= */

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


document.querySelector(
    "#play"
).onclick =
    () => {

        playing = true;
    };


document.querySelector(
    "#stop"
).onclick =
    () => {

        playing = false;

        currentTime = 0;

        timeline.value = 0;

        timeLabel.textContent =
            "0.00s";
    };


/* =========================================================
   PUTER SAVE
   ========================================================= */

document.querySelector(
    "#saveScene"
).onclick =
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


/* =========================================================
   PUTER LOAD
   ========================================================= */

document.querySelector(
    "#loadScene"
).onclick =
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


/* =========================================================
   SERIALIZE
   ========================================================= */

function serializeScene() {

    return {

        version: 1,

        camera: {

            position:
                camera.position.toArray(),

            target:
                controls.target.toArray()
        },

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

    selected = null;


    if (data.camera) {

        camera.position.fromArray(
            data.camera.position
        );

        controls.target.fromArray(
            data.camera.target
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
                    objectData.name
                );


            object.position.fromArray(
                objectData.position
            );

            object.rotation.fromArray(
                objectData.rotation
            );

            object.scale.fromArray(
                objectData.scale
            );
        }
    }


    refreshOutliner();

    renderProperties();
}


/* =========================================================
   PUTER AI
   ========================================================= */

document.querySelector(
    "#askAI"
).onclick =
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

                    `You are an assistant for SFM-Web,
a browser-based Source Filmmaker-style editor.

Help with:
- filmmaking
- camera composition
- lighting
- posing
- animation
- scene setup

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


/* =========================================================
   AI BUTTON
   ========================================================= */

document.querySelector(
    "#aiButton"
).onclick =
    () => {

        aiPrompt.focus();
    };


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


    controls.update();

    sceneManager.render();
}


/* =========================================================
   START
   ========================================================= */

const firstCube =
    sceneManager.createCube(
        "Cube"
    );

selectObject(
    firstCube
);

animate(
    performance.now()
);
