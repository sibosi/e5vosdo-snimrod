// components/profileicon.tsx
"use client";

import { Avatar } from "@nextui-org/react";
import { Session } from "next-auth";

const ProfileIcon = ({ session }: { session: Session | null }) => {
  return (
    <div>
      {session?.user?.image && session?.user?.name ? (
        <Avatar isBordered color="default" src={session.user.image} />
      ) : (
        <Avatar isBordered color="default" src="apa-logo.jpg" />
      )}
    </div>
  );
};

export default ProfileIcon;
