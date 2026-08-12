// animation/bones.js
// SFM-Web Bone / Rig System

export class BoneManager {

    constructor() {

        // Object UUID -> rig information
        this.rigs = new Map();

        // Currently selected bone
        this.selectedBone = null;

        // Callback when a bone is selected
        this.onBoneSelected = null;

    }


    // =====================================================
    // Register a model
    // =====================================================

    registerModel(
        model
    ) {

        if (!model)
            return null;


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


        const rig = {

            model,
            bones

        };


        this.rigs.set(
            model.uuid,
            rig
        );


        return rig;

    }


    // =====================================================
    // Remove model
    // =====================================================

    removeModel(
        model
    ) {

        if (!model)
            return;


        this.rigs.delete(
            model.uuid
        );


        if (
            this.selectedBone &&
            this.selectedBone.object
        ) {

            if (
                this.selectedBone.object ===
                model ||
                this.selectedBone.object
                    .parent === model
            ) {

                this.clearSelection();

            }

        }

    }


    // =====================================================
    // Get rig
    // =====================================================

    getRig(
        model
    ) {

        if (!model)
            return null;


        return this.rigs.get(
            model.uuid
        ) || null;

    }


    // =====================================================
    // Get bones
    // =====================================================

    getBones(
        model
    ) {

        const rig =
            this.getRig(
                model
            );


        if (!rig)
            return [];


        return rig.bones;

    }


    // =====================================================
    // Find bone
    // =====================================================

    findBone(
        model,
        name
    ) {

        const bones =
            this.getBones(
                model
            );


        return bones.find(
            bone =>
                bone.name === name
        ) || null;

    }


    // =====================================================
    // Select bone
    // =====================================================

    selectBone(
        bone
    ) {

        if (!bone) {

            this.clearSelection();

            return;

        }


        this.selectedBone = {

            object:
                bone,

            position:
                bone.position.clone(),

            rotation:
                bone.rotation.clone(),

            scale:
                bone.scale.clone()

        };


        if (
            this.onBoneSelected
        ) {

            this.onBoneSelected(
                bone
            );

        }

    }


    // =====================================================
    // Clear bone selection
    // =====================================================

    clearSelection() {

        this.selectedBone =
            null;


        if (
            this.onBoneSelected
        ) {

            this.onBoneSelected(
                null
            );

        }

    }


    // =====================================================
    // Get selected bone
    // =====================================================

    getSelectedBone() {

        return this.selectedBone
            ? this.selectedBone.object
            : null;

    }


    // =====================================================
    // Bone selection callback
    // =====================================================

    onSelectionChanged(
        callback
    ) {

        this.onBoneSelected =
            typeof callback ===
            "function"
                ? callback
                : null;

    }


    // =====================================================
    // Set bone position
    // =====================================================

    setPosition(
        bone,
        x,
        y,
        z
    ) {

        if (!bone)
            return;


        bone.position.set(
            Number(x) || 0,
            Number(y) || 0,
            Number(z) || 0
        );

    }


    // =====================================================
    // Set bone rotation
    // =====================================================

    setRotation(
        bone,
        x,
        y,
        z
    ) {

        if (!bone)
            return;


        bone.rotation.set(
            Number(x) || 0,
            Number(y) || 0,
            Number(z) || 0
        );

    }


    // =====================================================
    // Set bone scale
    // =====================================================

    setScale(
        bone,
        x,
        y,
        z
    ) {

        if (!bone)
            return;


        bone.scale.set(
            Number(x) || 1,
            Number(y) || 1,
            Number(z) || 1
        );

    }


    // =====================================================
    // Reset bone
    // =====================================================

    resetBone(
        bone
    ) {

        if (!bone)
            return;


        bone.position.set(
            0,
            0,
            0
        );


        bone.rotation.set(
            0,
            0,
            0
        );


        bone.scale.set(
            1,
            1,
            1
        );

    }


    // =====================================================
    // Reset entire rig
    // =====================================================

    resetRig(
        model
    ) {

        const bones =
            this.getBones(
                model
            );


        for (
            const bone
            of bones
        ) {

            this.resetBone(
                bone
            );

        }

    }


    // =====================================================
    // Get bone hierarchy
    // =====================================================

    getHierarchy(
        model
    ) {

        const bones =
            this.getBones(
                model
            );


        return bones.map(
            bone => ({

                name:
                    bone.name,

                uuid:
                    bone.uuid,

                parent:
                    bone.parent?.name ||
                    null,

                children:
                    bone.children
                        .filter(
                            child =>
                                child.isBone
                        )
                        .map(
                            child =>
                                child.name
                        )

            })
        );

    }


    // =====================================================
    // Find bone recursively
    // =====================================================

    findBoneRecursive(
        object,
        name
    ) {

        if (!object)
            return null;


        if (
            object.isBone &&
            object.name === name
        ) {

            return object;

        }


        for (
            const child
            of object.children
        ) {

            const result =
                this.findBoneRecursive(
                    child,
                    name
                );


            if (result) {

                return result;

            }

        }


        return null;

    }


    // =====================================================
    // Get bone transform
    // =====================================================

    getTransform(
        bone
    ) {

        if (!bone)
            return null;


        return {

            position:
                bone.position.toArray(),

            rotation: [

                bone.rotation.x,
                bone.rotation.y,
                bone.rotation.z

            ],

            scale:
                bone.scale.toArray()

        };

    }


    // =====================================================
    // Apply transform
    // =====================================================

    applyTransform(
        bone,
        transform
    ) {

        if (
            !bone ||
            !transform
        ) {

            return;

        }


        if (
            Array.isArray(
                transform.position
            )
        ) {

            bone.position.fromArray(
                transform.position
            );

        }


        if (
            Array.isArray(
                transform.rotation
            )
        ) {

            bone.rotation.set(
                transform.rotation[0] || 0,
                transform.rotation[1] || 0,
                transform.rotation[2] || 0
            );

        }


        if (
            Array.isArray(
                transform.scale
            )
        ) {

            bone.scale.fromArray(
                transform.scale
            );

        }

    }


    // =====================================================
    // Serialize rig
    // =====================================================

    serializeModel(
        model
    ) {

        const bones =
            this.getBones(
                model
            );


        return {

            model:
                model.uuid,

            bones:
                bones.map(
                    bone => ({

                        uuid:
                            bone.uuid,

                        name:
                            bone.name,

                        transform:
                            this.getTransform(
                                bone
                            )

                    })
                )

        };

    }


    // =====================================================
    // Clear all rigs
    // =====================================================

    clear() {

        this.rigs.clear();

        this.clearSelection();

    }


    // =====================================================
    // Get all rigs
    // =====================================================

    getAllRigs() {

        return Array.from(
            this.rigs.values()
        );

    }

}
