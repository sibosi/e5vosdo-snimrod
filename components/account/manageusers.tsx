"use client";
import { User, UserType } from "@/db/dbreq";
import getUserClass from "@/public/getUserClass";
import {
  Button,
  ButtonGroup,
  Image,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import React, { useState, useEffect } from "react";

function sortUsers(users: any[]) {
  return users.sort((a: any, b: any) => {
    return new Date(b.last_login).getTime() - new Date(a.last_login).getTime();
  });
}

async function fetchUsers(setUsers: (data: any) => void) {
  const response = await fetch("/api/getUsers");
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
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  const [newPermission, setNewPermission] = useState("");
  const [newTicket, setNewTicket] = useState("");

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

  async function addTicket(email: any, ticket: string) {
    const response = await fetch(`/api/addTicket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, ticket: ticket }),
    });
    setReloadUsers(true);
  }

  async function deleteTicket(email: any, ticket: string) {
    const response = await fetch(`/api/deleteTicket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, ticket: ticket }),
    });
    setReloadUsers(true);
  }

  useEffect(() => {
    if (searchName.length < 2) {
      setUsers(sortUsers(initialUsers));
      return;
    }

    const filteredUsers = initialUsers.filter((user: any) =>
      user.username.toLowerCase().includes(searchName.toLowerCase()),
    );
    setUsers(sortUsers(filteredUsers));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchName]);

  async function reload() {
    if (reloadUsers) await fetchUsers(setUsers);

    setSelectedUser(
      users.find((user) => selectedUser?.email == user.email) ?? null,
    );
    setReloadUsers(false);
  }

  useEffect(() => {
    reload();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadUsers]);

  return (
    <div className="my-2 text-foreground">
      <Input
        placeholder="Keresés név alapján"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
        className="mb-2 max-w-[200px]"
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.slice(0, 12).map((user: UserType) => (
          <div key={user.email} className="rounded-3xl bg-primary-50 p-6">
            <div className="flex">
              <div className="flex w-full">
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
              <Button
                size="sm"
                color="default"
                onClick={() => setSelectedUser(user)}
              >
                Részletek
              </Button>
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
                ),
              )}
            </div>
          </div>
        ))}
      </div>
      {users.length == 0 ? (
        <div className="text-foreground">Nincs találat</div>
      ) : users.length > 12 ? (
        <div className="my-2 rounded-3xl bg-primary-50 p-6 text-center">
          Túl sok találat ({users.length})
        </div>
      ) : (
        <></>
      )}

      <Modal
        isOpen={selectedUser != null}
        onClose={() => setSelectedUser(null)}
        className="rounded-3xl"
        size="2xl"
        placement="center"
      >
        <ModalContent>
          <ModalHeader>{selectedUser?.username}</ModalHeader>
          <div className="gap-6 px-8 pb-8 md:flex">
            <div className="mb-4">
              <div>
                <Image
                  src={selectedUser?.image}
                  alt={selectedUser?.username}
                  width={72}
                  height={72}
                  className="rounded-full"
                />
              </div>

              <table>
                <tr>
                  <td>Név</td>
                  <td>{selectedUser?.name}</td>
                </tr>
                <tr>
                  <td>Felhasználónév</td>
                  <td>{selectedUser?.username}</td>
                </tr>
                <tr>
                  <td>Email</td>
                  <td>{selectedUser?.email}</td>
                </tr>
                <tr>
                  <td>Nickname</td>
                  <td>{selectedUser?.nickname}</td>
                </tr>
                <tr>
                  <td>Osztály</td>
                  <td>{selectedUser && getUserClass(selectedUser)}</td>
                </tr>
                <tr>
                  <td>Utolsó belépés</td>
                  <td>
                    {new Date(selectedUser?.last_login ?? "").toLocaleString(
                      "hu-HU",
                      {
                        dateStyle: "long",
                        timeStyle: "long",
                      },
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Permissions</td>
                  <td>{(selectedUser?.permissions ?? []).join(" ")}</td>
                </tr>
                <tr>
                  <td>EJG kód</td>
                  <td>{selectedUser?.EJG_code}</td>
                </tr>
                <tr>
                  <td>Étkezési menü</td>
                  <td>{selectedUser?.food_menu}</td>
                </tr>
                <tr>
                  <td>Érkezés éve</td>
                  <td>{selectedUser?.coming_year}</td>
                </tr>
                <tr>
                  <td>Osztályjelleg</td>
                  <td>{selectedUser?.class_character}</td>
                </tr>
                <tr>
                  <td>Hely a névsorban</td>
                  <td>{selectedUser?.order_number}</td>
                </tr>
                <tr>
                  <td>Jegyek</td>
                  <td>{selectedUser?.tickets.join(", ")}</td>
                </tr>
                <tr>
                  <td>Rejtett órák</td>
                  <td>{selectedUser?.hidden_lessons.length} db</td>
                </tr>
                <tr>
                  <td>Alapcsoport</td>
                  <td>{selectedUser?.default_group}</td>
                </tr>
                <tr>
                  <td>Service workers</td>
                  <td>{selectedUser?.service_workers.length} db</td>
                </tr>
              </table>
            </div>
            <div>
              <div className="rounded-3xl bg-primary-50 p-6">
                <h3>Hozzáférés hozzáadása</h3>
                <ButtonGroup>
                  <Input
                    value={newPermission}
                    onChange={(e) => setNewPermission(e.target.value)}
                    placeholder="Permission"
                  />
                  <Button
                    onClick={() => {
                      addUserPermission(selectedUser?.email, newPermission);
                      setNewPermission("");
                    }}
                    color="success"
                  >
                    +
                  </Button>
                </ButtonGroup>
                <div>
                  {selectedUser?.permissions.map((permission) => (
                    <Button
                      key={permission}
                      color="success"
                      className="m-1"
                      size="sm"
                    >
                      {permission}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-3xl bg-primary-50 p-6">
                <h3>Tickets</h3>
                <ButtonGroup>
                  <Input
                    value={newTicket}
                    onChange={(e) => setNewTicket(e.target.value)}
                    placeholder="Ticket"
                  />
                  <Button
                    onClick={() => {
                      addTicket(selectedUser?.email, newTicket);
                      setNewTicket("");
                    }}
                    color="success"
                  >
                    +
                  </Button>
                </ButtonGroup>
                <div>
                  {selectedUser?.tickets.map((ticket) => (
                    <Button
                      key={ticket}
                      color="success"
                      className="m-1"
                      size="sm"
                      onClick={() => deleteTicket(selectedUser?.email, ticket)}
                    >
                      {ticket}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                onClick={() => setSelectedUser(null)}
                color="primary"
                className="ml-auto mt-2 flex"
              >
                Rendben
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ManageUsers;
