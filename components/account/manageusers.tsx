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
import React, { useState } from "react";

type UserSort = "recent" | "name" | "permissions";
type VerificationFilter = "all" | "verified" | "unverified";

function sortUsers(users: UserType[], sort: UserSort = "recent") {
  return [...users].sort((a, b) => {
    if (sort === "name") {
      return getUserName(a).localeCompare(getUserName(b), "hu");
    }
    if (sort === "permissions") {
      return b.permissions.length - a.permissions.length;
    }
    return new Date(b.last_login).getTime() - new Date(a.last_login).getTime();
  });
}

async function fetchUsers(setUsers: (data: UserType[]) => void) {
  const response = await fetch("/api/getUsers");
  const data = await response.json();
  if (!response.ok || !Array.isArray(data)) {
    throw new Error("A felhasználók frissítése sikertelen.");
  }
  setUsers(data);
}

function displayDate(dateInStr: string) {
  const date = new Date(dateInStr);
  const diff = Date.now() - date.getTime();

  // if invvalid date, return empty string
  if (Number.isNaN(date.getTime())) return "";

  if (diff < 1000 * 60) {
    return `${Math.floor(diff / 1000)} mp`;
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

function getUserName(user: UserType) {
  return user.full_name || user.name;
}

const ManageUsers = ({
  initialUsers,
  availablePermissions,
}: {
  initialUsers: UserType[];
  availablePermissions: string[];
}) => {
  const [users, setUsers] = useState<UserType[]>(initialUsers);

  const [searchName, setSearchName] = useState("");
  const [permissionFilter, setPermissionFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] =
    useState<VerificationFilter>("all");
  const [sort, setSort] = useState<UserSort>("recent");
  const [visibleCount, setVisibleCount] = useState(24);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  const [newPermission, setNewPermission] = useState("");
  const [newTicket, setNewTicket] = useState("");

  const [selectedUserLogs, setSelectedUserLogs] = useState<Log[]>([]);
  const [actionError, setActionError] = useState("");
  const allPermissions = Array.from(
    new Set([
      ...availablePermissions,
      ...users.flatMap((user) => user.permissions ?? []),
    ]),
  ).sort((a, b) => a.localeCompare(b, "hu"));

  async function addUserPermission(email: string, permission: string) {
    const trimmedPermission = permission.trim();
    if (!trimmedPermission) return;
    try {
      const response = await fetch(`/api/addUserPermission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, permission: trimmedPermission }),
      });
      if (!response.ok) throw new Error("A permission hozzáadása sikertelen.");
      setActionError("");
      await reload();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Ismeretlen hiba történt.",
      );
    }
  }

  async function removeUserPermission(email: string, permission: string) {
    try {
      const response = await fetch(`/api/removeUserPermissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, permission }),
      });
      if (!response.ok)
        throw new Error("A permission eltávolítása sikertelen.");
      setActionError("");
      await reload();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Ismeretlen hiba történt.",
      );
    }
  }

  async function addTicket(email: any, ticket: string) {
    fetch(`/api/addTicket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, ticket: ticket }),
    }).then(() => reload());
  }

  async function deleteTicket(email: any, ticket: string) {
    fetch(`/api/deleteTicket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, ticket: ticket }),
    }).then(() => reload());
  }

  const filteredUsers = sortUsers(
    users.filter((user) => {
      const query = searchName.trim().toLowerCase();
      const matchesSearch =
        !query ||
        getUserName(user).toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query);
      const matchesPermission =
        permissionFilter === "all" ||
        user.permissions.includes(permissionFilter);
      const matchesVerification =
        verificationFilter === "all" ||
        (verificationFilter === "verified" && user.is_verified) ||
        (verificationFilter === "unverified" && !user.is_verified);
      return matchesSearch && matchesPermission && matchesVerification;
    }),
    sort,
  );

  async function reload() {
    try {
      await fetchUsers((freshUsers) => {
        setUsers(freshUsers);
        setSelectedUser(
          freshUsers.find((user) => selectedUser?.email === user.email) ?? null,
        );
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="my-2 text-foreground">
      {actionError && (
        <div
          role="alert"
          className="mb-3 rounded-xl bg-danger-50 p-3 text-sm text-danger"
        >
          {actionError}
        </div>
      )}
      <div className="mb-4 rounded-3xl bg-selfprimary-50 p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
          <Input
            aria-label="Felhasználók keresése"
            placeholder="Keresés név, email vagy felhasználónév alapján"
            value={searchName}
            onChange={(e) => {
              setSearchName(e.target.value);
              setVisibleCount(24);
            }}
          />
          <select
            aria-label="Permission szűrése"
            value={permissionFilter}
            onChange={(e) => {
              setPermissionFilter(e.target.value);
              setVisibleCount(24);
            }}
            className="min-h-10 rounded-xl border border-default-200 bg-background px-3 text-sm"
          >
            <option value="all">Minden permission</option>
            {allPermissions.map((permission) => (
              <option key={permission} value={permission}>
                {permission}
              </option>
            ))}
          </select>
          <select
            aria-label="Ellenőrzöttség szűrése"
            value={verificationFilter}
            onChange={(e) => {
              setVerificationFilter(e.target.value as VerificationFilter);
              setVisibleCount(24);
            }}
            className="min-h-10 rounded-xl border border-default-200 bg-background px-3 text-sm"
          >
            <option value="all">Minden státusz</option>
            <option value="verified">Ellenőrzött</option>
            <option value="unverified">Nem ellenőrzött</option>
          </select>
          <select
            aria-label="Felhasználók rendezése"
            value={sort}
            onChange={(e) => setSort(e.target.value as UserSort)}
            className="min-h-10 rounded-xl border border-default-200 bg-background px-3 text-sm"
          >
            <option value="recent">Legutóbbi belépés</option>
            <option value="name">Név szerint</option>
            <option value="permissions">Permissionök száma</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm opacity-75">
          <span>{filteredUsers.length} felhasználó a szűrés alapján</span>
          {(searchName ||
            permissionFilter !== "all" ||
            verificationFilter !== "all") && (
            <Button
              size="sm"
              variant="light"
              onPress={() => {
                setSearchName("");
                setPermissionFilter("all");
                setVerificationFilter("all");
                setVisibleCount(24);
              }}
            >
              Szűrők törlése
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.slice(0, visibleCount).map((user: UserType) => (
          <button
            key={user.email}
            onClick={() => {
              setSelectedUser(user);
              setSelectedUserLogs([]);
            }}
            className="overflow-hidden rounded-3xl bg-selfprimary-50 px-2 py-6 text-left"
          >
            <div className="flex justify-between">
              <Image
                src={user.image}
                alt={getUserName(user)}
                width={72}
                height={72}
                className="rounded-full"
                loading="lazy"
              />
              <div className="flex max-w-[55%] flex-wrap justify-end gap-1">
                {user.permissions.slice(0, 3).map((permission) => (
                  <Chip key={permission} size="sm" color="secondary">
                    {permission}
                  </Chip>
                ))}
                {user.permissions.length > 3 && (
                  <Chip size="sm" variant="flat">
                    +{user.permissions.length - 3}
                  </Chip>
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold text-foreground">
              {getUserName(user)}
            </h3>
            <p className="mb-2 text-xs">{user.email}</p>
            <p suppressHydrationWarning>
              <span>{getUserClass(user) || "???"}</span>
              {" | "}
              <span>{user.is_verified ? "✅" : "❌"}</span>{" "}
              {displayDate(user.last_login)}
            </p>
          </button>
        ))}
      </div>
      {filteredUsers.length === 0 && (
        <div className="text-foreground">Nincs találat</div>
      )}
      {filteredUsers.length > visibleCount && (
        <Button
          className="my-4 w-full"
          variant="flat"
          onPress={() => setVisibleCount((count) => count + 24)}
        >
          További felhasználók betöltése ({filteredUsers.length - visibleCount})
        </Button>
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
                    <h3 className="mb-1 text-lg font-semibold">
                      Hozzáférés kezelése
                    </h3>
                    <p className="mb-4 text-sm opacity-75">
                      A zöld gombok aktív permissionök. Kattints egy gombra a
                      hozzáadásához vagy eltávolításához.
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {allPermissions.map((permission) =>
                        selectedUser.permissions.includes(permission) ? (
                          <Button
                            key={permission + " enable"}
                            size="md"
                            color="success"
                            className="h-auto min-h-10 justify-start whitespace-normal break-words px-3 py-2 text-left"
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
                            size="md"
                            color="default"
                            variant="flat"
                            className="h-auto min-h-10 justify-start whitespace-normal break-words px-3 py-2 text-left"
                            onPress={() =>
                              addUserPermission(selectedUser.email, permission)
                            }
                          >
                            {permission}
                          </Button>
                        ),
                      )}
                    </div>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Input
                        value={newPermission}
                        onChange={(e) => setNewPermission(e.target.value)}
                        placeholder="Új permission neve"
                        className="min-w-0 flex-1"
                      />
                      <Button
                        onPress={() => {
                          addUserPermission(selectedUser.email, newPermission);
                          setNewPermission("");
                        }}
                        color="success"
                        className="shrink-0"
                      >
                        Hozzáadás
                      </Button>
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
