"use client";
import { Button, Image } from "@nextui-org/react";
import React, { useState, useEffect } from "react";

const ListUsers = ({
  admins,
  session,
  initialUsers,
}: {
  admins: any[];
  session: any;
  initialUsers: any;
}) => {
  function sortUsers(users: any[]) {
    return users.sort((a: any, b: any) => {
      return (
        new Date(b.last_login).getTime() - new Date(a.last_login).getTime()
      );
    });
  }

  const [users, setUsers] = useState(sortUsers(initialUsers));
  const [reloadUsers, setReloadUsers] = useState(false);

  async function fetchUsers() {
    const response = await fetch("/api/getUsers"); // Adjust the endpoint as necessary
    const data = await response.json();
    setUsers(sortUsers(data));
  }

  async function addUserPermission(email: any, permission: string) {
    const response = await fetch(`/api/addUserPermission`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, permission: permission }),
    });
    console.log(response);
    setReloadUsers(true);
  }

  async function removeUserPermissions(email: any, permission: string) {
    const response = await fetch(`/api/removeUserPermissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, permission: permission }),
    });
    console.log(response);
    setReloadUsers(true);
  }

  useEffect(() => {
    if (reloadUsers) {
      fetchUsers().then(() => setReloadUsers(false));
    }
  }, [reloadUsers]);

  return (
    <>
      {admins.includes(session?.user?.email ?? "") ? (
        users.map((user: any) => (
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
            <div className="flex gap-2">
              <Button
                size="sm"
                color="primary"
                onClick={() => addUserPermission(user.email, "student")}
              >
                + student
              </Button>
              <Button
                size="sm"
                color="primary"
                onClick={() => addUserPermission(user.email, "admin")}
              >
                + admin
              </Button>
              <Button
                size="sm"
                color="primary"
                onClick={() => removeUserPermissions(user.email, "student")}
              >
                - student
              </Button>
              <Button
                size="sm"
                color="primary"
                onClick={() => removeUserPermissions(user.email, "admin")}
              >
                - admin
              </Button>
            </div>
          </div>
        ))
      ) : (
        <></>
      )}
    </>
  );
};

export default ListUsers;
