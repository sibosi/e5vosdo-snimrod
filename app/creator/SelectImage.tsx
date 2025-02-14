"use client";
import { Alert } from "@/components/home/alert";
import { siteConfig } from "@/config/site";
import { ImageData } from "@/db/supabaseStorage";
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const SelectImage = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null | undefined>(
    value,
  );

  React.useEffect(() => {
    setSelectedImage(value);
  }, [value]);
  const [currentFolder, setCurrentFolder] = useState("");
  const [showedFolders, setShowedFolders] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("directory", "images");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      alert("Sikeres feltöltés!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Hiba történt! A fájl mérete nem lehet nagyobb, mint 1MB.");
    }
  };

  const loadImages = async () => {
    try {
      const response = await fetch("/api/getImages", {
        headers: { module: "images" },
      });
      if (!response.ok) throw new Error("Fetch error");
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    if (typeof selectedImage === "string") onChange(selectedImage);
  }, [onChange, selectedImage]);

  useEffect(() => {
    if (!currentFolder) {
      setShowedFolders(
        Array.from(
          new Set(images.map((image) => image.folder ?? "")).values(),
        ).filter((folder) => folder !== ""),
      );
    }
  }, [currentFolder, images]);

  if (selectedImage) {
    return (
      <div className="flex flex-col justify-center rounded-xl bg-selfprimary-50">
        <Button
          onPress={() => setSelectedImage(null)}
          className="bg-selfprimary-300"
        >
          Másik kép kiválasztása
        </Button>

        <div className="my-2 flex justify-center">
          <Image
            src={selectedImage}
            width={320}
            height={160}
            alt={selectedImage}
            className="h-40 w-80 object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid h-24 content-around justify-center rounded-xl bg-selfprimary-50">
        <Button
          onPress={() => setSelectedImage(null)}
          className="bg-selfprimary-300"
        >
          Kép kiválasztása
        </Button>
      </div>

      <Modal
        isOpen={selectedImage === null}
        onClose={() => setSelectedImage(undefined)}
      >
        <ModalContent className="bg-selfprimary-200">
          <ModalHeader>Kép kiválasztása</ModalHeader>

          <div className="h-full max-h-[80vh] w-full grid-cols-2 items-center justify-center overflow-y-auto pb-4">
            <div className="">
              <div className="flex flex-wrap justify-center">
                {images.length === 0 && (
                  <div className="text-center">
                    <p className="text-foreground-100">Képek betöltése...</p>
                  </div>
                )}
                {!currentFolder ? (
                  showedFolders.map((folder) => (
                    <button
                      key={folder}
                      className="m-1 h-48 w-48 rounded-lg bg-selfprimary-300 text-selfprimary-900"
                      onClick={() => setCurrentFolder(folder)}
                    >
                      {folder}
                    </button>
                  ))
                ) : (
                  <button
                    className="m-1 h-48 w-48 rounded-lg bg-selfprimary-300 text-selfprimary-900"
                    onClick={() => setCurrentFolder("")}
                  >
                    Vissza
                  </button>
                )}
                {images.map(
                  (image) =>
                    (image.folder ?? "") === currentFolder && (
                      <button
                        key={image.url}
                        className="m-1"
                        title={image.name}
                        onClick={() => setSelectedImage(image.url)}
                      >
                        <Image
                          src={image.url}
                          width={192}
                          height={192}
                          alt={image.name}
                          className="object-cover"
                        />
                      </button>
                    ),
                )}
              </div>
            </div>
            <div>
              <Alert className="border-selfprimary-200 bg-selfprimary-50 text-selfprimary-900">
                <span>
                  Nem találsz megfelelő képet? Tölts fel egyet! 📸 A feltöltött
                  képek csak jóváhagyás után jelennek meg. Egy kép elutasításra
                  kerülhet, ha az nem megfelelő tartalmú vagy kifogásolható.
                  Indoklás nélkül is elutasítható. Ha kérdésed van,{" "}
                </span>
                <a
                  href={siteConfig.links.mypage}
                  className="text-selfsecondary-800 underline"
                >
                  vedd fel a kapcsolatot a fejlesztővel
                </a>
                <span>.</span>
              </Alert>
              <Input
                title="file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                color="default"
              />
              {selectedFile && (
                <Button onPress={handleUpload} className="mt-2" color="primary">
                  Feltöltés
                </Button>
              )}
            </div>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SelectImage;
