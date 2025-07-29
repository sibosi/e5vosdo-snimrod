import { View, Text, Button } from 'react-native';
import React from 'react';
import { useAccountId } from '../AuthContext';

export default function DisplayProfile() {
  const { idToken, isLoggedIn, refreshTrigger } = useAccountId();
  const [profile, setProfile] = React.useState<any>();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchProfile = React.useCallback(async () => {
    console.log('[Debug] fetchProfile start', {
      isLoggedIn,
      tokenLength: idToken?.length,
      tokenSnippet: idToken?.slice(0, 20),
    });
    if (!isLoggedIn || !idToken) {
      console.log('[Debug] Not logged in or missing idToken');
      setProfile(null);
      setError('Please log in to view profile data');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = 'https://e5vosdo.hu/api/getPreviewEvents';
      console.log('[Debug] Sending fetch request', { url });
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // include cookies for NextAuth session
        headers: {
          Authorization: `Bearer ${idToken}`,
          module: 'event',
          Accept: 'application/json',
        },
      });

      console.log('[Debug] Response metadata', {
        url: response.url,
        redirected: response.redirected,
        status: response.status,
        ok: response.ok,
        type: response.type,
        bodyUsed: response.bodyUsed,
        headers: [...response.headers.entries()],
      });

      const text = await response.text();
      console.log('[Debug] Raw response text:', JSON.stringify(text));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (text.trim() === 'null') {
        console.warn('[Debug] Received literal null from API');
        setError('No profile data returned');
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
        console.log('[Debug] Parsed JSON data:', data);
      } catch (jsonError) {
        console.error('[Debug] JSON.parse error:', jsonError, 'text:', text);
        setError('Invalid JSON response');
        return;
      }

      setProfile(data);
    } catch (fetchError: any) {
      console.error('[Debug] fetch error:', fetchError);
      setError(fetchError.message);
    } finally {
      console.log('[Debug] fetchProfile end');
      setLoading(false);
    }
  }, [isLoggedIn, idToken]);

  React.useEffect(() => {
    console.log('[Debug] useEffect trigger', { refreshTrigger });
    fetchProfile();
  }, [fetchProfile, refreshTrigger]);

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
        DisplayProfile
      </Text>
      <Button
        title="Refresh Profile"
        onPress={fetchProfile}
        disabled={loading}
      />
      {loading && <Text>Loading...</Text>}
      {error && <Text style={{ color: 'red' }}>Error: {error}</Text>}
      <Text>Profile type: {typeof profile}</Text>
      <Text>Profile JSON: {JSON.stringify(profile)}</Text>
      {profile && (
        <View style={{ marginTop: 16 }}>
          <Text>Name: {profile.name}</Text>
          <Text>Email: {profile.email}</Text>
        </View>
      )}
    </View>
  );
}
