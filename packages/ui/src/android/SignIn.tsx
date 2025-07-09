import React from 'react';
import { Button } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri, ResponseType } from 'expo-auth-session';

export default function GoogleLogin() {
  const redirectUri = makeRedirectUri({
    useProxy: true,
    scheme: 'e5vosdo-snimrod', // az app.json-ban definiált scheme
  });

  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      clientId:
        '464331822983-p21vj910vg9heqbg9n8qr79vslp8o0ln.apps.googleusercontent.com', // → a Web OAuth kliensed
      androidClientId:
        '464331822983-ec2iv4ik89lfv7l5nsv817flgnhdp0ks.apps.googleusercontent.com',
      iosClientId: 'IOS_CLIENT_ID.apps.googleusercontent.com', // ha iOS-t is később csinálsz
      responseType: ResponseType.IdToken,
      redirectUri,
    },
    { useProxy: true }
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      console.log('auth:', response.authentication);
    }
  }, [response]);

  return (
    <Button
      title="Sign in with Google"
      disabled={!request}
      onPress={() => promptAsync()}
    />
  );
}
