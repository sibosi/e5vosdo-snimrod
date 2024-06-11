import { doSocialLogin } from "@/actions/route";
import { Button } from "@nextui-org/react";
import React from "react";

const Login = () => {
  return (
    <form action={doSocialLogin}>
      <Button
        type="submit"
        name="action"
        value="google"
        color="primary"
        size="sm"
        className="rounded-badge"
      >
        Bejelentkezés
      </Button>
    </form>
  );
};

export default Login;
