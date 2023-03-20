import { LS_PENDING_COMMITS_KEY } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { useCallback, useEffect, useRef, useState } from "react";
import "./history.scss";
import { ResearchObjectV1History } from "@desci-labs/desci-models";
import { CHAIN_DEPLOYMENT } from "@components/../chains";
import { ethers } from "ethers";
import { getResearchObjectVersions } from "@src/api";
import { VersionResponse } from "@src/state/api/types";
import { useNodeReader, useNodeVersionHistory } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { setNodeHistory, setPendingCommits } from "@src/state/nodes/history";
import { api } from "@src/state/api";
import { tags } from "@src/state/api/tags";

const LS_HISTORY_MAP = "DESCI::node-version-history";

export default function useNodeHistory() {
  const dispatch = useSetter();
  // const { pendingCommits } = useManuscriptController(["pendingCommits"]);
  const { currentObjectId } = useNodeReader();
  // const [historys, setHistory] = useLocalStorageState<
  //   Record<string, ResearchObjectV1History[]>
  // >(LS_HISTORY_MAP, {});
  // const history = useMemo(
  //   () => historys[currentObjectId ?? ""] ?? [],
  //   [historys, currentObjectId]
  // );
  const { history, pendingCommits, pendingHistory } =
    useNodeVersionHistory(currentObjectId);

  const loadRef = useRef(false);
  const [loadingChain, setLoadingChain] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  // const [pendingHistory, setPendingHistory] = useState<
  //   ResearchObjectV1History[]
  // >(() => {
  //   return pendingCommits[currentObjectId ?? ""]
  //     ? pendingCommits[currentObjectId ?? ""]
  //     : [];
  // });

  const transformVersions = (vr: VersionResponse): ResearchObjectV1History[] =>
    vr.versions.map((v) => ({
      author: { id: vr.owner, name: "" },
      content: "",
      title: "Published",
      date: parseInt(v.time) * 1000,
      transaction: { id: v.id },
    }));

  const updatePendingCommits = useCallback(
    (update: ResearchObjectV1History[]) => {
      dispatch(setPendingCommits({ id: currentObjectId!, commits: update }));
      // localStorage.setItem(LS_PENDING_COMMITS_KEY, JSON.stringify(pending));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pendingCommits]
  );

  useEffect(() => {
    if (pendingHistory.length > 0) {
      const hashes = history.map((h) => h.transaction?.id);
      const update = pendingHistory.filter(
        (p) => !hashes.includes(p.transaction?.id)
      );
      updatePendingCommits(update);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, pendingHistory]);

  useEffect(() => {
    if (loadRef.current === false) {
      setLoadingChain(true);
    }

    if (currentObjectId) {
      const refresh = () => {
        setIsFetching(true);

        (async () => {
          try {
            const versions = await getResearchObjectVersions(currentObjectId);
            const currentHistory = transformVersions(versions);
            dispatch(
              setNodeHistory({ id: currentObjectId, history: currentHistory })
            );
          } catch (e) {
            console.log("ERROR", e);
          } finally {
            setIsFetching(false);
            setLoadingChain(false);
          }
        })();
      };

      refresh();

      const readOnlyProvider = new ethers.providers.JsonRpcProvider(
        process.env.REACT_APP_DEFAULT_RPC_URL
      );
      readOnlyProvider.pollingInterval = 5000;
      const contractAddress = CHAIN_DEPLOYMENT.address;

      let contract = new ethers.Contract(contractAddress, CHAIN_DEPLOYMENT.abi);
      contract = contract.connect(readOnlyProvider);
      // const eventFilter = contract.filters.VersionPush();
      contract.on("VersionPush", (event) => {
        const update = pendingHistory.filter(
          (commit) => commit.transaction?.id !== event.transactionHash
        );
        updatePendingCommits(update);
        refresh();
        // wait for graph node index
        setTimeout(refresh, 5000);
        setTimeout(refresh, 10000);
        api.util.invalidateTags([{ type: tags.nodes }]);
      });

      loadRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentObjectId]);

  return { loadingChain, history, pendingHistory, isFetching };
}
