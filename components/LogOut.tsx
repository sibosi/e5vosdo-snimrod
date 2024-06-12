import { doLogout } from "@/actions/route";
import { Button } from "@nextui-org/react";
import React from "react";

const Logout = () => {
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
        Kijelentkezés
      </Button>
    </form>
  );
};

export default Logout;
