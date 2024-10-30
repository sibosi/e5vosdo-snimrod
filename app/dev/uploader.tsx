"use client";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { useState } from "react";

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [directory, setDirectory] = useState<string>("semmi");

  const allDirectories = ["uploads", "groups", "events", "../../podcasts"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("directory", directory);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    console.log(response);
    const result = await response.json();
    console.log(result);

    if (response.ok) alert("Siker");
    else alert(`Error: ${response.statusText}`);
  };

  return (
    <div className="my-2 rounded-xl bg-selfprimary-100 p-2">
      <input
        type="file"
        onChange={handleFileChange}
        placeholder="File feltöltés"
        title="filetöltés"
      />

      <Dropdown>
        <DropdownTrigger>
          <Button variant="bordered" className="text-foreground">
            {directory}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Single selection example"
          variant="flat"
          disallowEmptySelection
          selectionMode="single"
          className="text-foreground-600"
          selectedKeys={new Set([directory])}
          onSelectionChange={(keys: any) => {
            setDirectory(keys.values().next().value);
          }}
        >
          {allDirectories.map((dir) => (
            <DropdownItem key={dir}>{dir}</DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>

      <Button onClick={handleUpload}>Upload File</Button>
    </div>
  );
}
