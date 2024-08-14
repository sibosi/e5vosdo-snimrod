"use client";
import Image from "next/image";
import "../styles/globals.css";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import React, { useState } from "react";
import { Link } from "@/config/groups";
import {
  EmailIcon,
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkIcon,
  PhoneIcon,
} from "./icons";

type CardProps = {
  title: string;
  image?: string;
  details?: string;
  description: string;
  popup?: boolean;
  children?: React.ReactNode;
  links?: Link[];
};

const iconSize = 20; // Icon size in pixels
const LinkTypeIcons = {
  github: <GithubIcon size={iconSize} />,
  instagram: <InstagramIcon size={iconSize} />,
  facebook: <FacebookIcon size={iconSize} />,
  email: <EmailIcon size={iconSize} />,
  phone: <PhoneIcon size={iconSize} />,
  website: <LinkIcon size={iconSize} />,
};

const PopupCards = ({
  cards,
  buttonSize,
}: {
  cards: CardProps[];
  buttonSize?: "sm" | "md" | "lg";
}) => {
  const [showingCard, setShowingCard] = useState<CardProps | null>(null);
  const [openedLink, setOpenedLink] = useState<Link | null>(null);

  const size = "5xl";
  return (
    <>
      <div className="text-left gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-b-8 border-transparent justify-items-center">
        {cards.map((card, index) => (
          <div
            key={"CardList" + index}
            className="card bg-foreground-50 border-1 border-foreground-100 w-40 sm:w-60 mb-2 h-auto text-foreground"
          >
            {typeof card.image === "string" && (
              <figure className="relative w-40 sm:w-60 h-unit-40 sm:h-unit-60">
                <Image
                  fill={true}
                  sizes="100vw"
                  className="object-contain h-auto rounded-md"
                  src={card.image} // Ensure image is always a string here
                  alt="image"
                  priority={true}
                />
              </figure>
            )}

            <div className="card-body flex p-2">
              <h2 className="card-title text-center mx-auto text-clip overflow-hidden">
                {card.title}
              </h2>
              {card.description !== "" && <p>card.description</p>}
              {card.children}

              {card.links && card.links.length > 0 && (
                <div className="transition-all duration-300">
                  <div
                    className={`grid grid-cols-${card.links.length} gap-2 text-small text-center mx-1 mt-1`}
                  >
                    {card.links.map((link, index) => (
                      <div
                        key={"CardLink" + index}
                        onClick={() =>
                          openedLink === link
                            ? setOpenedLink(null)
                            : setOpenedLink(link)
                        }
                        className={
                          "rounded-t-lg text-center justify-center self-center py-1 " +
                          (openedLink === link ? "bg-primary-100" : "")
                        }
                      >
                        <p className="m-auto max-w-fit">
                          {Object.keys(LinkTypeIcons).includes(
                            String(link.type)
                          )
                            ? LinkTypeIcons[
                                link.type as keyof typeof LinkTypeIcons
                              ]
                            : link.title}
                        </p>
                      </div>
                    ))}
                  </div>

                  {openedLink !== null ? (
                    <div
                      className={
                        "transition-all duration-300 bg-primary-100 rounded-lg text-center overflow-hidden " +
                        (card.links.includes(openedLink)
                          ? "h-auto p-1"
                          : "h-0 p-0")
                      }
                      onClick={() =>
                        openedLink.type === "phone"
                          ? window.open(`tel:${openedLink.value}`, "_blank")
                          : openedLink.type === "email"
                          ? window.open(`mailto:${openedLink.value}`, "_blank")
                          : window.open(openedLink.value, "_blank")
                      }
                    >
                      {openedLink.title}
                    </div>
                  ) : null}
                </div>
              )}

              <div className="card-actions justify-end">
                <div className="flex flex-wrap gap-3">
                  {typeof card.details === "string" ? (
                    <>
                      <Button
                        size={buttonSize == undefined ? "md" : buttonSize}
                        onPress={() => setShowingCard(card)}
                        // className={className}
                      >
                        Részletek
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showingCard !== null && (
        <Modal
          size={size}
          isOpen={showingCard !== null}
          onClose={() => setShowingCard(null)}
        >
          <ModalContent className="max-h-[95vh] overflow-auto">
            <ModalHeader className="flex flex-col gap-1 text-xl text-foreground font-semibold">
              {showingCard.title}
            </ModalHeader>
            <ModalBody>
              <div className="overflow-auto sm:flex">
                <div className="relative w-auto p-14 sm:w-56 sm:p-28 justify-center sm:justify-normal">
                  {typeof showingCard.image === "string" && (
                    <Image
                      fill={true}
                      className="object-contain max-h-fit rounded-md"
                      src={showingCard.image}
                      alt="image"
                      priority={true}
                    />
                  )}
                </div>
                <div className="overflow-auto fill-overlay md:max-h-[100%] text-left text-foreground px-6 py-6">
                  <p className="text-md whitespace-pre-line pb-4 overflow-auto">
                    {showingCard.details}
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={() => setShowingCard(null)}>
                Ok
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default PopupCards;
