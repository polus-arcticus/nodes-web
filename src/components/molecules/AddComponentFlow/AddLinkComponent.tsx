import React from "react";
import InsetLabelInput from "../FormInputs/InsetLabelInput";
import { ResearchObjectComponentSubtypes } from "@desci-labs/desci-models";

interface Props {
  url: string | undefined;
  setUrl: React.Dispatch<React.SetStateAction<string | undefined>>;
  subType: ResearchObjectComponentSubtypes | null;
  setSubType: React.Dispatch<any>;
}

const AddLinkComponent: React.FC<Props> = ({
  url,
  setUrl,
  subType,
  setSubType,
}) => {
  return (
    <div className="py-3 flex flex-col gap-6 items-center">
      <InsetLabelInput
        label={"Enter URL"}
        value={url}
        onChange={(value: any) => {
          setUrl(value.target.value.trim());
        }}
      />
    </div>
  );
};

export default AddLinkComponent;
