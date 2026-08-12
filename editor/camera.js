// editor/camera.js
// SFM-Web Editor Camera

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


export class CameraManager {

    constructor(
        camera,
        renderer
    ) {

        this.camera =
            camera;

        this.renderer =
            renderer;

        this.canvas =
            renderer.domElement;


        // =================================================
        // Camera state
        // =================================================

        this.target =
            new THREE.Vector3(
                0,
                0,
                0
            );

        this.distance =
            12;

        this.yaw =
            Math.PI * 0.25;

        this.pitch =
            Math.PI * 0.25;


        this.minDistance =
            1;

        this.maxDistance =
            1000;


        this.minPitch =
            -Math.PI / 2 + 0.05;

        this.maxPitch =
            Math.PI / 2 - 0.05;


        // =================================================
        // Mouse state
        // =================================================

        this.dragging =
            false;

        this.middleDragging =
            false;

        this.rightDragging =
            false;

        this.lastX =
            0;

        this.lastY =
            0;


        // =================================================
        // Controls
        // =================================================

        this.setupControls();


        this.update();

    }


    // =====================================================
    // Setup mouse controls
    // =====================================================

    setupControls() {

        this.canvas.addEventListener(
            "contextmenu",
            event => {

                event.preventDefault();

            }
        );


        this.canvas.addEventListener(
            "mousedown",
            event => {

                this.lastX =
                    event.clientX;

                this.lastY =
                    event.clientY;


                /*
                 * Middle mouse = pan
                 */

                if (
                    event.button === 1
                ) {

                    this.middleDragging =
                        true;

                    event.preventDefault();

                    return;

                }


                /*
                 * Right mouse = orbit
                 */

                if (
                    event.button === 2
                ) {

                    this.rightDragging =
                        true;

                    event.preventDefault();

                    return;

                }


                /*
                 * Left mouse = orbit as well
                 * when Alt is held.
                 */

                if (
                    event.button === 0 &&
                    event.altKey
                ) {

                    this.dragging =
                        true;

                }

            }
        );


        window.addEventListener(
            "mouseup",
            event => {

                if (
                    event.button === 0
                ) {

                    this.dragging =
                        false;

                }


                if (
                    event.button === 1
                ) {

                    this.middleDragging =
                        false;

                }


                if (
                    event.button === 2
                ) {

                    this.rightDragging =
                        false;

                }

            }
        );


        window.addEventListener(
            "mousemove",
            event => {

                const dx =
                    event.clientX -
                    this.lastX;

                const dy =
                    event.clientY -
                    this.lastY;


                this.lastX =
                    event.clientX;

                this.lastY =
                    event.clientY;


                /*
                 * Orbit
                 */

                if (
                    this.rightDragging ||
                    this.dragging
                ) {

                    this.orbit(
                        dx,
                        dy
                    );

                }


                /*
                 * Pan
                 */

                if (
                    this.middleDragging
                ) {

                    this.pan(
                        dx,
                        dy
                    );

                }

            }
        );


        /*
         * Mouse wheel = zoom
         */

        this.canvas.addEventListener(
            "wheel",
            event => {

                event.preventDefault();


                const amount =
                    event.deltaY *
                    0.01;


                this.zoom(
                    amount
                );

            },
            {
                passive: false
            }
        );


        /*
         * Touch support
         */

        this.canvas.addEventListener(
            "touchstart",
            event => {

                if (
                    event.touches.length !== 1
                ) {

                    return;

                }


                const touch =
                    event.touches[0];


                this.lastX =
                    touch.clientX;

                this.lastY =
                    touch.clientY;


                this.dragging =
                    true;

            },
            {
                passive: true
            }
        );


        this.canvas.addEventListener(
            "touchmove",
            event => {

                if (
                    event.touches.length !== 1 ||
                    !this.dragging
                ) {

                    return;

                }


                const touch =
                    event.touches[0];


                const dx =
                    touch.clientX -
                    this.lastX;

                const dy =
                    touch.clientY -
                    this.lastY;


                this.lastX =
                    touch.clientX;

                this.lastY =
                    touch.clientY;


                this.orbit(
                    dx,
                    dy
                );

            },
            {
                passive: true
            }
        );


        this.canvas.addEventListener(
            "touchend",
            () => {

                this.dragging =
                    false;

            }
        );

    }


    // =====================================================
    // Orbit camera
    // =====================================================

