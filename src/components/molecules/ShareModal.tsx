import { ButtonHTMLAttributes, useEffect, useMemo, useState } from "react";
import Modal, { ModalProps } from "@src/components/molecules/Modal/Modal";
import { useNodeReader, useNodeVersions } from "@src/state/nodes/hooks";
import {
  SwitchBar,
  SwitchButton,
} from "@src/components/atoms/SwitchBar/SwitchBar";
import NodeInvite from "@src/components/molecules/NodeShare/Invite/Invite";
import SharePublished from "@src/components/molecules/NodeShare/SharePublished/SharePublished";
import { useUser } from "@src/state/user/hooks";
import {
  nodesApi,
  useCreateShareLinkMutation,
  useGetNodesQuery,
  usePrivateShareQuery,
} from "@src/state/api/nodes";
import ButtonSecondary from "../atoms/ButtonSecondary";
import { IconCopyLink } from "@src/icons";
import { useCopier } from "./Copier";
import { useSetter } from "@src/store/accessors";
import { tags } from "@src/state/api/tags";
import DefaultSpinner from "../atoms/DefaultSpinner";

enum ShareTabs {
  Invite = "Invite",
  Public = "Public",
}

export default function ShareModal(props: ModalProps) {
  const user = useUser();
  const dispatch = useSetter();
  const { data: nodes } = useGetNodesQuery();
  const { currentObjectId, publicView } = useNodeReader();
  const versions = useNodeVersions(currentObjectId);
  const { data: shareId } = usePrivateShareQuery(currentObjectId!, {
    skip: !currentObjectId,
  });
  const [createShareLink, { isLoading }] = useCreateShareLinkMutation();

  useEffect(() => {
    dispatch(
      nodesApi.util.invalidateTags([
        { type: tags.privateShare, id: currentObjectId },
      ])
    );
  }, [currentObjectId, dispatch, shareId]);

  const canSendInvite = useMemo(() => {
    if (publicView || !user) return false;

    // TODO: in future add more sophisticated check for user permissions
    const isOwner = nodes?.find(
      (n) => n.uuid === currentObjectId && n?.ownerId === user.userId
    );
    return !!isOwner;
  }, [publicView, user, nodes, currentObjectId]);

  const canSharePublished = publicView || !!versions;

  const [currentTab, setCurrentTab] = useState(() =>
    canSendInvite ? ShareTabs.Invite : ShareTabs.Public
  );

  return (
    <Modal
      isOpen={props.isOpen}
      onDismiss={props?.onDismiss}
      $maxWidth={600}
      $scrollOverlay={true}
    >
      <div className="px-6 py-5 text-white relative min-w-[600px]">
        <Modal.Header
          title="Share Research Node"
          onDismiss={props?.onDismiss}
        />
        <div className="flex items-center justify-center w-full">
          <SwitchBar
            style={{ margin: "1rem 0 1rem 0", height: 35, maxWidth: 400 }}
          >
            <SwitchButton
              isSelected={currentTab === ShareTabs.Invite}
              onClick={() => setCurrentTab(ShareTabs.Invite)}
            >
              <p className="text-xs flex justify-center items-center h-full capitalize">
                Invite Collaborator
              </p>
            </SwitchButton>
            <SwitchButton
              isSelected={currentTab === ShareTabs.Public}
              onClick={() => setCurrentTab(ShareTabs.Public)}
              disabled={!canSharePublished}
            >
              <p className="text-xs flex justify-center items-center h-full capitalize">
                Share Published version
              </p>
            </SwitchButton>
          </SwitchBar>
        </div>
        {currentTab === ShareTabs.Invite && <NodeInvite />}
        {currentTab === ShareTabs.Public && <SharePublished />}
      </div>
      {currentTab === ShareTabs.Invite && (
        <Modal.Footer>
          <div className="flex items-center justify-start w-full">
            {!shareId && (
              <ButtonSecondary
                disabled={isLoading}
                onClick={() => createShareLink(currentObjectId!)}
              >
                {isLoading ? (
                  <DefaultSpinner color="white" size={24} />
                ) : (
                  <IconCopyLink
                    className="fill-white group-hover:fill-black"
                    width={20}
                    height={20}
                  />
                )}
                <span className="ml-1">
                  {isLoading ? "Creating link" : "Create private link"}
                </span>
              </ButtonSecondary>
            )}
            {shareId && (
              <CopyShareLink link={`http://localhost:3000/share/${shareId}`} />
            )}
          </div>
        </Modal.Footer>
      )}
    </Modal>
  );
}

export function CopyShareLink(
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    link: string;
  }
) {
  const { handleCopy, copied } = useCopier();

  return (
    <ButtonSecondary
      className="capitalize group"
      onClick={() => handleCopy(props.link)}
      disabled={copied}
    >
      <IconCopyLink
        className={`${
          copied ? "fill-neutrals-gray-7" : "fill-white group-hover:fill-black"
        } `}
        width={20}
        height={20}
      />
      <span>{copied ? "Link copied" : "Copy Read-Only link"}</span>
    </ButtonSecondary>
  );
}
