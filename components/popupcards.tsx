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
  ClassroomIcon,
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
  classroom: <ClassroomIcon size={iconSize} />,
};

const navigateToLink = (value: Link) => {
  if (value.type === "phone") {
    window.open(`tel:${value.value}`, "_blank");
  } else if (value.type === "email") {
    window.open(`mailto:${value.value}`, "_blank");
  } else {
    window.open(value.value, "_blank");
  }
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
      <div className="grid grid-cols-2 justify-items-center gap-2 border-b-8 border-transparent text-left md:grid-cols-3 lg:grid-cols-4">
        {cards.map((card, index) => (
          <div
            key={"CardList" + index}
            className="card mb-2 h-auto w-40 border-1 border-foreground-100 bg-foreground-50 text-foreground sm:w-60"
          >
            {typeof card.image === "string" && (
              <figure className="relative h-unit-40 w-40 sm:h-unit-60 sm:w-60">
                <Image
                  fill={true}
                  sizes="100vw"
                  className="h-auto rounded-md object-contain"
                  src={card.image} // Ensure image is always a string here
                  alt="image"
                  priority={true}
                />
              </figure>
            )}

            <div className="card-body flex p-2">
              <h2 className="card-title mx-auto overflow-hidden text-clip text-center">
                {card.title}
              </h2>
              {card.description !== "" && <p>card.description</p>}
              {card.children}

              {card.links && card.links.length > 0 && (
                <div>
                  <div
                    className={`mx-1 mt-1 flex gap-2 text-center text-small`}
                  >
                    {card.links.map(
                      (link, index) =>
                        // If there is multiple links with the same type show only once the icon
                        card.links &&
                        (card.links?.filter((l) => l.type === link.type)
                          .length === 1 ||
                          card.links[index] ===
                            card.links?.filter(
                              (l) => l.type === link.type,
                            )[0]) && (
                          <div
                            key={"CardLink" + index}
                            onClick={() => {
                              openedLink === link
                                ? setOpenedLink(null)
                                : card.links?.filter(
                                      (l) => l.type === link.type,
                                    ).length === 1
                                  ? navigateToLink(link)
                                  : setOpenedLink(link);
                            }}
                            className={
                              "w-full justify-center self-center rounded-t-lg py-1 text-center " +
                              (openedLink === link ? "bg-primary-100" : "")
                            }
                          >
                            <p className="m-auto max-w-fit cursor-pointer">
                              {Object.keys(LinkTypeIcons).includes(
                                String(link.type),
                              )
                                ? LinkTypeIcons[
                                    link.type as keyof typeof LinkTypeIcons
                                  ]
                                : link.title}
                            </p>
                          </div>
                        ),
                    )}
                  </div>

                  {
                    <div
                      className={
                        "overflow-hidden rounded-lg bg-primary-100 text-center text-sm transition-all duration-300 " +
                        (openedLink && card.links.includes(openedLink)
                          ? "h-auto p-1"
                          : "h-0 p-0")
                      }
                    >
                      {card.links.map(
                        (link, index) =>
                          link.type == openedLink?.type && (
                            <p
                              key={"CardLink" + index}
                              className="m-auto my-1 max-w-fit cursor-pointer rounded-lg bg-primary-200 p-1"
                              onClick={() => navigateToLink(link)}
                            >
                              {link.title}
                            </p>
                          ),
                      )}
                    </div>
                  }
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
            <ModalHeader className="flex flex-col gap-1 text-xl font-semibold text-foreground">
              {showingCard.title}
            </ModalHeader>
            <ModalBody>
              <div className="overflow-auto sm:flex">
                <div className="relative w-auto justify-center p-14 sm:w-56 sm:justify-normal sm:p-28">
                  {typeof showingCard.image === "string" && (
                    <Image
                      fill={true}
                      className="max-h-fit rounded-md object-contain"
                      src={showingCard.image}
                      alt="image"
                      priority={true}
                    />
                  )}
                </div>
                <div className="overflow-auto fill-overlay px-6 py-6 text-left text-foreground md:max-h-[100%]">
                  <p className="text-md overflow-auto whitespace-pre-line pb-4">
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
