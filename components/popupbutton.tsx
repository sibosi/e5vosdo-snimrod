"use client";
import Image from "next/image";
import "../styles/globals.css";

type CardProps = {
  title: string;
  image: string;
  details: string;
  children?: React.ReactNode;
};

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import React from "react";

export const PopupButton = ({ title, image, details, children }: CardProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const size = "5xl";

  const handleOpen = () => {
    onOpen();
  };
  return (
    <>
      <Button onPress={() => handleOpen()}>Részletek</Button>
      <Modal size={size} isOpen={isOpen} onClose={onClose}>
        <ModalContent className="max-h-[95vh] overflow-auto">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Modal Title
              </ModalHeader>
              <ModalBody>
                <div className="overflow-auto md:flex h-auto pt-7">
                  <div className="relative w-32 h-auto p-14 md:w-56 md:p-28">
                    <Image
                      fill={true}
                      sizes="100vw"
                      className="object-contain h-auto rounded-md"
                      src={image}
                      alt="image"
                      priority={true}
                    />
                  </div>
                  <div className="overflow-auto fill-overlay h-auto md:max-h-[100%] text-left text-foreground px-6 py-6">
                    <h2 className="text-lg font-bold">{title}</h2>
                    <br />
                    <p className="text-md whitespace-pre-line pb-4 overflow-auto">
                      {details}
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
