import PrimaryButton from "@src/components/atoms/PrimaryButton";
import React, { useRef } from "react";

interface UploadYAMLProps {
  files: File[];
  clearAllFiles: () => void;
  setFiles: (e: Event) => void;
  onClick?: any;
  inUse?: boolean;
  className?: string;
}

const UploadYAML: React.FC<UploadYAMLProps> = ({
  files,
  clearAllFiles,
  setFiles,
  onClick,
  inUse,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`text-center w-full ${className}`}>
      <div>
        {!files || !files.length || inUse ? (
          <PrimaryButton
            onClick={() => {
              inputRef.current?.click();
              onClick && onClick();
            }}
            className="w-full mx-auto"
          >
            Upload YAML
          </PrimaryButton>
        ) : (
          <span className="inline-block p-2 text-gray-300 text-xs font-bold">
            {files.length} file selected{" "}
            <span
              onClick={() => clearAllFiles()}
              className="text-tint-primary hover:text-tint-primary-hover cursor-pointer"
            >
              clear
            </span>
          </span>
        )}
      </div>
      {/* Hide the crappy looking default HTML input */}
      <input
        ref={inputRef}
        type="file"
        accept=".yaml,.yml"
        style={{ display: "none" }}
        onChange={(e: any) => {
          setFiles(e);
          e.target.value = null;
        }}
      />
    </div>
  );
};

export default UploadYAML;
