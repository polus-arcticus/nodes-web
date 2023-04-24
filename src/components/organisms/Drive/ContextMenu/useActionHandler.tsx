import { DriveObject, FileType } from "../types";
import { Actions } from "./types";
import {
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useDispatch } from "react-redux";
import { setComponentStack, setManifestData } from "@src/state/nodes/viewer";
import { useSetter } from "@src/store/accessors";
import axios from "axios";
import { setFileMetadataBeingEdited } from "@src/state/drive/driveSlice";
import { AvailableUserActionLogTypes, postUserAction } from "@api/index";
import { setComponentTypeBeingAssignedTo } from "@src/state/drive/driveSlice";
import { separateFileNameAndMimeType } from "@src/state/drive/utils";

const IPFS_URL = process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE;

export const getActionState = (action: Actions, file: DriveObject) => {
  switch (action) {
    case Actions.PREVIEW:
      return {
        disabled: file.type !== FileType.FILE,
      };
    case Actions.RENAME:
      return {
        disabled: true,
      };
    case Actions.DOWNLOAD:
      return {
        disabled:
          file.componentType === ResearchObjectComponentType.LINK ||
          file.type === FileType.DIR,
      };
    case Actions.REMOVE:
      return {
        disabled: true,
      };
    case Actions.ASSIGN_TYPE:
      return { disabled: false };
    case Actions.EDIT_METADATA:
      return {
        disabled: !(
          file.componentType === ResearchObjectComponentType.DATA ||
          file.componentType === ResearchObjectComponentType.PDF ||
          file.componentType === ResearchObjectComponentType.CODE
        ),
      };
    default:
      return { disabled: true };
  }
};

export default function useActionHandler() {
  const dispatch = useDispatch();
  const { manifest: manifestData, currentObjectId } = useNodeReader();

  async function preview(file: DriveObject) {
    if (
      [
        ResearchObjectComponentType.PDF,
        ResearchObjectComponentType.CODE,
        ResearchObjectComponentType.LINK,
      ].includes(file.componentType as ResearchObjectComponentType)
    ) {
      const component = manifestData?.components.find(
        (c: ResearchObjectV1Component) => c.payload.url === file.cid
      );
      if (component) {
        dispatch(setComponentStack([component]));
      }
    } else {
      window.open(`${IPFS_URL}/${file.cid}`, "_blank");
    }
  }

  async function remove(file: DriveObject) {
    //optimistically remove
    //   setDirectory((prev) => {
    //     const driveIdx = prev.findIndex((drv) => drv.path === file.path);
    //     const newDir = [...prev];
    //     newDir.splice(driveIdx, 1);
    //     prev.splice(driveIdx, 1);
    //     return newDir;
    //   });
    //   const { manifestCid, manifest } = await deleteDatasetComponent(
    //     currentObjectId!,
    //     manifestData!,
    //     file.cid
    //   );
    //   if (manifestCid && manifest) {
    //     // setManifestData(manifest);
    //     // setManifestCid(manifestCid);
    //     dispatch(setManifestData({ cid: manifestCid, manifest }));
    //   }
    // } catch (e) {
    //   //re-add on failure
    //   setDirectory((prev) => {
    //     const newDir = [...prev, file];
    //     return newDir;
    //   });
    // }
  }

  async function rename(file: DriveObject) {
    //TODO: in the future a similar action as below may be required for code components, or any component where cid !== id
    // if (
    //   file.componentType === ResearchObjectComponentType.DATA &&
    //   manifestData
    // ) {
    //   const comp = manifestData.components.find(
    //     (c: ResearchObjectV1Component) => c.payload.cid === file.cid
    //   );
    //   if (comp) setRenameComponentId(comp.id);
    //   return;
    // }
    // setRenameComponentId(file.cid);
  }

  async function download(file: DriveObject) {
    if (file.componentType === ResearchObjectComponentType.LINK) return;
    postUserAction(
      AvailableUserActionLogTypes.btnDownloadData,
      JSON.stringify({ nodeUuid: currentObjectId, cid: file.cid })
    );
    const url = `${IPFS_URL}/${file.cid}`;
    const { fileName, mimeType } = separateFileNameAndMimeType(file.name);
    axios({
      url,
      method: "GET",
      responseType: "blob", // important
    }).then((response: any) => {
      const url2 = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url2;
      link.setAttribute(
        "download",
        `${fileName.replaceAll(" ", "_")}__nodes.desci.com__${
          url.split("/")[url.split("/").length - 1]
        }${mimeType ? `.${mimeType}` : ""}`
      );
      document.body.appendChild(link);
      link.click();
    });
  }

  async function assignType(file: DriveObject) {
    dispatch(setComponentTypeBeingAssignedTo(file.path!));
  }

  async function editMetadata(file: DriveObject) {
    dispatch(setFileMetadataBeingEdited(file));
  }

  const handler: Record<
    Actions,
    ((file: DriveObject) => Promise<void>) | null
  > = {
    RENAME: rename,
    PREVIEW: preview,
    DOWNLOAD: download,
    REMOVE: remove,
    ASSIGN_TYPE: assignType,
    EDIT_METADATA: editMetadata,
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
