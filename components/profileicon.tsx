// components/profileicon.tsx
"use client";

import { useState } from "react";
import { Avatar } from "@nextui-org/react";
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
      {showButtons && (
        <div
          className="left-0 top-0 fixed w-full h-screen bg-transparent "
          onClick={handleIconClick}
        />
      )}

      <div
        className={`fixed top-14 backdrop-blur-md bg-default-300/90 rounded-2xl transition-all duration-400 overflow-hidden text-center text-foreground ${
          !showButtons
            ? "h-0 p-0 w-0 right-10 2xl:right-48"
            : "h-auto p-6 right-6 2xl:right-48"
        } `}
      >
        <>
          {session ? (
            <>
              <p>{String(session.user?.name)}</p>
              <LogOut />
            </>
          ) : (
            <Login />
          )}
        </>
      </div>
    </div>
  );
};
