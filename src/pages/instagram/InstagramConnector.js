// InstagramConnector.jsx
import React from 'react';
import { useInstagramConnection } from './useInstagramConnection';
import { ConnectedAccountItem } from './ConnectedAccountItem';

export default function InstagramConnector({ token }) {
  const {
    status,
    loading,
    connecting,
    error,
    connect,
    refresh,
  } = useInstagramConnection(token);

  return (
    <div className="instagram-connector">
      <h4>Instagram</h4>

      {loading && <p>Loading status...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {status ? (
        <ConnectedAccountItem
          platform="instagram"
          username={status.username}
          connected={status.connected}
          profilePicture={status.profilePicture}
        />
      ) : (
        <div className="not-connected">
          <p>Instagram not connected.</p>
          <button
            className="btn-primary"
            onClick={connect}
            disabled={connecting}
          >
            {connecting ? 'Connecting…' : 'Connect Instagram'}
          </button>
        </div>
      )}

      <div className="mt-2">
        <button
          className="text-sm btn-link"
          onClick={refresh}
          disabled={loading}
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
}
