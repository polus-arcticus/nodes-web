import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { DriveObject, FileType } from "../types";
import { Actions } from "./types";
import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import { isRootComponentDrive } from "@src/components/driveUtils";
import { deleteDatasetComponent } from "@src/api";
import { useDriveUpdater } from "../../PaneDrive";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useDispatch } from "react-redux";
import { setComponentStack, setManifestData } from "@src/state/nodes/viewer";

const IPFS_URL = process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE;

export const getActionState = (action: Actions, file: DriveObject) => {
  switch (action) {
    case Actions.PREVIEW:
      return {
        disabled: file.type !== FileType.File,
      };
    case Actions.RENAME:
      return {
        disabled:
          !(
            isRootComponentDrive(file)
            // file.componentType === ResearchObjectComponentType.DATA
          ),
      };
    case Actions.REMOVE:
      return {
        disabled: !(
          isRootComponentDrive(file) &&
          file.componentType === ResearchObjectComponentType.DATA
        ),
      };
    default:
      return { disabled: true };
  }
};

export default function useActionHandler() {
  const dispatch = useDispatch();
  const { manifest: manifestData, currentObjectId } = useNodeReader();
  const { setDirectory, setRenameComponentId } = useDriveUpdater();

  async function preview(file: DriveObject) {
    if (
      [
        ResearchObjectComponentType.PDF,
        ResearchObjectComponentType.CODE,
      ].includes(file.componentType as ResearchObjectComponentType)
    ) {
      const component = manifestData?.components.find(
        (c) => c.payload.url === file.cid
      );
      if (component) {
        dispatch(setComponentStack([component]));
      }
    } else {
      window.open(`${IPFS_URL}/${file.cid}`, "_blank");
    }
  }

  async function remove(file: DriveObject) {
    try {
      //optimistically remove
      setDirectory((prev) => {
        const driveIdx = prev.findIndex((drv) => drv.path === file.path);
        const newDir = [...prev];
        newDir.splice(driveIdx, 1);
        prev.splice(driveIdx, 1);
        return newDir;
      });
      const { manifestCid, manifest } = await deleteDatasetComponent(
        currentObjectId!,
        manifestData!,
        file.cid
      );
      if (manifestCid && manifest) {
        // setManifestData(manifest);
        // setManifestCid(manifestCid);
        dispatch(setManifestData({ cid: manifestCid, manifest }));
      }
    } catch (e) {
      //re-add on failure
      setDirectory((prev) => {
        const newDir = [...prev, file];
        return newDir;
      });
    }
  }

  async function rename(file: DriveObject) {
    //TODO: in the future a similar action as below may be required for code components, or any component where cid !== id
    if (
      file.componentType === ResearchObjectComponentType.DATA &&
      manifestData
    ) {
      const comp = manifestData.components.find(
        (c) => c.payload.cid === file.cid
      );
      if (comp) setRenameComponentId(comp.id);
      return;
    }
    setRenameComponentId(file.cid);
  }

  const handler: Record<
    Actions,
    ((file: DriveObject) => Promise<void>) | null
  > = {
    RENAME: rename,
    PREVIEW: preview,
    DOWNLOAD: null,
    REMOVE: remove,
  };

  return handler;
}

export function useInteractionHandler() {
  const handler = useActionHandler();

  function handleDbClick(e: React.MouseEvent, file: DriveObject) {
    e.preventDefault();
    const { disabled } = getActionState(Actions.PREVIEW, file);
    if (!disabled) {
      handler["PREVIEW"]?.(file);
    }
  }

  return { handleDbClick };
}
