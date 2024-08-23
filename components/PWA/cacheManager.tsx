"use client";
import React, { useEffect, useState } from "react";

// A cache-ekhez való hozzáférés és kezelés funkciói
const CacheManager = () => {
  const [cacheList, setCacheList] = useState<string[]>([]);
  const [cacheContent, setCacheContent] = useState([]);
  const [selectedCache, setSelectedCache] = useState(null);

  // Cache-ek betöltése
  useEffect(() => {
    const loadCaches = async () => {
      const cacheNames = await caches.keys();
      setCacheList(cacheNames);
    };
    loadCaches();
  }, []);

  // Cache tartalmának betöltése
  const loadCacheContent = async (cacheName) => {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    setSelectedCache(cacheName);
    setCacheContent(requests);
  };

  // Cache törlése
  const deleteCache = async (cacheName) => {
    await caches.delete(cacheName);
    setCacheList(cacheList.filter((name) => name !== cacheName));
    setCacheContent([]);
    setSelectedCache(null);
  };

  // Cache elem eltávolítása
  const deleteCacheItem = async (cacheName, request) => {
    const cache = await caches.open(cacheName);
    await cache.delete(request);
    loadCacheContent(cacheName); // Frissítés a cache tartalom betöltésével
  };

  return (
    <div>
      <h2>Cache Manager</h2>
      <div>
        <h3>Available Caches</h3>
        <ul>
          {cacheList.map((cacheName) => (
            <li key={cacheName}>
              {cacheName}{" "}
              <button onClick={() => loadCacheContent(cacheName)}>View</button>{" "}
              <button onClick={() => deleteCache(cacheName)}>
                Delete Cache
              </button>
            </li>
          ))}
        </ul>
      </div>
      {selectedCache && (
        <div>
          <h3>Cache Content for: {selectedCache}</h3>
          <ul>
            {cacheContent.map((request) => (
              <li key={request.url}>
                {request.url}{" "}
                <button onClick={() => deleteCacheItem(selectedCache, request)}>
                  Delete Item
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CacheManager;
