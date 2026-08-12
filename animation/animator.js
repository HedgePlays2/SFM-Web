// animation/animator.js
// SFM-Web Animation System

export class Animator {

    constructor(keyframeManager) {

        this.keyframes =
            keyframeManager;

        this.currentTime =
            0;

        this.playing =
            false;

        this.speed =
            1;

        this.loop =
            true;

        this.duration =
            10;

        this.onTimeChanged =
            null;

    }


    // =====================================================
    // Set current time
    // =====================================================

    setTime(time) {

        this.currentTime =
            Math.max(
                0,
                Number(time) || 0
            );

        this.apply();

        this.notifyTime();

    }


    // =====================================================
    // Get current time
    // =====================================================

    getTime() {

        return this.currentTime;

    }


    // =====================================================
    // Play
    // =====================================================

    play() {

        this.playing =
            true;

    }


    // =====================================================
    // Pause
    // =====================================================

    pause() {

        this.playing =
            false;

    }


    // =====================================================
    // Toggle
    // =====================================================

    toggle() {

        this.playing =
            !this.playing;

        return this.playing;

    }


    // =====================================================
    // Stop
    // =====================================================

    stop() {

        this.playing =
            false;

        this.setTime(
            0
        );

    }


    // =====================================================
    // Update animation
    // =====================================================

    update(delta) {

        if (
            !this.playing
        ) {

            return;

        }


        const amount =
            Math.max(
                0,
                Number(delta) || 0
            );


        this.currentTime +=
            amount *
            this.speed;


        if (
            this.currentTime >=
            this.duration
        ) {

            if (
                this.loop
            ) {

                this.currentTime =
                    0;

            }
            else {

                this.currentTime =
                    this.duration;

                this.playing =
                    false;

            }

        }


        this.apply();

        this.notifyTime();

    }


    // =====================================================
    // Apply animation to objects
    // =====================================================

    apply() {

        if (
            !this.objectProvider
        ) {

            return;

        }


        const objects =
            this.objectProvider();


        if (
            !objects ||
            !Array.isArray(objects)
        ) {

            return;

        }


        for (
            const object
            of objects
        ) {

            this.applyToObject(
                object
            );

        }

    }


    // =====================================================
    // Apply animation to one object
    // =====================================================

    applyToObject(
        object
    ) {

        if (!object)
            return;


        const tracks =
            this.keyframes.getAllTracks(
                object
            );


        for (
            const [
                property
            ]
            of tracks
        ) {

            const value =
                this.keyframes.getValueAtTime(
                    object,
                    property,
                    this.currentTime
                );


            if (
                value === null ||
                value === undefined
            ) {

                continue;

            }


            this.applyProperty(
                object,
                property,
                value
            );

        }

    }


    // =====================================================
    // Apply property
    // =====================================================

    applyProperty(
        object,
        property,
        value
    ) {

        if (
            property ===
            "position"
        ) {

            if (
                Array.isArray(value) &&
                value.length >= 3
            ) {

                object.position.set(
                    value[0],
                    value[1],
                    value[2]
                );

            }

            return;

        }


        if (
            property ===
            "rotation"
        ) {

            if (
                Array.isArray(value) &&
                value.length >= 3
            ) {

                object.rotation.set(
                    value[0],
                    value[1],
                    value[2]
                );

            }

            return;

        }


        if (
            property ===
            "scale"
        ) {

            if (
                Array.isArray(value) &&
                value.length >= 3
            ) {

                object.scale.set(
                    value[0],
                    value[1],
                    value[2]
                );

            }

            return;

        }


        // Generic property
        if (
            property in object
        ) {

            object[property] =
                value;

        }

    }


    // =====================================================
    // Set object provider
    // =====================================================

    setObjectProvider(
        callback
    ) {

        this.objectProvider =
            typeof callback ===
            "function"
                ? callback
                : null;

    }


    // =====================================================
    // Set duration
    // =====================================================

    setDuration(
        duration
    ) {

        this.duration =
            Math.max(
                0.1,
                Number(duration) || 10
            );


        if (
            this.currentTime >
            this.duration
        ) {

            this.setTime(
                this.duration
            );

        }

    }


    // =====================================================
    // Set speed
    // =====================================================

    setSpeed(
        speed
    ) {

        this.speed =
            Number(speed) || 1;

    }


    // =====================================================
    // Set loop
    // =====================================================

    setLoop(
        enabled
    ) {

        this.loop =
            Boolean(enabled);

    }


    // =====================================================
    // Time callback
    // =====================================================

    onTimeChange(
        callback
    ) {

        this.onTimeChanged =
            typeof callback ===
            "function"
                ? callback
                : null;

    }


    // =====================================================
    // Notify time
    // =====================================================

    notifyTime() {

        if (
            this.onTimeChanged
        ) {

            this.onTimeChanged(
                this.currentTime
            );

        }

    }


    // =====================================================
    // Get animation duration
    // =====================================================

    getDuration() {

        return this.duration;

    }


    // =====================================================
    // Get playing state
    // =====================================================

    isPlaying() {

        return this.playing;

    }


    // =====================================================
    // Clear animation
    // =====================================================

    clear() {

        this.keyframes.clear();

        this.currentTime =
            0;

        this.playing =
            false;

    }

}
