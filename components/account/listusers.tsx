"use client";
import { Button, Image } from "@nextui-org/react";
import React from "react";

const ListUsers = ({
  admins,
  session,
  users,
}: {
  admins: any[];
  session: any;
  users: any;
}) => {
  function sortUsers(users: []) {
    return users.sort((a: any, b: any) => {
      return (
        new Date(b.last_login).getTime() - new Date(a.last_login).getTime()
      );
    });
  }

  async function addUserPermissions(user: any, permission: string) {
    const response = await fetch(`/api/addUserPermissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: user.email, permission: permission }),
    });
    console.log(response);
  }

  async function removeUserPermissions(user: any, permission: string) {
    const response = await fetch(`/api/removeUserPermissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: user.email, permission: permission }),
    });
    console.log(response);
  }

  return (
    <>
      {admins.includes(session?.user?.email ?? "") ? (
        (sortUsers(users) as any).map((user: any) => (
          <div
            key={user.email}
            className="rounded-xl bg-foreground-100 my-4 p-3 text-foreground"
          >
            <Image
              src={user.image}
              alt={user.username}
              width={72}
              height={72}
              className="rounded-full"
            />
            <h1 className="text-foreground">{user.username}</h1>
            <p>{user.email}</p>
            <p>{String(user.last_login)}</p>
            <p>Permissions: {(user.permissions ?? []).join(" ")}</p>
          </div>
        ))
      ) : (
        <></>
      )}
    </>
  );
};

export default ListUsers;
