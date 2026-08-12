// editor/camera.js
// SFM-Web camera system

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";

export class CameraManager {

    constructor(
        camera,
        renderer
    ) {

        this.camera =
            camera;

        this.renderer =
            renderer;

        this.controls =
            new OrbitControls(
                camera,
                renderer.domElement
            );

        // -----------------------------------------
        // Default SFM-style camera settings
        // -----------------------------------------

        this.controls.target.set(
            0,
            1,
            0
        );

        this.controls.enableDamping =
            true;

        this.controls.dampingFactor =
            0.08;

        this.controls.rotateSpeed =
            0.8;

        this.controls.zoomSpeed =
            1.0;

        this.controls.panSpeed =
            0.8;

        this.controls.screenSpacePanning =
            true;

        // Prevent the camera from going through
        // the near clipping plane.
        this.controls.minDistance =
            0.1;

        this.controls.maxDistance =
            500;

        this.update();
    }

    // =========================================
    // Update controls
    // =========================================

    update() {

        this.controls.update();

    }

    // =========================================
    // Look at point
    // =========================================

    lookAt(
        x,
        y,
        z
    ) {

        this.controls.target.set(
            x,
            y,
            z
        );

        this.camera.lookAt(
            x,
            y,
            z
        );

        this.update();
    }

    // =========================================
    // Set camera position
    // =========================================

    setPosition(
        x,
        y,
        z
    ) {

        this.camera.position.set(
            x,
            y,
            z
        );

        this.update();
    }

    // =========================================
    // Get position
    // =========================================

    getPosition() {

        return this.camera.position.clone();

    }

    // =========================================
    // Get target
    // =========================================

    getTarget() {

        return this.controls.target.clone();

    }

    // =========================================
    // Focus object
    // =========================================

    focusObject(
        object
    ) {

        if (!object)
            return;

        const box =
            new THREE.Box3()
                .setFromObject(
                    object
                );

        if (box.isEmpty())
            return;

        const center =
            box.getCenter(
                new THREE.Vector3()
            );

        const size =
            box.getSize(
                new THREE.Vector3()
            );

        const maxSize =
            Math.max(
                size.x,
                size.y,
                size.z
            );

        const distance =
            Math.max(
                maxSize * 2.5,
                2
            );

        const direction =
            new THREE.Vector3(
                1,
                0.65,
                1
            ).normalize();

        this.camera.position.copy(
            center
        );

        this.camera.position.add(
            direction.multiplyScalar(
                distance
            )
        );

        this.controls.target.copy(
            center
        );

        this.update();
    }

    // =========================================
    // Reset camera
    // =========================================

    reset() {

        this.camera.position.set(
            6,
            4,
            8
        );

        this.controls.target.set(
            0,
            1,
            0
        );

        this.update();
    }

    // =========================================
    // Field of view
    // =========================================

    setFOV(
        fov
    ) {

        const value =
            Number(fov);

        if (
            !Number.isFinite(
                value
            )
        ) {
            return;
        }

        this.camera.fov =
            THREE.MathUtils.clamp(
                value,
                10,
                120
            );

        this.camera.updateProjectionMatrix();
    }

    // =========================================
    // Get FOV
    // =========================================

    getFOV() {

        return this.camera.fov;

    }

    // =========================================
    // Serialize camera
    // =========================================

    serialize() {

        return {

            position:
                this.camera.position.toArray(),

            target:
                this.controls.target.toArray(),

            fov:
                this.camera.fov
        };
    }

    // =========================================
    // Restore camera
    // =========================================

    restore(
        data
    ) {

        if (!data)
            return;

        if (
            Array.isArray(
                data.position
            )
        ) {

            this.camera.position.fromArray(
                data.position
            );
        }

        if (
            Array.isArray(
                data.target
            )
        ) {

            this.controls.target.fromArray(
                data.target
            );
        }

        if (
            Number.isFinite(
                data.fov
            )
        ) {

            this.setFOV(
                data.fov
            );
        }

        this.update();
    }

    // =========================================
    // Dispose
    // =========================================

    dispose() {

        this.controls.dispose();

    }
}
