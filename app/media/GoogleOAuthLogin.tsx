import React, { useState, useEffect } from "react";
import { loadGapiInsideDOM, loadAuth2 } from "gapi-script";

// import { UserCard } from "./UserCard";
// import "./GoogleLogin.css";

export const GoogleOAuthLogin = ({
  NEXT_PUBLIC_GOOGLE_CLIENT_ID,
}: {
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: string;
}) => {
  const [user, setUser] = useState<any>(null);
  const [gapi, setGapi] = useState<any>(null);

  useEffect(() => {
    const loadGapi = async () => {
      const newGapi = await loadGapiInsideDOM();
      setGapi(newGapi);
    };
    loadGapi();
  }, []);

  useEffect(() => {
    if (!gapi) return;

    const setAuth2 = async () => {
      const auth2 = await loadAuth2(gapi, NEXT_PUBLIC_GOOGLE_CLIENT_ID, "");
      if (auth2.isSignedIn.get()) {
        updateUser(auth2.currentUser.get());
      } else {
        attachSignin(document.getElementById("customBtn"), auth2);
      }
    };
    setAuth2();
  }, [gapi]);

  useEffect(() => {
    if (!gapi) return;

    if (!user) {
      const setAuth2 = async () => {
        const auth2 = await loadAuth2(gapi, NEXT_PUBLIC_GOOGLE_CLIENT_ID, "");
        attachSignin(document.getElementById("customBtn"), auth2);
      };
      setAuth2();
    }
  }, [user, gapi]);

  const updateUser = (currentUser: any) => {
    const name = currentUser.getBasicProfile().getName();
    const profileImg = currentUser.getBasicProfile().getImageUrl();
    setUser({
      name: name,
      profileImg: profileImg,
    });
  };

  const attachSignin = (element: any, auth2: any) => {
    auth2.attachClickHandler(
      element,
      {},
      (googleUser: any) => {
        updateUser(googleUser);
      },
      (error: any) => {
        console.log(JSON.stringify(error));
      },
    );
  };

  const signOut = () => {
    if (!gapi || !gapi.auth2) {
      console.error("GAPI or auth2 not loaded");
      return;
    }
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {
      setUser(null);
      console.log("User signed out.");
    });
  };

  if (user) {
    return (
      <div className="container">
        {/* <UserCard user={user} /> */}
        <div id="" className="btn logout" onClick={signOut}>
          Logout
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div id="customBtn" className="btn login">
        Login
      </div>
    </div>
  );
};
