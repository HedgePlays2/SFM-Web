// animation/keyframes.js
// SFM-Web Keyframe System

export class KeyframeManager {

    constructor() {

        // Map of:
        // object UUID -> property -> keyframes[]
        this.tracks = new Map();

    }


    // =====================================================
    // Create/get object tracks
    // =====================================================

    getObjectTracks(object) {

        if (!object)
            return null;

        if (!this.tracks.has(object.uuid)) {

            this.tracks.set(
                object.uuid,
                new Map()
            );

        }

        return this.tracks.get(
            object.uuid
        );

    }


    // =====================================================
    // Create/get property track
    // =====================================================

    getTrack(
        object,
        property
    ) {

        const objectTracks =
            this.getObjectTracks(
                object
            );

        if (!objectTracks)
            return null;


        if (!objectTracks.has(property)) {

            objectTracks.set(
                property,
                []
            );

        }

        return objectTracks.get(
            property
        );

    }


    // =====================================================
    // Add keyframe
    // =====================================================

    addKeyframe(
        object,
        property,
        time,
        value
    ) {

        if (!object)
            return null;


        const track =
            this.getTrack(
                object,
                property
            );


        const keyframe = {

            time:
                Number(time) || 0,

            value:
                this.cloneValue(
                    value
                )

        };


        // Check if a keyframe already exists
        const existing =
            track.findIndex(
                key =>
                    Math.abs(
                        key.time -
                        keyframe.time
                    ) < 0.0001
            );


        if (existing !== -1) {

            track[existing] =
                keyframe;

        }
        else {

            track.push(
                keyframe
            );

        }


        // Keep chronological order
        track.sort(
            (a, b) =>
                a.time - b.time
        );


        return keyframe;

    }


    // =====================================================
    // Remove keyframe
    // =====================================================

    removeKeyframe(
        object,
        property,
        time
    ) {

        const track =
            this.getTrack(
                object,
                property
            );


        if (!track)
            return false;


        const index =
            track.findIndex(
                key =>
                    Math.abs(
                        key.time -
                        time
                    ) < 0.0001
            );


        if (index === -1)
            return false;


        track.splice(
            index,
            1
        );


        return true;

    }


    // =====================================================
    // Get keyframes
    // =====================================================

    getKeyframes(
        object,
        property
    ) {

        const track =
            this.getTrack(
                object,
                property
            );


        return track || [];

    }


    // =====================================================
    // Get all tracks for object
    // =====================================================

    getAllTracks(
        object
    ) {

        const tracks =
            this.getObjectTracks(
                object
            );


        if (!tracks)
            return [];

        return Array.from(
            tracks.entries()
        );

    }


    // =====================================================
    // Find surrounding keyframes
    // =====================================================

    getSurroundingKeyframes(
        object,
        property,
        time
    ) {

        const track =
            this.getTrack(
                object,
                property
            );


        if (
            !track ||
            track.length === 0
        ) {

            return {

                previous: null,
                next: null

            };

        }


        let previous =
            null;

        let next =
            null;


        for (
            const keyframe
            of track
        ) {

            if (
                keyframe.time <=
                time
            ) {

                previous =
                    keyframe;

            }


            if (
                keyframe.time >=
                time
            ) {

                next =
                    keyframe;

                break;

            }

        }


        return {

            previous,
            next

        };

    }


    // =====================================================
    // Get value at time
    // =====================================================

    getValueAtTime(
        object,
        property,
        time
    ) {

        const track =
            this.getTrack(
                object,
                property
            );


        if (
            !track ||
            track.length === 0
        ) {

            return null;

        }


        // Before first keyframe
        if (
            time <=
            track[0].time
        ) {

            return this.cloneValue(
                track[0].value
            );

        }


        // After last keyframe
        if (
            time >=
            track[
                track.length - 1
            ].time
        ) {

            return this.cloneValue(
                track[
                    track.length - 1
                ].value
            );

        }


        const surrounding =
            this.getSurroundingKeyframes(
                object,
                property,
                time
            );


        const previous =
            surrounding.previous;

        const next =
            surrounding.next;


        if (!previous)
            return this.cloneValue(
                next.value
            );


        if (!next)
            return this.cloneValue(
                previous.value
            );


        if (
            previous ===
            next
        ) {

            return this.cloneValue(
                previous.value
            );

        }


        const duration =
            next.time -
            previous.time;


        const amount =
            duration === 0
                ? 0
                : (
                    time -
                    previous.time
                ) / duration;


        return this.interpolate(
            previous.value,
            next.value,
            amount
        );

    }


