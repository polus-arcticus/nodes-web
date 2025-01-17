import { DriveObject } from "../types";
import { useContextMenu } from "./provider";
import { Actions } from "./types";
import useActionHandler, { getActionState } from "./useActionHandler";
import { AiOutlineDownload } from "react-icons/ai";
import { VscLinkExternal } from "react-icons/vsc";
import { SlPencil } from "react-icons/sl";
import { BsTrash } from "react-icons/bs";

const menuListLabel: Record<Actions, string> = {
  RENAME: "Rename",
  PREVIEW: "Preview",
  DOWNLOAD: "Download",
  REMOVE: "Delete",
};

type IconType = React.FunctionComponent<
  React.SVGProps<SVGSVGElement> & {
    title?: string | undefined;
  }
>;

const ActionIcons: Record<Actions, IconType> = {
  PREVIEW: VscLinkExternal,
  RENAME: SlPencil,
  DOWNLOAD: AiOutlineDownload,
  REMOVE: BsTrash,
};

function MenuList({ file }: { file: DriveObject }) {
  const { closeMenu } = useContextMenu();
  console.log(file);
  return (
    <ul className="py-1">
      {Object.keys(menuListLabel).map((action, i) => (
        <MenuListItem
          file={file}
          key={i}
          action={action as Actions}
          onClick={closeMenu}
        />
      ))}
    </ul>
  );
}

function MenuListItem({
  file,
  action,
  onClick,
}: {
  file: DriveObject;
  action: Actions;
  onClick: () => void;
}) {
  const handler = useActionHandler();
  const Icon = ActionIcons[action as Actions];
  const { disabled: disableAction } = getActionState(action as Actions, file);

  const handleClick = () => {
    if (disabled) return;

    !disabled && onClick();
    handler[action]?.(file);
  };
  const disabled = !handler[action] || disableAction;

  return (
    <li
      className={`px-4 py-2 list-none flex items-center gap-4 ${
        disabled
          ? "opacity-30"
          : "hover:bg-dark-gray dark:hover:bg-dark-gray cursor-pointer"
      }`}
      onClick={handleClick}
    >
      <Icon
        className="w-5"
        color={action === Actions.REMOVE ? "#C96664" : ""}
      />
      <span
        className={`${action === Actions.REMOVE ? "text-states-error" : ""}`}
      >
        {menuListLabel[action as Actions]}
      </span>
    </li>
  );
}

export function buildMenu(file: DriveObject) {
  return <MenuList file={file} />;
}
