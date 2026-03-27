import { useState, useEffect, useRef, useCallback } from "react";

export const useFetch = (fetcher, deps = [], initial = null) => {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    try {
      const res = await fetcher();
      if (mountedRef.current) {
        setData(res);
      }
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetcher]);
  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, [...deps, fetchData]);
  return { data, loading, setData, refetch: fetchData };
};
