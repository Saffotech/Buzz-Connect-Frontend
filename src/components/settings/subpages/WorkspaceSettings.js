import React, { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import SettingsCard from '../SettingsCard';

const WorkspaceSettings = ({ onNotify }) => {
  const [workspaceName, setWorkspaceName] = useState('My Workspace');
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState('');

  const handleSave = () => {
    if (tempName.trim()) {
      setWorkspaceName(tempName.trim());
      setIsEditing(false);
      onNotify('success', 'Workspace name updated successfully');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempName('');
  };

  const startEditing = () => {
    setTempName(workspaceName);
    setIsEditing(true);
  };

  return (
    <div className="settings-subpage">
      <div className="settings-content">
        <div className="settings-header">
          <h2>Workspace Settings</h2>
          <p>Manage your workspace name and general settings</p>
        </div>

        <SettingsCard
          title="Workspace Name"
          description="This is the name of your workspace that appears throughout the app"
        >
          {isEditing ? (
            <div className="edit-workspace">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Enter workspace name"
                className="workspace-input"
                autoFocus
              />
              <div className="edit-actions">
                <button onClick={handleSave} className="btn-primary">
                  <Save size={16} />
                  Save
                </button>
                <button onClick={handleCancel} className="btn-secondary">
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="workspace-display">
              <span className="workspace-name">{workspaceName}</span>
              <button onClick={startEditing} className="btn-secondary">
                <Edit2 size={16} />
                Edit
              </button>
            </div>
          )}
        </SettingsCard>
      </div>
    </div>
  );
};

export default WorkspaceSettings;