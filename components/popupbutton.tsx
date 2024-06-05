"use client";
import Image from "next/image";
import "../styles/globals.css";

type CardProps = {
  title: string;
  image?: string;
  details: string;
  button_size?: "sm" | "md" | "lg";
  className?: string;
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

export const PopupButton = ({
  title,
  image,
  details,
  button_size,
  className,
  children,
}: CardProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const size = "5xl";

  const handleOpen = () => {
    onOpen();
  };
  return (
    <>
      <Button
        size={button_size == undefined ? "md" : button_size}
        onPress={() => handleOpen()}
        className={className}
      >
        Részletek
      </Button>
      <Modal size={size} isOpen={isOpen} onClose={onClose}>
        <ModalContent className="max-h-[95vh] overflow-auto">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-xl text-foreground font-semibold">
                {title}
              </ModalHeader>
              <ModalBody>
                <div className="overflow-auto sm:flex">
                  <div className="relative w-auto p-14 sm:w-56 sm:p-28 justify-center sm:justify-normal">
                    {typeof image === "string" && (
                      <Image
                        fill={true}
                        className="object-contain max-h-fit rounded-md"
                        src={image}
                        alt="image"
                        priority={true}
                      />
                    )}
                  </div>
                  <div className="overflow-auto fill-overlay md:max-h-[100%] text-left text-foreground px-6 py-6">
                    <p className="text-md whitespace-pre-line pb-4 overflow-auto">
                      {details}
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Ok
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
