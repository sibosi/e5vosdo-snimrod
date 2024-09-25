import { doSocialLogin } from "@/actions/route";
import { Button } from "@nextui-org/react";
import React from "react";
import resetCache from "./PWA/resetCache";
import { checkMessengerBrowser, RedirectUrlButton } from "@/app/skipMessenger";
import { siteConfig } from "@/config/site";

const Login = () => {
  return !checkMessengerBrowser() ? (
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
  ) : (
    <RedirectUrlButton
      url={siteConfig.links.home + "/support/messenger"}
      text="Bejelentkezés"
      props={{ className: "bg-selfprimary-300" }}
    />
  );
};

export default Login;
