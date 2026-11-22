import { useEffect, useRef, useState } from 'react';

// Wraps a service call with loading/error/data state. `deps` re-runs the
// call, mirroring how a real API call would react to filter changes.
export function useAsync(asyncFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  useEffect(() => {
    let active = true;
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);

    asyncFn()
      .then((result) => {
        if (active && currentRequest === requestId.current) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active && currentRequest === requestId.current) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
