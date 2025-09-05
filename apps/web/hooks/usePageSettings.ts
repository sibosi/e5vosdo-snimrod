"use client";
import useSWR from "swr";

export interface PageSettingsType {
  id: number;
  name: string;
  headspace: 0 | 1;
  livescore: number;
}

export interface UsePageSettingsReturn {
  pageSettings: PageSettingsType | null;
  isLoading: boolean;
  isError: Error | null;
}

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      module: "pageSettings",
    },
  });
  return response.json();
};

export const usePageSettings = (all = false): UsePageSettingsReturn => {
  const { data, error } = useSWR<PageSettingsType>(
    "/api/getPageSettings",
    fetcher,
  );

  if (error) return { pageSettings: null, isLoading: false, isError: error };
  if (!data) return { pageSettings: null, isLoading: true, isError: null };
  const pageSettings = data;
  return { pageSettings, isLoading: false, isError: null };
};
