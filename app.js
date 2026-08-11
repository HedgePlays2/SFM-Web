```javascript
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

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
   THREE.JS SCENE
   ========================================================= */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x101218);


/* =========================================================
   CAMERA
   ========================================================= */

const camera = new THREE.PerspectiveCamera(
    55,
    1,
    0.1,
    1000
);

camera.position.set(
    6,
    4,
    8
);


/* =========================================================
   RENDERER
   ========================================================= */

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;

viewport.appendChild(
    renderer.domElement
);


/* =========================================================
   CAMERA CONTROLS
   ========================================================= */

const controls = new OrbitControls(
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
   LIGHTING
   ========================================================= */

const hemisphereLight =
    new THREE.HemisphereLight(
        0xb9c7ff,
        0x222222,
        2
    );

scene.add(
    hemisphereLight
);


const keyLight =
    new THREE.DirectionalLight(
        0xffffff,
        3
    );

keyLight.position.set(
    5,
    8,
    5
);

keyLight.castShadow = true;

scene.add(
    keyLight
);


/* =========================================================
   EDITOR GRID
   ========================================================= */

const grid =
    new THREE.GridHelper(
        30,
        30,
        0x4b515c,
        0x292d35
    );

scene.add(
    grid
);


/* =========================================================
   OBJECT MANAGEMENT
   ========================================================= */

const objects = [];

let selected = null;

let currentTool = "translate";

let playing = false;

let currentTime = 0;


/* =========================================================
   ADD OBJECT
   ========================================================= */

function addObject(
    object,
    name = "Object"
) {

    object.name = name;

    object.userData.editorObject = true;

    scene.add(
        object
    );

    objects.push(
        object
    );

    selectObject(
        object
    );

    refreshOutliner();
}


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
        const object of objects
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

        row.onclick = () =>
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

            <label>
                Name
            </label>

            <input
                id="propName"
                value="${escapeHTML(selected.name)}"
            >

        </div>


        <div class="prop">

            <label>
                Position
            </label>

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

            <label>
                Rotation
            </label>

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

            <label>
                Scale
            </label>

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
            id="deleteObject"
            class="wide"
        >
            Delete Object
        </button>

    `;


    /* NAME */

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


    /* POSITION */

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


    /* ROTATION */

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


    /* SCALE */

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


    /* DELETE */

    document.querySelector(
        "#deleteObject"
    ).onclick = () => {

        if (!selected)
            return;

        scene.remove(
            selected
        );

        const index =
            objects.indexOf(
                selected
            );

        if (index !== -1) {

            objects.splice(
                index,
                1
            );

        }

        selected = null;

        refreshOutliner();

        renderProperties();

    };

}


/* =========================================================
   PROPERTY HELPERS
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
                parseFloat(
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

function addCube() {

    const geometry =
        new THREE.BoxGeometry(
            1.5,
            1.5,
            1.5
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x7b8cff,
            roughness: 0.65
        });

    const cube =
        new THREE.Mesh(
            geometry,
            material
        );

    cube.position.y =
        0.75;

    cube.castShadow =
        true;

    cube.receiveShadow =
        true;

    addObject(
        cube,
        "Cube"
    );

}


document.querySelector(
    "#addCube"
).onclick =
    addCube;


/* =========================================================
   ADD LIGHT
   ========================================================= */

function addLight() {

    const light =
        new THREE.PointLight(
            0xffddaa,
            30,
            15
        );

    light.position.set(
        2,
        4,
        2
    );


    const marker =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.12
            ),

            new THREE.MeshBasicMaterial({
                color: 0xffddaa
            })

        );


    light.add(
        marker
    );


    addObject(
        light,
        "Light"
    );

}


document.querySelector(
    "#addLight"
).onclick =
    addLight;


/* =========================================================
   EDITOR TOOLS
   ========================================================= */

