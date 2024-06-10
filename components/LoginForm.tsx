"use server";
import { Button } from "@nextui-org/react";
import { doSocialLogin } from "@/actions/route";

export const LoginForm = () => {
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
        Sign In with Google
      </Button>
    </form>
  );
};
