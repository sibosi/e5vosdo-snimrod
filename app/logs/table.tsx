"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Spinner,
  Button,
  Input,
} from "@heroui/react";
import { useAsyncList } from "@react-stately/data";
import { Log } from "@/db/dbreq";

export default function LogTable({ logs }: { logs: Log[] }) {
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);

  const [search, setSearch] = React.useState("");

  let list = useAsyncList({
    async load({ signal, cursor }) {
      if (cursor) {
        setPage((prev) => prev + 1);
      }

      if (!cursor) {
        setIsLoading(false);
      }

      return {
        items: logs.filter((log) =>
          log.user.toLowerCase().includes(search.toLowerCase()),
        ),
      };
    },
  });

  const filteredItems = React.useMemo(() => {
    let filteredLogs = logs.filter((log) => {
      return log.user.toLowerCase().includes(search.toLowerCase());
    });
    return filteredLogs;
  }, [logs, search]);

  const hasMore = page < 9;

  return (
    <>
      <Input
        placeholder="Felhasználó keresése"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />
      <Table
        isHeaderSticky
        aria-label="Example table with client side sorting"
        bottomContent={
          hasMore && !isLoading ? (
            <div className="flex w-full justify-center">
              <Button
                isDisabled={list.isLoading}
                variant="flat"
                onPress={list.loadMore}
              >
                {list.isLoading && <Spinner color="white" size="sm" />}
                Load More
              </Button>
            </div>
          ) : null
        }
        classNames={{
          base: "max-h-[520px] overflow-scroll",
          table: "min-h-[420px]",
        }}
      >
        <TableHeader>
          <TableColumn key="id">Id</TableColumn>
          <TableColumn key="time">time</TableColumn>
          <TableColumn key="user">user</TableColumn>
          <TableColumn key="action">action</TableColumn>
          <TableColumn key="message">message</TableColumn>
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          items={filteredItems}
          loadingContent={<Spinner label="Loading..." />}
        >
          {(item: any) =>
            item.user.toLowerCase().includes(search.toLowerCase()) && (
              <TableRow key={item.user}>
                {(columnKey) => (
                  <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )
          }
        </TableBody>
      </Table>
    </>
  );
}