document
    .querySelectorAll(
        "[data-tool]"
    )
    .forEach(
        button => {

            button.onclick = () => {

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
).onclick = () => {

    for (
        const object of [
            ...objects
        ]
    ) {

        scene.remove(
            object
        );

    }

    objects.length = 0;

    selected = null;

    currentTime = 0;

    timeline.value = 0;

    refreshOutliner();

    renderProperties();

    status.textContent =
        "New scene";

};


/* =========================================================
   OBJECT SELECTION
   ========================================================= */

const raycaster =
    new THREE.Raycaster();

const mouse =
    new THREE.Vector2();


renderer.domElement
    .addEventListener(
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
                    objects,
                    true
                );


            if (!hits.length)
                return;


            let object =
                hits[0].object;


            while (
                object.parent &&
                !objects.includes(
                    object
                )
            ) {

                object =
                    object.parent;

            }


            if (
                objects.includes(
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
   GLB / GLTF MODEL IMPORT
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
                    file.name
                        .replace(
                            /\.(glb|gltf)$/i,
                            ""
                        );


                addObject(
                    model,
                    name
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
   SCENE SERIALIZATION
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
            objects.map(
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
   PUTER SAVE
   ========================================================= */

document.querySelector(
    "#saveScene"
).onclick = async () => {

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
    catch (
        error
    ) {

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
).onclick = async () => {

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
    catch (
        error
    ) {

        console.error(
            error
        );

        status.textContent =
            "No saved project found";

    }

};


/* =========================================================
   RESTORE SCENE
   ========================================================= */

function restoreScene(
    data
) {

    for (
        const object of [
            ...objects
        ]
    ) {

        scene.remove(
            object
        );

    }

    objects.length = 0;

    selected = null;


    if (
        data.camera
    ) {

        camera.position.fromArray(
            data.camera.position
        );

        controls.target.fromArray(
            data.camera.target
        );

    }


    for (
        const objectData of
        data.objects || []
    ) {

        if (
            objectData.type ===
            "Mesh"
        ) {

            const mesh =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        1.5,
                        1.5,
                        1.5
                    ),

                    new THREE.MeshStandardMaterial({
                        color: 0x7b8cff
                    })

                );


            mesh.position.fromArray(
                objectData.position
            );


            mesh.rotation.fromArray(
                objectData.rotation
            );


            mesh.scale.fromArray(
                objectData.scale
            );


            addObject(
                mesh,
                objectData.name
            );

        }

    }


    selected = null;

    refreshOutliner();

    renderProperties();

}


/* =========================================================
   PUTER AI ASSISTANT
   ========================================================= */

document.querySelector(
    "#askAI"
).onclick = async () => {

    const prompt =
        aiPrompt.value.trim();


    if (!prompt)
        return;


    aiOutput.textContent =
        "Thinking...";


    try {

        const sceneData =
            JSON.stringify(
                serializeScene()
            );


        const response =
            await puter.ai.chat(

                `You are an assistant for a browser-based Source Filmmaker-style editor.

Help with:
- camera composition
- scene setup
- animation ideas
- lighting
- posing
- filmmaking
- troubleshooting

Current scene:

${sceneData}

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
    catch (
        error
    ) {

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
).onclick = () => {

    aiPrompt.focus();

};


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


/* =========================================================
   PLAY
   ========================================================= */

document.querySelector(
    "#play"
).onclick = () => {

    playing = true;

};


/* =========================================================
   STOP
   ========================================================= */

document.querySelector(
    "#stop"
).onclick = () => {

    playing = false;

    currentTime = 0;

    timeline.value = 0;

    timeLabel.textContent =
        "0.00s";

};


/* =========================================================
   RESIZE
   ========================================================= */

function resizeRenderer() {

    const width =
        viewport.clientWidth;

    const height =
        viewport.clientHeight;


    if (
        width <= 0 ||
        height <= 0
    ) {

        return;

    }


    camera.aspect =
        width / height;


    camera.updateProjectionMatrix();


    renderer.setSize(
        width,
        height,
        false
    );

}


const resizeObserver =
    new ResizeObserver(
        resizeRenderer
    );


resizeObserver.observe(
    viewport
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


    controls.update();


    renderer.render(
        scene,
        camera
    );

}


/* =========================================================
   START
   ========================================================= */

resizeRenderer();

addCube();

animate(
    performance.now()
);
```