    orbit(
        dx,
        dy
    ) {

        const sensitivity =
            0.005;


        this.yaw -=
            dx *
            sensitivity;


        this.pitch -=
            dy *
            sensitivity;


        this.pitch =
            Math.max(
                this.minPitch,
                Math.min(
                    this.maxPitch,
                    this.pitch
                )
            );


        this.update();

    }


    // =====================================================
    // Pan camera
    // =====================================================

    pan(
        dx,
        dy
    ) {

        const sensitivity =
            this.distance *
            0.0015;


        const forward =
            new THREE.Vector3();


        this.camera.getWorldDirection(
            forward
        );


        const right =
            new THREE.Vector3();


        right.crossVectors(
            forward,
            this.camera.up
        ).normalize();


        const up =
            new THREE.Vector3();


        up.crossVectors(
            right,
            forward
        ).normalize();


        this.target.addScaledVector(
            right,
            -dx * sensitivity
        );


        this.target.addScaledVector(
            up,
            dy * sensitivity
        );


        this.update();

    }


    // =====================================================
    // Zoom
    // =====================================================

    zoom(
        amount
    ) {

        this.distance *=
            1 +
            amount;


        this.distance =
            Math.max(
                this.minDistance,
                Math.min(
                    this.maxDistance,
                    this.distance
                )
            );


        this.update();

    }


    // =====================================================
    // Focus object
    // =====================================================

    focusObject(
        object
    ) {

        if (!object)
            return;


        const box =
            new THREE.Box3();


        box.setFromObject(
            object
        );


        const center =
            new THREE.Vector3();


        box.getCenter(
            center
        );


        const size =
            new THREE.Vector3();


        box.getSize(
            size
        );


        const radius =
            Math.max(
                size.x,
                size.y,
                size.z
            );


        this.target.copy(
            center
        );


        this.distance =
            Math.max(
                radius * 2.5,
                2
            );


        this.update();

    }


    // =====================================================
    // Set target
    // =====================================================

    setTarget(
        x,
        y,
        z
    ) {

        this.target.set(
            x,
            y,
            z
        );


        this.update();

    }


    // =====================================================
    // Get target
    // =====================================================

    getTarget() {

        return this.target.clone();

    }


    // =====================================================
    // Set distance
    // =====================================================

    setDistance(
        distance
    ) {

        this.distance =
            Math.max(
                this.minDistance,
                Math.min(
                    this.maxDistance,
                    distance
                )
            );


        this.update();

    }


    // =====================================================
    // Reset camera
    // =====================================================

    reset() {

        this.target.set(
            0,
            0,
            0
        );


        this.distance =
            12;


        this.yaw =
            Math.PI * 0.25;


        this.pitch =
            Math.PI * 0.25;


        this.update();

    }


    // =====================================================
    // Update camera
    // =====================================================

    update() {

        const cosPitch =
            Math.cos(
                this.pitch
            );


        const x =
            this.target.x +
            this.distance *
            cosPitch *
            Math.sin(
                this.yaw
            );


        const y =
            this.target.y +
            this.distance *
            Math.sin(
                this.pitch
            );


        const z =
            this.target.z +
            this.distance *
            cosPitch *
            Math.cos(
                this.yaw
            );


        this.camera.position.set(
            x,
            y,
            z
        );


        this.camera.lookAt(
            this.target
        );

    }


    // =====================================================
    // Get camera
    // =====================================================

    getCamera() {

        return this.camera;

    }


    // =====================================================
    // Serialize
    // =====================================================

    serialize() {

        return {

            position:
                this.camera.position.toArray(),

            target:
                this.target.toArray(),

            distance:
                this.distance,

            yaw:
                this.yaw,

            pitch:
                this.pitch

        };

    }


    // =====================================================
    // Restore
    // =====================================================

    restore(
        data
    ) {

        if (!data)
            return;


        if (
            Array.isArray(
                data.target
            )
        ) {

            this.target.fromArray(
                data.target
            );

        }


        if (
            typeof data.distance ===
            "number"
        ) {

            this.distance =
                data.distance;

        }


        if (
            typeof data.yaw ===
            "number"
        ) {

            this.yaw =
                data.yaw;

        }


        if (
            typeof data.pitch ===
            "number"
        ) {

            this.pitch =
                data.pitch;

        }


        this.update();

    }


    // =====================================================
    // Cleanup
    // =====================================================

    destroy() {

        this.canvas.style.touchAction =
            "auto";

    }

}
