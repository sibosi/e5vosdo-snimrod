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
  Chip,
} from "@heroui/react";
import React, { useState } from "react";
import { Link } from "@/config/groups";
import {
  ClassroomIcon,
  EmailIcon,
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LikeIcon,
  LinkIcon,
  PhoneIcon,
  SpotifyIcon,
  YoutubeIcon,
} from "./icons";

type CardProps = {
  title: string;
  image?: string;
  details: string;
  description?: string;
  popup?: boolean;
  children?: React.ReactNode;
  links?: Link[];
  new?: boolean;
};

const iconSize = 20;
const LinkTypeIcons = {
  github: <GithubIcon size={iconSize} />,
  instagram: <InstagramIcon size={iconSize} />,
  facebook: <FacebookIcon size={iconSize} />,
  email: <EmailIcon size={iconSize} />,
  phone: <PhoneIcon size={iconSize} />,
  website: <LinkIcon size={iconSize} />,
  classroom: <ClassroomIcon size={iconSize} />,
  youtube: <YoutubeIcon size={iconSize} />,
  spotify: <SpotifyIcon size={iconSize} />,
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
      <div className="grid grid-cols-2 justify-items-center gap-2 text-left md:grid-cols-3 xl:grid-cols-4">
        {cards.map((card, index) => (
          <div
            key={"CardList" + index}
            className="mb-2 flex h-auto w-40 flex-col overflow-hidden rounded-xl border-1 border-selfprimary-200 bg-selfprimary-bg text-foreground shadow-md sm:w-60"
          >
            {typeof card.image === "string" && (
              <button
                type="button"
                className="relative h-40 sm:h-60"
                onClick={() =>
                  typeof card.details === "string" &&
                  showingCard === null &&
                  setShowingCard(card)
                }
              >
                <Image
                  fill={true}
                  className="rounded-md object-contain"
                  src={card.image}
                  alt="image"
                  priority={true}
                />
                {card.new && (
                  <Chip className="absolute right-2 top-2 bg-selfsecondary-300 shadow-md">
                    Új
                  </Chip>
                )}
              </button>
            )}

            <div className="p-2">
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
                        card.links &&
                        (card.links?.filter((l) => l.type === link.type)
                          .length === 1 ||
                          card.links[index] ===
                            card.links?.filter(
                              (l) => l.type === link.type,
                            )[0]) && (
                          <button
                            type="button"
                            key={"CardLink" + index}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (openedLink === link) setOpenedLink(null);
                              else if (
                                card.links?.filter((l) => l.type === link.type)
                                  .length === 1
                              )
                                navigateToLink(link);
                              else setOpenedLink(link);
                            }}
                            className={
                              "w-full justify-center self-center rounded-t-lg py-1 text-center " +
                              (openedLink === link ? "bg-selfprimary-100" : "")
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
                          </button>
                        ),
                    )}
                  </div>

                  {
                    <div
                      className={
                        "overflow-hidden rounded-lg bg-selfprimary-100 text-center text-sm transition-all duration-300 " +
                        (openedLink && card.links.includes(openedLink)
                          ? "h-auto p-1"
                          : "h-0 p-0")
                      }
                    >
                      {card.links.map(
                        (link, index) =>
                          link.type == openedLink?.type && (
                            <button
                              type="button"
                              key={"CardLink" + index}
                              className="m-auto my-1 max-w-fit cursor-pointer rounded-lg bg-selfprimary-200 p-1"
                              onClick={() => navigateToLink(link)}
                            >
                              {link.title}
                            </button>
                          ),
                      )}
                    </div>
                  }
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        size={size}
        isOpen={showingCard !== null}
        onClose={() => setShowingCard(null)}
        scrollBehavior="inside"
        hideCloseButton={true}
        onClick={(e) => {
          e.stopPropagation();
          console.log("clicked");
        }}
      >
        <ModalContent className="max-h-[95vh] overflow-auto bg-selfprimary-bg">
          <ModalHeader className="flex flex-col gap-1 text-xl font-semibold text-foreground">
            {showingCard?.title}
          </ModalHeader>
          <ModalBody>
            <div className="overflow-auto sm:flex">
              <div className="relative w-auto justify-center p-14 sm:w-56 sm:justify-normal sm:p-28">
                {typeof showingCard?.image === "string" && (
                  <Image
                    fill={true}
                    className="max-h-fit rounded-md object-contain"
                    src={showingCard.image}
                    alt="image"
                    priority={true}
                  />
                )}
              </div>
              <div className="overflow-auto fill-overlay px-6 py-6 text-left text-foreground md:max-h-full">
                <p className="text-md overflow-auto whitespace-pre-line pb-4">
                  {showingCard?.details}
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              className="bg-selfprimary-300"
              onPress={() => setShowingCard(null)}
            >
              <LikeIcon width={28} height={28} />
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PopupCards;
