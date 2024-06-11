// components/profileicon.tsx
"use client";

import { useState } from "react";
import { Avatar, Button, Modal, ModalContent } from "@nextui-org/react";
import { Session } from "next-auth";
import Login from "./LoginForm";
import LogOut from "./LogOut";

export const ProfileIcon = ({ session }: { session: Session | null }) => {
  const [showButtons, setShowButtons] = useState(false);

  const handleIconClick = () => {
    setShowButtons(!showButtons);
  };

  return (
    <div>
      <div onClick={handleIconClick}>
        {session?.user?.image && session?.user?.name ? (
          <Avatar isBordered color="default" src={session.user.image} />
        ) : (
          <Avatar isBordered color="default" src="apa-logo.jpg" />
        )}
      </div>
      <Modal className={"relative z-50"} isOpen={showButtons}>
        <ModalContent>
          <Login />
          <LogOut />
        </ModalContent>
      </Modal>
    </div>
  );
};
