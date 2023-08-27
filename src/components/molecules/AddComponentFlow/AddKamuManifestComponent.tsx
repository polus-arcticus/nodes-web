import React, { useEffect } from "react";
import InsetLabelInput from "../FormInputs/InsetLabelInput";
import UploadYAML from "../UploadYAML";
import useFileUpload from "react-use-file-upload";

import { capitalize } from "@components/utils";

import {
  ResearchObjectComponentDocumentSubtype,
  ResearchObjectComponentSubtypes,
} from "@desci-labs/desci-models";
interface Props {
  subtype: ResearchObjectComponentSubtypes | null;
  setSubtype: React.Dispatch<any>;
  customSubtype: string;
  setCustomSubtype: (value: React.SetStateAction<string>) => void;
  // setFileLink: React.Dispatch<React.SetStateAction<string | undefined>>;
  files: File[];
  setFiles: (e: Event) => void;
  clearAllFiles: () => void;
  urlOrDoi: string | undefined;
  setUrlOrDoi: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const AddKamuManifestComponent: React.FC<Props> = ({
  files,
  setFiles,
  clearAllFiles,
}) => {
  useEffect(() => {
    return () => {
      clearAllFiles();
    };
  }, []);

  // useEffect(() => {
  //   if (files && files.length) {
  //     let reader = new FileReader();
  //     const file = files[0];
  //     reader.readAsDataURL(file);
  //     reader.onload = () => {
  //       setFileLink(reader.result!.toString());
  //     };
  //   }
  // }, [files]);
  return (
    <div>
      <div className="flex flex-col gap-6 items-center">
        <UploadYAML
          files={files}
          clearAllFiles={clearAllFiles}
          setFiles={setFiles}
        />

        {files[0] &&
          <div className="w-full flex gap-2 pr-16">
            <p className="truncate text-white w-full">{files[0].name}</p>
            <span className="text-sm max-w-full py-1 px-2 rounded-xl select-none bg-white">
              {files[0].type}
            </span>
          </div>
        }
      </div>
    </div>
  );
};

export default AddKamuManifestComponent;
