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
        size="sm"
        className="rounded-badge fill-selfprimary"
      >
        Bejelentkezés
      </Button>
    </form>
  );
};

export default Login;
