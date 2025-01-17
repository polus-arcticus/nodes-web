/* eslint-disable no-loop-func */
import axios, { AxiosRequestConfig } from "axios";
import {
  ResearchObjectComponentSubtypes,
  ResearchObjectComponentType,
  ResearchObjectPreviewResult,
  ResearchObjectV1,
} from "@desci-labs/desci-models";
import type { Profile } from "@components/organisms/UserProfileForm";
import {
  DataReference,
  Node,
  NodeVersion,
  PublicDataReference,
  PublicDataReferenceOnIpfsMirror,
} from "@src/types/client";
export const SCIWEAVE_URL =
  process.env.REACT_APP_NODES_API || "http://localhost:5420";

if (SCIWEAVE_URL.indexOf("/v1") > -1) {
  alert(
    "process.env.REACT_APP_NODES_API should not include /v1. To fix edit desci-dapp/.env"
  );
}

export type ResearchObjectStub = {
  title: string;
  pdf?: string[];
  code?: string[];
  metadata?: string[];
  links?: any;
};

export const config = (): AxiosRequestConfig => {
  return {
    withCredentials: true,
    headers: {
      authorization: `Bearer ${localStorage.getItem("auth")}`,
    },
  };
};

export const magicLinkRedeem = async (email: string, code: string) => {
  const { data } = await axios.post(`${SCIWEAVE_URL}/v1/auth/magic`, {
    email,
    code,
  });
  return data;
};

export const magicLinkSend = async (email: string) => {
  const { data } = await axios.post(`${SCIWEAVE_URL}/v1/auth/magic`, { email });
  return data;
};

export const waitlistAdd = async (email: string) => {
  const { data } = await axios.post(`${SCIWEAVE_URL}/v1/waitlist`, { email });
  return data;
};

export const termsConsent = async (obj: any, uuid: string) => {
  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/nodes/consent`,
    {
      ...obj,
      uuid,
    },
    config()
  );
  return data;
};

export const getNodeVersionDetails = async (hash: string) => {
  const { data } = await axios.get<
    any,
    {
      data: {
        ok: boolean;
        node: Node;
        nodeVersion: NodeVersion;
        dataReferences: DataReference[];
        publicDataReferences: (PublicDataReference & {
          mirrors: PublicDataReferenceOnIpfsMirror[];
        })[];
      };
    }
  >(`${SCIWEAVE_URL}/v1/nodes/versionDetails?transactionId=${hash}`, config());
  return data;
};

export const createResearchObjectStub = async (obj: ResearchObjectStub) => {
  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/nodes/createDraft`,
    obj,
    config()
  );
  return data;
};

interface UpdateDraftProps {
  manifest: ResearchObjectV1;
  uuid: string;
}
export const updateDraft = async (obj: UpdateDraftProps) => {
  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/nodes/updateDraft`,
    obj,
    config()
  );
  return data;
};

interface AddComponentToDraftProps {
  manifest: ResearchObjectV1;
  uuid: string;
  componentUrl: string;
  title: string;
  componentType: ResearchObjectComponentType;
  componentSubtype?: ResearchObjectComponentSubtypes;
}

export const getRecentPublishedManifest = async (
  uuid: string
): Promise<ResearchObjectV1> => {
  const { data } = await axios.get(
    `${SCIWEAVE_URL}/${uuid}${
      process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE
        ? `?g=${process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE}`
        : ""
    }`,
    config()
  );
  return data;
};

export const getPublishedVersions = async (uuid: string) => {
  const { data } = await axios.get(
    `${SCIWEAVE_URL}/v1/pub/versions/${uuid}`,
    config()
  );
  return data;
};

export const resolvePublishedManifest = async (
  uuid: string,
  version: string | number | undefined
): Promise<ResearchObjectV1> => {
  const { data } = await axios.get(
    `${SCIWEAVE_URL}/${uuid}${version !== undefined ? `/${version}` : ""}${
      process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE
        ? `?g=${process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE}`
        : ""
    }`
    // config()
  );
  return data;
};

export const addComponentToDraft = async (obj: AddComponentToDraftProps) => {
  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/nodes/addComponentToDraft`,
    obj,
    config()
  );
  return data;
};

export const getWaitlist = async () => {
  const { data } = await axios.get(`${SCIWEAVE_URL}/v1/waitlist`, config());
  return data;
};

export const getUsers = async () => {
  const { data } = await axios.get(`${SCIWEAVE_URL}/v1/users`, config());
  return data;
};

