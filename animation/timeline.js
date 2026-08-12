// animation/timeline.js
// SFM-Web Timeline System

export class Timeline {

    constructor(
        element,
        animator,
        keyframeManager
    ) {

        this.element =
            element;

        this.animator =
            animator;

        this.keyframes =
            keyframeManager;

        this.duration =
            10;

        this.currentTime =
            0;

        this.selectedObject =
            null;

        this.onTimeChanged =
            null;

        this.onKeyframeSelected =
            null;


        this.setup();

    }


    // =====================================================
    // Setup
    // =====================================================

    setup() {

        if (!this.element)
            return;


        this.element.addEventListener(
            "input",
            () => {

                const time =
                    Number(
                        this.element.value
                    );


                this.setTime(
                    time,
                    true
                );

            }
        );


        this.element.addEventListener(
            "change",
            () => {

                const time =
                    Number(
                        this.element.value
                    );


                this.setTime(
                    time,
                    true
                );

            }
        );

    }


    // =====================================================
    // Set time
    // =====================================================

    setTime(
        time,
        updateAnimator = true
    ) {

        this.currentTime =
            Math.max(
                0,
                Math.min(
                    this.duration,
                    Number(time) || 0
                )
            );


        if (this.element) {

            this.element.value =
                String(
                    this.currentTime
                );

        }


        if (
            updateAnimator &&
            this.animator
        ) {

            this.animator.setTime(
                this.currentTime
            );

        }


        this.notifyTime();

    }


    // =====================================================
    // Get time
    // =====================================================

    getTime() {

        return this.currentTime;

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


        if (this.element) {

            this.element.max =
                String(
                    this.duration
                );

        }


        if (
            this.currentTime >
            this.duration
        ) {

            this.setTime(
                this.duration
            );

        }


        if (this.animator) {

            this.animator.setDuration(
                this.duration
            );

        }

    }


    // =====================================================
    // Get duration
    // =====================================================

    getDuration() {

        return this.duration;

    }


    // =====================================================
    // Play
    // =====================================================

    play() {

        if (this.animator) {

            this.animator.play();

        }

    }


    // =====================================================
    // Pause
    // =====================================================

    pause() {

        if (this.animator) {

            this.animator.pause();

        }

    }


    // =====================================================
    // Stop
    // =====================================================

    stop() {

        if (this.animator) {

            this.animator.stop();

        }


        this.setTime(
            0,
            false
        );

    }


    // =====================================================
    // Set selected object
    // =====================================================

    setSelectedObject(
        object
    ) {

        this.selectedObject =
            object;

    }


    // =====================================================
    // Get selected object's keyframes
    // =====================================================

    getKeyframeTimes() {

        if (
            !this.selectedObject
        ) {

            return [];

        }


        return this.keyframes.getKeyframeTimes(
            this.selectedObject
        );

    }


    // =====================================================
    // Add keyframe at current time
    // =====================================================

    addKeyframe(
        property,
        value
    ) {

        if (
            !this.selectedObject
        ) {

            return null;

        }


        const keyframe =
            this.keyframes.addKeyframe(
                this.selectedObject,
                property,
                this.currentTime,
                value
            );


        this.notifyKeyframe(
            keyframe
        );


        return keyframe;

    }


    // =====================================================
    // Remove keyframe
    // =====================================================

    removeKeyframe(
        property
    ) {

        if (
            !this.selectedObject
        ) {

            return false;

        }


        const result =
            this.keyframes.removeKeyframe(
                this.selectedObject,
                property,
                this.currentTime
            );


        return result;

    }


    // =====================================================
    // Check if keyframe exists
    // =====================================================

    hasKeyframe(
        property
    ) {

        if (
            !this.selectedObject
        ) {

            return false;

        }


        const keyframes =
            this.keyframes.getKeyframes(
                this.selectedObject,
                property
            );


        return keyframes.some(
            keyframe =>
                Math.abs(
                    keyframe.time -
                    this.currentTime
                ) < 0.0001
        );

    }


    // =====================================================
    // Find nearest keyframe
    // =====================================================

    getNearestKeyframe(
        tolerance = 0.15
    ) {

        const times =
            this.getKeyframeTimes();


        if (
            times.length === 0
        ) {

            return null;

        }


        let nearest =
            null;

        let distance =
            Infinity;


        for (
            const time
            of times
        ) {

            const difference =
                Math.abs(
                    time -
                    this.currentTime
                );


            if (
                difference <
                distance
            ) {

                distance =
                    difference;

                nearest =
                    time;

            }

        }


        if (
            distance >
            tolerance
        ) {

            return null;

        }


        return nearest;

    }


    // =====================================================
    // Previous keyframe
    // =====================================================

    previousKeyframe() {

        const times =
            this.getKeyframeTimes();


        let previous =
            null;


        for (
            const time
            of times
        ) {

            if (
                time <
                this.currentTime -
                0.0001
            ) {

                previous =
                    time;

            }

        }


        if (
            previous !== null
        ) {

            this.setTime(
                previous
            );

        }


        return previous;

    }


    // =====================================================
    // Next keyframe
    // =====================================================

    nextKeyframe() {

        const times =
            this.getKeyframeTimes();


        for (
            const time
            of times
        ) {

            if (
                time >
                this.currentTime +
                0.0001
            ) {

                this.setTime(
                    time
                );

                return time;

            }

        }


        return null;

    }


    // =====================================================
    // Start of timeline
    // =====================================================

    goToStart() {

        this.setTime(
            0
        );

    }


    // =====================================================
    // End of timeline
    // =====================================================

    goToEnd() {

        this.setTime(
            this.duration
        );

    }


    // =====================================================
    // Update from animator
    // =====================================================

    update() {

        if (!this.animator)
            return;


        const time =
            this.animator.getTime();


        this.currentTime =
            time;


        if (this.element) {

            this.element.value =
                String(
                    time
                );

        }


        this.notifyTime();

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
    // Keyframe callback
    // =====================================================

    onKeyframe(
        callback
    ) {

        this.onKeyframeSelected =
            typeof callback ===
            "function"
                ? callback
                : null;

    }


    // =====================================================
    // Notify keyframe
    // =====================================================

    notifyKeyframe(
        keyframe
    ) {

        if (
            this.onKeyframeSelected
        ) {

            this.onKeyframeSelected(
                keyframe
            );

        }

    }


    // =====================================================
    // Clear
    // =====================================================

    clear() {

        this.currentTime =
            0;

        this.selectedObject =
            null;

        this.setTime(
            0,
            false
        );

    }

}
