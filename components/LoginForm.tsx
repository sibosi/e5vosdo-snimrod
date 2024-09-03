import { doSocialLogin } from "@/actions/route";
import { Button } from "@nextui-org/react";
import React from "react";
import resetCache from "./PWA/resetCache";

const Login = () => {
  return (
    <form action={doSocialLogin}>
      <Button
        type="submit"
        name="action"
        value="google"
        size="sm"
        onClick={resetCache}
        className="w-full rounded-badge bg-selfprimary-300"
      >
        Bejelentkezés
      </Button>
    </form>
  );
};

export default Login;
