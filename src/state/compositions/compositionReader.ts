import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"

import {
    CompositionAnnotation,
    CompositionObjectComponentAnnotation,
    CompositionObjectComponentType,
    CompositionObjectV1,
    CompositionObjectV1Author,
    CompositionObjectV1Component,
} from "@desci-labs/desci-models";
import { ManifestDataStatus } from "../nodes/nodeReader";

export interface CompositionReaderPref {
    currentCompositionId: string;
    manifestCid: string;
    manifest?: CompositionObjectV1;
    manifestStatus: ManifestDataStatus;
    annotations: CompositionObjectComponentAnnotation[];
    annotationsByPage: Record<number, CompositionObjectComponentAnnotation[]>;
}
const initialState: CompositionReaderPref = {
    currentCompositionId: "",
    manifestCid: "",
    manifestStatus: ManifestDataStatus.Idle,
    annotations: [],
    annotationsByPage: {},
}
export const compositionReaderSlice = createSlice({
    initialState,
    name: 'compositionViewer',
    reducers: {
        replaceAnnotations: (
            state,
            { payload }: PayloadAction<CompositionObjectComponentAnnotation[]>
        ) => {
            if (payload) {
                const annotations = [...payload];
                state.annotations = annotations;
                state.annotationsByPage = annotations.reduce((acc, annotation) => {
                    const pageIndex = annotation.pageIndex;
                    if (pageIndex !== undefined) {
                        if (!acc[pageIndex]) {
                            acc[pageIndex] = [];
                        }
                        acc[pageIndex].push(annotation);
                    }
                    return acc;
                }, {} as Record<number, CompositionObjectComponentAnnotation[]>);
            }
        },
        setCurrentCompositionId: (state, { payload }: PayloadAction<string>) => {
            state.currentCompositionId = payload
        },
        setCompositionManifest: (state, { payload }: PayloadAction<CompositionObjectV1>) => {
            state.manifestStatus = ManifestDataStatus.Idle;
            state.manifest = payload;
            const defaultComponent = payload.researchObjectCids[0]
            if (
                defaultComponent
            ) {
                compositionReaderSlice.caseReducers.replaceAnnotations(state, {
                    payload: defaultComponent.payload.annotations || [],
                    type: "replaceAnnotations",
                });
            }
        },
        setCompositionManifestData: (state, { payload }: PayloadAction<{ manifest: CompositionObjectV1, cid: string }>) => {
            state.manifest = payload.manifest
            state.manifestCid = payload.cid
            state.manifestStatus = ManifestDataStatus.Idle
            const defaultComponent = payload.manifest.researchObjectCids[0]
            if (
                defaultComponent
            ) {
                compositionReaderSlice.caseReducers.replaceAnnotations(state, {
                    payload: defaultComponent.payload.annotations || [],
                    type: "replaceAnnotations",
                });
            }
        },
    }
})

export default compositionReaderSlice.reducer

export const {
    setCurrentCompositionId,
    setCompositionManifest,
} = compositionReaderSlice.actions