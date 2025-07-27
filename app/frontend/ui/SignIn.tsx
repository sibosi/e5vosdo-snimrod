import React from 'react';
import {
  View,
  Button,
  Alert,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useAuth } from './AuthContext';

WebBrowser.maybeCompleteAuthSession();

export default function GoogleAuth() {
  const { userInfo, isLoading, setIsLoading, login, logout } = useAuth();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:
      '464331822983-p21vj910vg9heqbg9n8qr79vslp8o0ln.apps.googleusercontent.com',
    androidClientId:
      '464331822983-ec2iv4ik89lfv7l5nsv817flgnhdp0ks.apps.googleusercontent.com',
    iosClientId:
      '464331822983-uf37n8sn3d4vkhg43trfspkl0pej5qv9.apps.googleusercontent.com',
    scopes: ['openid', 'profile', 'email'],
    // responseType: AuthSession.ResponseType.IdToken, // Request ID token for secure auth
  });

  React.useEffect(() => {
    if (response?.type === 'success' && response.authentication) {
      const { accessToken, idToken } = response.authentication;
      setIsLoading(true);
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => res.json())
        .then((data: any) => {
          const userInfo = {
            name: data.name,
            email: data.email,
            picture: data.picture,
          };
          // Use the login function from AuthContext
          login(userInfo, idToken || '', accessToken || '');
        })
        .catch((err) => {
          Alert.alert('Hiba a userinfo lekéréskor', err.message);
        })
        .finally(() => setIsLoading(false));
    }
  }, [response, login, setIsLoading]);

  const handleLogout = async () => {
    if (response?.type !== 'success' || !response.authentication?.accessToken)
      return;

    try {
      await AuthSession.revokeAsync(
        {
          token: response.authentication.accessToken,
        },
        {
          revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
        }
      );
    } catch (err) {
      console.warn('Revoke hiba:', err);
    }

    logout(); // Use logout from AuthContext
    Alert.alert('Kijelentkezve');
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (userInfo)
    return (
      <View style={styles.container}>
        <Image source={{ uri: userInfo.picture }} style={styles.avatar} />
        <Text style={styles.name}>{userInfo.name}</Text>
        <Text style={styles.email}>{userInfo.email}</Text>
        <Button title="Logout" onPress={handleLogout} />
        {!(
          response?.type !== 'success' || !response.authentication?.accessToken
        ) && (
          <>
            <Text>Refresh token: {response?.authentication?.refreshToken}</Text>
            <Text>Access token: {response?.authentication?.accessToken}</Text>
          </>
        )}
      </View>
    );

  return (
    <View>
      <Button
        title="Sign in with Google"
        onPress={() => promptAsync()}
        disabled={!request}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 12,
  },
});
