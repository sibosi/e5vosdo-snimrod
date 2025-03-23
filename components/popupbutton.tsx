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
  Link,
} from "@heroui/react";

type CardProps = {
  title: string;
  image?: string;
  details: React.ReactNode;
  makeStringToHTML?: boolean;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
};

export const PopupButton: React.FC<CardProps> = ({
  title,
  image,
  details,
  makeStringToHTML,
  isModalOpen,
  setIsModalOpen,
}: CardProps) => {
  return (
    <Modal
      size="5xl"
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    >
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
  );
};
