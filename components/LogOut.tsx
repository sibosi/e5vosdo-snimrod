import { doLogout } from "@/app/actions/route";
import { Button } from "@nextui-org/react";
import React from "react";

const LogOut = () => {
  return (
    <form action={doLogout}>
      <Button
        type="submit"
        name="action"
        value="google"
        color="primary"
        size="sm"
        className="rounded-badge"
      >
        Log out
      </Button>
    </form>
  );
};

export default LogOut;
