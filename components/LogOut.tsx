import { doLogout } from "@/actions/route";
import { Button } from "@nextui-org/react";
import React from "react";

interface LogoutProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Logout = ({ className, size }: LogoutProps) => {
  return (
    <form action={doLogout} className="max-w-min">
      <Button
        type="submit"
        name="action"
        value="google"
        color="primary"
        size={size ? size : "sm"}
        className={"rounded-badge " + className}
      >
        Kijelentkezés
      </Button>
    </form>
  );
};

export default Logout;
