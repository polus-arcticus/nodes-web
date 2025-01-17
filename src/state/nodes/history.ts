import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ResearchObjectV1History } from "@desci-labs/desci-models";
import { HistoryEntryProps, HistoryMap, PublishedMap } from "./types";

interface HistoryState {
  publishMap: PublishedMap;
  histories: HistoryMap;
  pendingCommits: HistoryMap;
  selectedHistoryId: string;
  selectedHistory: HistoryEntryProps | null;
}

const initialState: HistoryState = {
  publishMap: {},
  histories: {},
  pendingCommits: {},
  selectedHistoryId: "",
  selectedHistory: null,
};

export const historySlice = createSlice({
  initialState,
  name: "nodeHistory",
  reducers: {
    resetHistory: () => initialState,
    setPublishedNodes: (state, { payload }: PayloadAction<PublishedMap>) => {
      state.publishMap = { ...state.publishMap, ...payload };
    },
    selectHistory: (
      state,
      { payload }: PayloadAction<{ id: string; history: HistoryEntryProps }>
    ) => {
      state.selectedHistory = payload.history;
    },
    setNodeHistory: (
      state,
      {
        payload,
      }: PayloadAction<{ id: string; history: ResearchObjectV1History[] }>
    ) => {
      state.histories[payload.id] = payload.history;
    },
    setPendingCommits: (
      state,
      {
        payload,
      }: PayloadAction<{ id: string; commits: ResearchObjectV1History[] }>
    ) => {
      if (state.pendingCommits[payload.id]) {
        state.pendingCommits[payload.id] = [];
      }

      state.pendingCommits[payload.id] = payload.commits;
    },
  },
});

export const historyReducer = historySlice.reducer;

export const {
  setPublishedNodes,
  setNodeHistory,
  resetHistory,
  setPendingCommits,
  selectHistory,
} = historySlice.actions;