export const __adminWaitlistPromote = async (id: string) => {
  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/waitlist/promote/${id}`,
    {},
    config()
  );
  return data;
};

export const getResearchObjectStub = async (id: string) => {
  const { data } = await axios.get(
    `${SCIWEAVE_URL}/v1/nodes/${id}${
      process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE
        ? `?g=${process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE}`
        : ""
    }`,
    config()
  );
  return data;
};

export const getResearchObjectVersions = async (uuid: string) => {
  const { data } = await axios.get(
    `${SCIWEAVE_URL}/v1/pub/versions/${uuid}`,
    config()
  );
  return data;
};

export const getArcs = async () => {
  const { data } = await axios.get(`${SCIWEAVE_URL}/v1/arcs`);
  return data;
};

export const getArc = async (id: string) => {
  const { data } = await axios.get(`${SCIWEAVE_URL}/v1/arcs/${id}`);
  return data;
};

export const getNodesForUser = async () => {
  const { data } = await axios.get(`${SCIWEAVE_URL}/v1/nodes`, config());
  return data.nodes;
};

export const retrieveDoi = async (
  doi: string
): Promise<ResearchObjectPreviewResult> => {
  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/nodes/doi`,
    { doi },
    config()
  );
  return data;
};

export const getUserData = async () => {
  const { data } = await axios.get(`${SCIWEAVE_URL}/v1/auth/profile`, config());
  return data;
};

export const getResearchFields = async (search: string = "") => {
  const { data } = await axios.get(
    `${SCIWEAVE_URL}/v1/researchFields?q=${search}`,
    config()
  );
  return data;
};

export const getAccountNonce = async () => {
  const { data } = await axios.get(`${SCIWEAVE_URL}/v1/nonce`, config());
  return data;
};

export const associateWallet = async (
  address: string,
  message: string,
  signature: string
) => {
  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/users/associate`,
    { walletAddress: address, message, signature },
    config()
  );
  return data;
};

export const updateProfile = async (profile: Profile) => {
  const { data } = await axios.patch(
    `${SCIWEAVE_URL}/v1/users/updateProfile`,
    { profile: profile },
    config()
  );
  return data;
};

export const logout = async () => {
  // await axios.delete(`${SCIWEAVE_URL}/v1/auth/logout`, config());
  localStorage.removeItem("auth");
  return {};
};

export const addDatasetComponent = async (
  uuid: string,
  files: FileList | FileSystemEntry[],
  dataFields: { title: string; description?: string },
  manifest: ResearchObjectV1,
  onProgress?: (e: ProgressEvent) => void
) => {
  const formData = new FormData();
  formData.append("uuid", uuid);
  formData.append("dataFields", JSON.stringify(dataFields));
  formData.append("manifest", JSON.stringify(manifest));
  if (files.length) {
    if (files instanceof FileList) {
      // files.forEach((f) => formData.append("files", f));
      Array.prototype.forEach.call(files, (f) => {
        formData.append("files", f);
      });
    } else {
      const entryList = files as FileSystemEntry[];
      for (let i = 0; i < entryList.length; i++) {
        const f = entryList[i];
        const p = new Promise<File>((res, rej) => {
          (f as FileSystemFileEntry).file((v) => res(v), rej);
        });
        const tempFile = await p;
        const fileName = entryList[i].fullPath;

        formData.append("files", new File([tempFile], fileName));
      }
    }
  }

  const adjustedConfig: any = config();
  adjustedConfig.headers["content-type"] = "multipart/form-data";
  if (onProgress) {
    adjustedConfig.onUploadProgress = (e: ProgressEvent) => onProgress(e);
  }

  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/datasets/upload`,
    formData,
    adjustedConfig
  );
  return data;
};

export const publishResearchObject = async (input: {
  uuid: string;
  cid: string;
  manifest: ResearchObjectV1;
  transactionId: string;
}) => {
  const options: AxiosRequestConfig = config();
  options.headers["content-type"] = "application/json";

  const { data } = await axios.post<{ okay: boolean }>(
    `${SCIWEAVE_URL}/v1/nodes/publish`,
    JSON.stringify(input),
    options
  );
  return data;
};

export const getDatasetTree = async (
  cid: string,
  nodeUuid: string,
  pub = false
) => {
  const route = pub ? "pubTree" : "retrieveTree";
  const { data } = await axios.get(
    `${SCIWEAVE_URL}/v1/datasets/${route}/${nodeUuid}/${cid}`,
    config()
  );
  return data;
};

export const getDataUsage = async () => {
  const { data } = await axios.get(`${SCIWEAVE_URL}/v1/users/usage`, config());
  return data;
};

