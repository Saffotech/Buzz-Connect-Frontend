// useInstagramConnection.js
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../utils/api';

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
      // Use apiClient to build URL correctly and avoid double /api/api issue
      const url = apiClient.buildUrl('/auth/instagram/connection-status');
      const res = await fetch(url, {
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
      // Extract Instagram status from response
      const instagramData = json.data?.instagram;
      if (instagramData) {
        setStatus({
          connected: instagramData.connected,
          username: instagramData.username,
          accountId: instagramData.accountId
        });
      } else {
        setStatus(null);
      }
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
      // Use apiClient to build URL correctly and avoid double /api/api issue
      const url = apiClient.buildUrl('/auth/instagram/connect');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionType: 'standard' // 'standard' or 'direct'
        }),
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
