"use client";
import Image from "next/image";
import "../styles/globals.css";
import parse from "html-react-parser";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { LikeIcon } from "./icons";

type CardProps = {
  title: string;
  datetime?: string;
  image?: string;
  details: React.ReactNode;
  makeStringToHTML?: boolean;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
};

export const PopupButton: React.FC<CardProps> = ({
  title,
  datetime,
  image,
  details,
  makeStringToHTML,
  isModalOpen,
  setIsModalOpen,
}: CardProps) => {
  return (
    <Modal
      size="md"
      isOpen={isModalOpen}
      scrollBehavior="inside"
      onClose={() => setIsModalOpen(false)}
      className="relative overflow-hidden"
      hideCloseButton
    >
      <ModalContent>
        {(onClose) => (
          <>
            {typeof image === "string" && (
              <img
                src={image}
                alt={title}
                className="max-h-60 w-full object-cover"
              />
            )}
            <ModalHeader className="flex flex-col gap-1 text-xl font-semibold text-foreground">
              {title}
            </ModalHeader>
            <ModalBody className="pb-18 scrollbar-hide">
              {typeof datetime === "string" && (
                <p>Időpont: {new Date(datetime).toLocaleString("hu-HU")}</p>
              )}

              <div className="fill-overlay text-left text-foreground">
                <p className="text-md whitespace-pre-line">
                  <span>
                    {makeStringToHTML ? parse(details as string) : details}
                  </span>
                </p>
              </div>
            </ModalBody>
            <ModalFooter className="absolute bottom-1 w-full">
              <Button
                variant="solid"
                color="default"
                className="w-full"
                onPress={onClose}
              >
                Bezárás
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