export const getDataset = async (cid: string, nodeUuid: string) => {
  const { data } = await axios.get(
    `${SCIWEAVE_URL}/v1/datasets/downloadDataset/${nodeUuid}/${cid}`,
    config()
  );
  return data;
};

export const updateDatasetComponent = async (
  uuid: string,
  files: FileList | FileSystemEntry[],
  manifest: ResearchObjectV1,
  rootCid: string,
  contextPath: string,
  onProgress?: (e: ProgressEvent) => void
) => {
  const formData = new FormData();
  formData.append("uuid", uuid);
  formData.append("manifest", JSON.stringify(manifest));
  formData.append("rootCid", rootCid);
  formData.append("contextPath", contextPath);
  if (files.length) {
    if (files instanceof FileList) {
      Array.prototype.forEach.call(files, (f) => {
        formData.append("files", f);
      });
    } else {
      const entryList = files as FileSystemEntry[];
      for (let i = 0; i < entryList.length; i++) {
        const f = entryList[i];
        const p = new Promise<File>((res, rej) => {
          (f as FileSystemFileEntry).file((v) => res(v), rej);
        });
        const tempFile = await p;
        const fileName = entryList[i].fullPath;

        formData.append("files", new File([tempFile], fileName));
      }
    }
  }

  const adjustedConfig: any = config();
  adjustedConfig.headers["content-type"] = "multipart/form-data";
  if (onProgress) {
    adjustedConfig.onUploadProgress = (e: ProgressEvent) => onProgress(e);
  }

  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/datasets/update`,
    formData,
    adjustedConfig
  );
  return data;
};

export const deleteDatasetComponent = async (
  uuid: string,
  manifest: ResearchObjectV1,
  rootCid: string
) => {
  const formData = new FormData();
  formData.append("uuid", uuid);
  formData.append("manifest", JSON.stringify(manifest));
  formData.append("rootCid", rootCid);

  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/datasets/delete`,
    {
      uuid,
      rootCid,
      manifest: JSON.stringify(manifest),
    },
    config()
  );
  return data;
};

export const query = async (query: string) => {
  const payload = JSON.stringify({
    query,
  });
  const { data } = await axios.post(
    "https://graph-goerli-dev.desci.com/subgraphs/name/desoc",
    payload
  );
  if (data.errors) {
    console.error(
      `graph index query err ${query}`,
      JSON.stringify(data.errors)
    );
    throw Error(JSON.stringify(data.errors));
  }
  return data.data;
};

export const postSendFriendReferrals = async (emails: string[]) => {
  const options: AxiosRequestConfig = config();
  const { data } = await axios.post<{
    referrals: string[];
    sentEmails: string[];
  }>(`${SCIWEAVE_URL}/v1/referral`, { emails }, options);
  return data;
};

export enum FriendReferralStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
}
export interface FriendReferral {
  createdAt: string;
  id: number;
  uuid: string;
  senderUserId: number;
  receiverEmail: string;
  status: FriendReferralStatus;
  awardedStorage: boolean;
  amountAwardedStorageGb: number;
  updatedAt: string;
}
export const getFriendReferrals = async () => {
  const options: AxiosRequestConfig = config();
  const resp = await axios.get<{
    referrals: FriendReferral[];
  }>(`${SCIWEAVE_URL}/v1/referral`, options);
  return resp.data.referrals;
};

export const patchAcceptFriendReferral = async (referralUuid: string) => {
  const options: AxiosRequestConfig = config();
  const resp = await axios.patch(
    `${SCIWEAVE_URL}/v1/referral/${referralUuid}/accept`,
    {},
    options
  );
  return resp.data;
};
/**
 * TODO: Put this in desci-models?
 */
export enum AvailableUserActionLogTypes {
  btnDownloadData = "btnDownloadData",
  btnDownloadManuscript = "btnDownloadManuscript",
  btnShare = "btnShare",
  viewedNode = "viewedNode",
}
export const postUserAction = async (
  action: AvailableUserActionLogTypes,
  message?: string
) => {
  const { data } = await axios.post(
    `${SCIWEAVE_URL}/v1/log/action`,
    { action, message },
    config()
  );
  return data;
};

export const getPublishStatus = async (
  manifestCid: string,
  nodeUuid: string
) => {
  const { data } = await axios.get(
    `${SCIWEAVE_URL}/v1/nodes/publishStatus/${nodeUuid}/${manifestCid}`
  );
  // debugger
  return data;
};
