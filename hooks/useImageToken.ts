import { useState, useEffect } from "react";

export function useImageToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch("/api/image-token");
        if (response.ok) {
          const data = await response.json();
          setToken(data.token);
        }
      } catch (error) {
        console.error("Failed to fetch image token:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  const getImageUrl = (imageId: string) => {
    return token
      ? `/api/drive/image/${imageId}?token=${token}`
      : `/api/drive/image/${imageId}`;
  };

  return { token, loading, getImageUrl };
}
