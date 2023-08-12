import { ResearchObjectV1History } from "@src/../../nodes/desci-models/dist";

export interface IndexedCompositionVersion {
  cid?: string;
  id?: string;
  time?: string;
}
export interface IndexedComposition {
  id?: string;
  id10?: string;
  owner?: string;
  recentCid?: string;
  versions: IndexedCompositionVersion[];
}

export type PublishedMap = { [uuid: string]: IndexedComposition };

export type HistoryMap = Record<string, ResearchObjectV1History[]>;

export interface HistoryEntryProps {
  index: number;
  pending: boolean;
  data: ResearchObjectV1History;
  selected: boolean;
}