    // =====================================================
    // Interpolation
    // =====================================================

    interpolate(
        a,
        b,
        amount
    ) {

        const t =
            Math.max(
                0,
                Math.min(
                    1,
                    amount
                )
            );


        // Numbers
        if (
            typeof a ===
                "number" &&
            typeof b ===
                "number"
        ) {

            return (
                a +
                (
                    b - a
                ) * t
            );

        }


        // Arrays
        if (
            Array.isArray(a) &&
            Array.isArray(b)
        ) {

            const result = [];


            const length =
                Math.min(
                    a.length,
                    b.length
                );


            for (
                let i = 0;
                i < length;
                i++
            ) {

                result[i] =
                    this.interpolate(
                        a[i],
                        b[i],
                        t
                    );

            }


            return result;

        }


        // Objects
        if (
            a &&
            b &&
            typeof a === "object" &&
            typeof b === "object"
        ) {

            const result = {};


            for (
                const key
                of Object.keys(a)
            ) {

                if (
                    key in b
                ) {

                    result[key] =
                        this.interpolate(
                            a[key],
                            b[key],
                            t
                        );

                }
                else {

                    result[key] =
                        this.cloneValue(
                            a[key]
                        );

                }

            }


            return result;

        }


        // Unsupported type
        return t < 0.5
            ? this.cloneValue(a)
            : this.cloneValue(b);

    }


    // =====================================================
    // Clone values
    // =====================================================

    cloneValue(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return value;

        }


        if (
            typeof value ===
            "number"
        ) {

            return value;

        }


        if (
            typeof value ===
            "string"
        ) {

            return value;

        }


        if (
            typeof value ===
            "boolean"
        ) {

            return value;

        }


        if (
            Array.isArray(value)
        ) {

            return value.map(
                item =>
                    this.cloneValue(
                        item
                    )
            );

        }


        if (
            typeof value ===
            "object"
        ) {

            const copy = {};


            for (
                const key
                of Object.keys(value)
            ) {

                copy[key] =
                    this.cloneValue(
                        value[key]
                    );

            }


            return copy;

        }


        return value;

    }


    // =====================================================
    // Remove all object keyframes
    // =====================================================

    removeObject(
        object
    ) {

        if (!object)
            return;


        this.tracks.delete(
            object.uuid
        );

    }


    // =====================================================
    // Clear everything
    // =====================================================

    clear() {

        this.tracks.clear();

    }


    // =====================================================
    // Serialize
    // =====================================================

    serialize() {

        const output = {};


        for (
            const [
                objectUUID,
                objectTracks
            ]
            of this.tracks
        ) {

            output[
                objectUUID
            ] = {};


            for (
                const [
                    property,
                    keyframes
                ]
                of objectTracks
            ) {

                output[
                    objectUUID
                ][property] =
                    keyframes.map(
                        keyframe => ({

                            time:
                                keyframe.time,

                            value:
                                this.cloneValue(
                                    keyframe.value
                                )

                        })
                    );

            }

        }


        return output;

    }


    // =====================================================
    // Deserialize
    // =====================================================

    deserialize(
        data
    ) {

        this.clear();


        if (
            !data ||
            typeof data !==
            "object"
        ) {

            return;

        }


        for (
            const objectUUID
            of Object.keys(data)
        ) {

            const propertyData =
                data[
                    objectUUID
                ];


            const objectTracks =
                new Map();


            for (
                const property
                of Object.keys(
                    propertyData
                )
            ) {

                const keyframes =
                    Array.isArray(
                        propertyData[
                            property
                        ]
                    )
                        ? propertyData[
                            property
                        ]
                        : [];


                objectTracks.set(
                    property,
                    keyframes.map(
                        keyframe => ({

                            time:
                                Number(
                                    keyframe.time
                                ) || 0,

                            value:
                                this.cloneValue(
                                    keyframe.value
                                )

                        })
                    )
                );

            }


            this.tracks.set(
                objectUUID,
                objectTracks
            );

        }

    }


    // =====================================================
    // Get all keyframe times
    // =====================================================

    getKeyframeTimes(
        object
    ) {

        const times =
            new Set();


        const tracks =
            this.getObjectTracks(
                object
            );


        if (!tracks)
            return [];


        for (
            const keyframes
            of tracks.values()
        ) {

            for (
                const keyframe
                of keyframes
            ) {

                times.add(
                    keyframe.time
                );

            }

        }


        return Array.from(
            times
        ).sort(
            (a, b) =>
                a - b
        );

    }

}
