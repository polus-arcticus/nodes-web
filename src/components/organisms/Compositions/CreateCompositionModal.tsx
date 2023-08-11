import { useState, useEffect, useMemo } from "react";

import { app, site } from "@src/constants/routes";

import Modal from "@src/components/molecules/Modal";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import PlaceholderInput from "@src/components/molecules/FormInputs/PlaceholderInput";
import DefaultSpinner from "@src/components/atoms/DefaultSpinner";


import { useNavigate } from "react-router-dom";

export const CreateCompositionModal = ({
    isOpen, onDismiss
}: {
    isOpen: boolean;
    onDismiss: () => void;
}) => {
    const navigate = useNavigate();
    const [compositionTitle, setCompositionTitle] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false);

    const onClose = () => {
    }

    const isValid = useMemo(() => {
        return !(compositionTitle)
    }, [compositionTitle])

    useEffect(() => {
        if (isOpen === true) {
            navigate(`${site.app}/compositions/start`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);
    return (
        <Modal
            isOpen={isOpen}
            onDismiss={onClose}
            $scrollOverlay={true}
            $maxWidth={700}
        >
            <Modal.Header onDismiss={onClose} />
            <div className="px-6 pt-5 pb-2 text-white">
                <div className="flex flex-row justify-between items-center">
                    <h1 className="text-lg font-bold">Name this composition</h1>
                </div>
                <p className="text-neutrals-gray-5 text-sm mb-6">
                    Enter the name of your composition.
                </p>

                <PlaceholderInput
                    placeholder={"Composition Name"}
                    value={compositionTitle}
                    onChange={(e: any) => {
                        setCompositionTitle(e.target.value);
                    }}
                />
            </div>
            <div className="flex flex-row justify-end items-center bg-neutrals-gray-1 border-t border-t-tint-primary rounded-b-md px-4 py-3">
                <PrimaryButton
                    disabled={isValid || isLoading}
                    onClick={() => {
                        if (editingNodeParams) return handleEdit();
                        /**
                         * Handle create new node
                         */
                        setTimeout(async () => {
                            setIsLoading(true);
                            try {
                                const payload = {
                                    title: manifestTitle || "",
                                    defaultLicense: manifestLicense?.name,
                                    researchFields,
                                    links: {
                                        pdf: [],
                                        metadata: [],
                                    },
                                };
                                const ros = await createResearchObjectStub(payload);

                                dispatch(setCurrentObjectId(""));
                                const ro = (ros as any).node.uuid;

                                dispatch(setCurrentObjectId(ro));
                                dispatch(
                                    setManifest({
                                        version: 1,
                                        title: manifestTitle || "",
                                        defaultLicense: manifestLicense?.name,
                                        components: [],
                                        authors: [],
                                        researchFields,
                                    })
                                );

                                dispatch(setComponentStack([]));
                                setIsAddingComponent(true);
                                setIsLoading(false);

                                onClose();
                                setIsLoading(false);

                                // refresh node collection
                                dispatch(nodesApi.util.invalidateTags([{ type: tags.nodes }]));
                                navigate(
                                    `${site.app}${app.nodes}/${RESEARCH_OBJECT_NODES_PREFIX}${ro}`
                                );

                                return;
                            } catch (e) {
                                console.log("Error", e);
                                postUserAction(AvailableUserActionLogTypes.errNodeCreate);
                            } finally {
                                setIsLoading(false);
                            }
                        });
                        dispatch(setCurrentObjectId(""));
                        dispatch(setPublicView(false));
                        postUserAction(AvailableUserActionLogTypes.btnCreateNodeModalSave);
                    }}
                    className="h-10 text-lg flex gap-2"
                >
                    {isLoading ? "Saving" : "Save"}
                    {isLoading && <DefaultSpinner color="white" size={24} />}
                </PrimaryButton>
            </div>
        </Modal>)
}