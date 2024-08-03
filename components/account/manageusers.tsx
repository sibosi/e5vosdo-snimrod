"use client";
import { User } from "@/db/dbreq";
import { Button, Image, Input } from "@nextui-org/react";
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

const ManageUsers = ({
  selfUser,
  initialUsers,
}: {
  selfUser: User;
  initialUsers: any;
}) => {
  const [users, setUsers] = useState(sortUsers(initialUsers));
  const [reloadUsers, setReloadUsers] = useState(false);

  const [searchName, setSearchName] = useState("");

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
    if (searchName.length < 2) {
      setUsers(sortUsers(initialUsers));
      return;
    }

    const filteredUsers = initialUsers.filter((user: any) =>
      user.username.toLowerCase().includes(searchName.toLowerCase())
    );
    setUsers(sortUsers(filteredUsers));
  }, [searchName]);

  useEffect(() => {
    if (reloadUsers) {
      fetchUsers(setUsers).then(() => setReloadUsers(false));
    }
  }, [reloadUsers]);

  return (
    <div className="my-2">
      <Input
        placeholder="Keresés név alapján"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
        className="max-w-[40px] mb-2"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user: any) => (
          <div
            key={user.email}
            className="rounded-3xl bg-primary-50 p-6 text-foreground"
          >
            <div className="flex">
              <Image
                src={user.image}
                alt={user.username}
                width={72}
                height={72}
                className="rounded-full"
                loading="lazy"
              />
              {user.service_workers.length != 0 && <span>🔔</span>}
            </div>
            <h1 className="text-foreground">{user.username}</h1>
            <p>{user.email}</p>
            <p>
              {new Date(user.last_login).toLocaleString("hu-HU", {
                dateStyle: "long",
                timeStyle: "long",
              })}
            </p>
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
    </div>
  );
};

export default ManageUsers;
