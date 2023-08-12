import { useState, useEffect, useMemo } from "react";

import { app, site } from "@src/constants/routes";
import { tags } from "@src/state/api/tags";

import { useSetter } from "@src/store/accessors";
import Modal from "@src/components/molecules/Modal";
import PrimaryButton from "@src/components/atoms/PrimaryButton";
import PlaceholderInput from "@src/components/molecules/FormInputs/PlaceholderInput";
import DefaultSpinner from "@src/components/atoms/DefaultSpinner";
import { 
    AvailableUserActionLogTypes,
    createCompositionObjectStub,
    getCompositionObjectStub,
    postUserAction
 } from "@src/api";
import { compositionsApi } from "@src/state/api/compositions";
import { 
    setCurrentCompositionId,
    setCompositionManifest
} from '@src/state/compositions/compositionReader';
import { useNavigate } from "react-router-dom";
import { a } from "react-spring";

export const CreateCompositionModal = ({
    isOpen, onDismiss
}: {
    isOpen: boolean;
    onDismiss: () => void;
}) => {

    const dispatch = useSetter();
    const navigate = useNavigate();
    const [compositionTitle, setCompositionTitle] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false);

    const onClose = () => {
        onDismiss?.()
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
                        /**
                         * Handle create new collection
                         */
                        setTimeout(async () => {
                            setIsLoading(true);
                            try {
                                const payload = {
                                    title: compositionTitle || "",
                                };
                                const ros = await createCompositionObjectStub(payload);

                                dispatch(setCurrentCompositionId(""));
                                const ro = (ros as any).node.uuid;

                                dispatch(setCurrentCompositionId(ro));
                                dispatch(
                                    setCompositionManifest({
                                        version: 1,
                                        title: compositionTitle
                                    })
                                );

                                //dispatch(setComponentStack([]));
                                //setIsAddingComponent(true);
                                setIsLoading(false);

                                onClose();
                                setIsLoading(false);

                                // refresh node collection
                                dispatch(compositionsApi.util.invalidateTags([{ type: tags.composition }]));
                                navigate(
                                    `${site.app}${app.compositions}/${ro}`
                                );

                                return;
                            } catch (e) {
                                console.log("Error", e);
                                postUserAction(AvailableUserActionLogTypes.errNodeCreate);
                            } finally {
                                setIsLoading(false);
                            }
                        });
                        dispatch(setCurrentCompositionId(""));
                        //dispatch(setPublicView(false));
                        postUserAction(AvailableUserActionLogTypes.btnCreateCompositionSave);
                    }}
                    className="h-10 text-lg flex gap-2"
                >
                    {isLoading ? "Saving" : "Save"}
                    {isLoading && <DefaultSpinner color="white" size={24} />}
                </PrimaryButton>
            </div>
        </Modal>)
}