"use client";
import Image from "next/image";
import "../styles/globals.css";

type CardProps = {
  title: string;
  image?: string;
  details: React.ReactNode;
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
              <ModalHeader className="flex flex-col gap-1 text-xl font-semibold text-foreground">
                {title}
              </ModalHeader>
              <ModalBody>
                <div className="overflow-auto sm:flex">
                  <div className="relative w-auto justify-center p-14 sm:w-56 sm:justify-normal sm:p-28">
                    {typeof image === "string" && (
                      <Image
                        fill={true}
                        className="max-h-fit rounded-md object-contain"
                        src={image}
                        alt="image"
                        priority={true}
                      />
                    )}
                  </div>
                  <div className="overflow-auto fill-overlay px-6 py-6 text-left text-foreground md:max-h-[100%]">
                    <p className="text-md overflow-auto whitespace-pre-line pb-4">
                      {details}
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button className="fill-selfprimary" onPress={onClose}>
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
