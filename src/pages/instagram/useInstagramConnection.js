// useInstagramConnection.js
import { useState, useEffect, useCallback } from 'react';

export function useInstagramConnection(token) {
  const [status, setStatus] = useState(null); // null | { connected, username, ... }
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    if (!token) {
      setStatus(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/instagram/status', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        throw new Error(`Status fetch failed: ${res.status}`);
      }
      const json = await res.json();
      setStatus(json.data);
    } catch (e) {
      console.error(e);
      setError('Failed to load Instagram status.');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  const initiateConnect = useCallback(async () => {
    if (!token) {
      setError('Missing auth token.');
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/instagram/connect', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: '',
      });
      if (res.status === 401) {
        throw new Error('Unauthorized. Re-login required.');
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Connect failed: ${res.status}`);
      }
      const json = await res.json();
      const authUrl = json?.data?.authUrl;
      if (!authUrl) throw new Error('No authUrl received.');
      window.location.href = authUrl;
    } catch (e) {
      console.error(e);
      setError(e.message || 'Connection failed.');
    } finally {
      setConnecting(false);
    }
  }, [token]);

  return {
    status,
    loading,
    connecting,
    error,
    refresh: fetchStatus,
    connect: initiateConnect,
  };
}
