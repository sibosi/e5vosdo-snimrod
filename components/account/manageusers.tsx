"use client";
import { Log, UserType } from "@/db/dbreq";
import getUserClass from "@/public/getUserClass";
import {
  Button,
  ButtonGroup,
  Chip,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
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

function displayDate(dateInStr: string) {
  const date = new Date(dateInStr);
  const diff = new Date().getTime() - date.getTime();

  // if invvalid date, return empty string
  if (isNaN(date.getTime())) {
    return "";
  }

  if (diff < 1000 * 60) {
    return `${Math.floor(diff / 1000)} másodperce`;
  } else if (diff < 1000 * 60 * 60) {
    return `${Math.floor(diff / (1000 * 60))} perce`;
  } else if (diff < 1000 * 60 * 60 * 24) {
    return `${Math.floor(diff / (1000 * 60 * 60))} óra ${Math.floor(
      (diff % (1000 * 60 * 60)) / (1000 * 60),
    )} perce`;
  } else if (diff < 1000 * 60 * 60 * 24 * 7) {
    return `${Math.floor(diff / (1000 * 60 * 60 * 24))} napja`;
  } else {
    return new Intl.DateTimeFormat("hu-HU", {
      dateStyle: "full",
      timeStyle: "long",
    }).format(date);
  }
}

const ManageUsers = ({ initialUsers }: { initialUsers: any }) => {
  const [users, setUsers] = useState(sortUsers(initialUsers));
  const [reloadUsers, setReloadUsers] = useState(false);

  const [searchName, setSearchName] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  const [newPermission, setNewPermission] = useState("");
  const [newTicket, setNewTicket] = useState("");

  const [selectedUserLogs, setSelectedUserLogs] = useState<Log[]>([]);

  async function addUserPermission(email: any, permission: string) {
    fetch(`/api/addUserPermission`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, permission: permission }),
    }).then(() => setReloadUsers(true));
  }

  async function removeUserPermission(email: any, permission: string) {
    fetch(`/api/removeUserPermissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, permission: permission }),
    }).then(() => setReloadUsers(true));
  }

  async function addTicket(email: any, ticket: string) {
    fetch(`/api/addTicket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, ticket: ticket }),
    }).then(() => setReloadUsers(true));
  }

  async function deleteTicket(email: any, ticket: string) {
    fetch(`/api/deleteTicket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, ticket: ticket }),
    }).then(() => setReloadUsers(true));
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
  }, [reloadUsers]);

  return (
    <div className="my-2 text-foreground">
      <Input
        placeholder="Keresés név alapján"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
        className="mb-2 max-w-[200px]"
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {users.slice(0, 24).map((user: UserType) => (
          <button
            key={user.email}
            onClick={() => {
              setSelectedUser(user);
              setSelectedUserLogs([]);
            }}
            className="overflow-hidden rounded-3xl bg-selfprimary-50 p-6 text-left"
          >
            <div className="flex justify-between">
              <Image
                src={user.image}
                alt={user.username}
                width={72}
                height={72}
                className="rounded-full"
                loading="lazy"
              />
              <div className="flex flex-col gap-2">
                {["admin", "tester"].map(
                  (permission) =>
                    user.permissions.includes(permission) && (
                      <Chip
                        key={permission + " enable"}
                        size="sm"
                        color="secondary"
                      >
                        {permission}
                      </Chip>
                    ),
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold text-foreground">
              {user.username}
            </h3>
            <p className="mb-2 text-xs">{user.email}</p>
            <p suppressHydrationWarning>{displayDate(user.last_login)}</p>
          </button>
        ))}
      </div>
      {users.length == 0 && (
        <div className="text-foreground">Nincs találat</div>
      )}
      {users.length > 12 && (
        <div className="my-2 rounded-3xl bg-selfprimary-50 p-6 text-center">
          Túl sok találat ({users.length})
        </div>
      )}

      <Modal
        isOpen={selectedUser != null}
        onClose={() => setSelectedUser(null)}
        size="full"
        scrollBehavior="inside"
      >
        <ModalContent>
          {selectedUser && (
            <>
              <ModalHeader>{selectedUser.username}</ModalHeader>
              <ModalBody className="gap-6 px-8 pb-8 text-left md:flex">
                <div className="mb-4">
                  <div>
                    <Image
                      src={selectedUser.image}
                      alt={selectedUser.username}
                      width={72}
                      height={72}
                      className="rounded-full"
                    />
                  </div>

                  <table>
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">Név</th>
                        <td>{selectedUser.name}</td>
                      </tr>
                      <tr>
                        <th scope="row">Teljes név</th>
                        <td>{selectedUser.full_name}</td>
                      </tr>
                      <tr>
                        <th scope="row">Email</th>
                        <td>{selectedUser.email}</td>
                      </tr>
                      <tr>
                        <th scope="row">Nickname</th>
                        <td>{selectedUser.nickname}</td>
                      </tr>
                      <tr>
                        <th scope="row">Osztály</th>
                        <td>{selectedUser && getUserClass(selectedUser)}</td>
                      </tr>
                      <tr>
                        <th scope="row">Utolsó belépés</th>
                        <td>
                          {new Date(
                            selectedUser.last_login ?? "",
                          ).toLocaleString("hu-HU", {
                            dateStyle: "long",
                            timeStyle: "long",
                          })}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Permissions</th>
                        <td>{(selectedUser.permissions ?? []).join(" ")}</td>
                      </tr>
                      <tr>
                        <th scope="row">EJG kód</th>
                        <td>{selectedUser.EJG_code}</td>
                      </tr>
                      <tr>
                        <th scope="row">OM5</th>
                        <td>{selectedUser.OM5}</td>
                      </tr>
                      <tr>
                        <th scope="row">Étkezési menü</th>
                        <td>{selectedUser.food_menu}</td>
                      </tr>
                      <tr>
                        <th scope="row">Érkezés éve</th>
                        <td>{selectedUser.coming_year}</td>
                      </tr>
                      <tr>
                        <th scope="row">Osztályjelleg</th>
                        <td>{selectedUser.class_character}</td>
                      </tr>
                      <tr>
                        <th scope="row">Hely a névsorban</th>
                        <td>{selectedUser.order_number}</td>
                      </tr>
                      <tr>
                        <th scope="row">Jegyek</th>
                        <td>{selectedUser.tickets.join(", ")}</td>
                      </tr>
                      <tr>
                        <th scope="row">Ellenőrzött-e</th>
                        <td>
                          {selectedUser.is_verified ? "Igen ✅" : "Nem ❌"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <div className="mb-3 rounded-3xl bg-selfprimary-50 p-6">
                    <h3>Get users logs</h3>

                    <Button
                      onPress={() => {
                        fetch("api/getUserLogs", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ email: selectedUser.email }),
                        })
                          .then((res) => res.json())
                          .then((data) => setSelectedUserLogs(data));
                      }}
                      color="success"
                    >
                      Get logs
                    </Button>

                    <div className="max-h-40 max-w-min overflow-auto">
                      {selectedUserLogs.map((log) => (
                        <div key={log.id} className="border-b-1 py-1">
                          <span>{log.time}</span>
                          <br />
                          <span>{log.action}</span>
                          <br />
                          <span>{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3 rounded-3xl bg-selfprimary-50 p-6">
                    <h3>Hozzáférés hozzáadása</h3>
                    <p>
                      Permissions: {(selectedUser.permissions ?? []).join(" ")}
                    </p>
                    <div className="flex gap-2">
                      {["student", "admin", "tester"].map((permission) =>
                        selectedUser.permissions.includes(permission) ? (
                          <Button
                            key={permission + " enable"}
                            size="sm"
                            color="success"
                            onPress={() =>
                              removeUserPermission(
                                selectedUser.email,
                                permission,
                              )
                            }
                          >
                            {permission}
                          </Button>
                        ) : (
                          <Button
                            key={permission + " disable"}
                            size="sm"
                            color="default"
                            onPress={() =>
                              addUserPermission(selectedUser.email, permission)
                            }
                          >
                            {permission}
                          </Button>
                        ),
                      )}
                    </div>
                    <ButtonGroup>
                      <Input
                        value={newPermission}
                        onChange={(e) => setNewPermission(e.target.value)}
                        placeholder="Permission"
                      />
                      <Button
                        onPress={() => {
                          addUserPermission(selectedUser.email, newPermission);
                          setNewPermission("");
                        }}
                        color="success"
                      >
                        +
                      </Button>
                    </ButtonGroup>
                    <div>
                      {selectedUser.permissions.map((permission) => (
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

                  <div className="mb-3 rounded-3xl bg-selfprimary-50 p-6">
                    <h3>Tickets</h3>
                    <ButtonGroup>
                      <Input
                        value={newTicket}
                        onChange={(e) => setNewTicket(e.target.value)}
                        placeholder="Ticket"
                      />
                      <Button
                        onPress={() => {
                          addTicket(selectedUser.email, newTicket);
                          setNewTicket("");
                        }}
                        color="success"
                      >
                        +
                      </Button>
                    </ButtonGroup>
                    <div>
                      {selectedUser.tickets.map((ticket) => (
                        <Button
                          key={ticket}
                          color="success"
                          className="m-1"
                          size="sm"
                          onPress={() =>
                            deleteTicket(selectedUser.email, ticket)
                          }
                        >
                          {ticket}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  onPress={() => setSelectedUser(null)}
                  className="ml-auto mt-2 flex fill-selfprimary"
                >
                  Rendben
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ManageUsers;
