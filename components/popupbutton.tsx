"use client";
import Image from "next/image";
import "../styles/globals.css";
import parse from "html-react-parser";

type CardProps = {
  title: string;
  image?: string;
  details: React.ReactNode;
  button_size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
  makeStringToHTML?: boolean;
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

export const PopupButton: React.FC<CardProps> = ({
  title,
  image,
  details,
  button_size,
  className,
  children,
  makeStringToHTML,
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
        color="primary"
        radius="lg"
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
                <div className="overflow-auto">
                  <div className="relative h-56 w-full sm:p-12">
                    {typeof image === "string" && (
                      <Image
                        fill={true}
                        className="max-h-fit rounded-md object-cover"
                        src={image}
                        alt="image"
                        priority={true}
                      />
                    )}
                  </div>
                  <div className="overflow-auto fill-overlay px-6 py-6 text-left text-foreground md:max-h-[100%]">
                    <p className="text-md overflow-auto whitespace-pre-line pb-4">
                      <span>
                        {makeStringToHTML ? parse(details as string) : details}
                      </span>
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
