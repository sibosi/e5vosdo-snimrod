"use client";
import { User } from "@/db/dbreq";
import { Button, Image } from "@nextui-org/react";
import React, { useState, useEffect } from "react";

function sortUsers(users: any[]) {
  return users.sort((a: any, b: any) => {
    return new Date(b.last_login).getTime() - new Date(a.last_login).getTime();
  });
}

async function fetchUsers(setUsers: (data: any) => void) {
  const response = await fetch("/api/getUsers"); // Adjust the endpoint as necessary
  const data = await response.json();
  setUsers(sortUsers(data));
}

const ListUsers = ({
  admins,
  selfUser,
  initialUsers,
}: {
  admins: any[];
  selfUser: User;
  initialUsers: any;
}) => {
  const [users, setUsers] = useState(sortUsers(initialUsers));
  const [reloadUsers, setReloadUsers] = useState(false);

  async function addUserPermission(email: any, permission: string) {
    const response = await fetch(`/api/addUserPermission`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, permission: permission }),
    });
    setReloadUsers(true);
  }

  async function removeUserPermission(email: any, permission: string) {
    const response = await fetch(`/api/removeUserPermissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, permission: permission }),
    });
    setReloadUsers(true);
  }

  useEffect(() => {
    if (reloadUsers) {
      fetchUsers(setUsers).then(() => setReloadUsers(false));
    }
  }, [reloadUsers]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((user: any) => (
        <div
          key={user.email}
          className="rounded-3xl bg-primary-50 p-6 text-foreground"
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
            {["student", "admin", "tester"].map((permission) =>
              user.permissions.includes(permission) ? (
                <Button
                  key={permission + " enable"}
                  size="sm"
                  color="success"
                  onClick={() => removeUserPermission(user.email, permission)}
                >
                  {permission}
                </Button>
              ) : (
                <Button
                  key={permission + " disable"}
                  size="sm"
                  color="default"
                  onClick={() => addUserPermission(user.email, permission)}
                >
                  {permission}
                </Button>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListUsers;
