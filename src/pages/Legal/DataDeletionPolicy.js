import React from "react";
import "./LegalPages.css";

const DataDeletionPolicy = () => {
  return (
    <div className="legal-container">
      <h1>Data Deletion Instructions</h1>
      <p>
        At <strong>MGA Buzz Connect</strong>, we respect your privacy and provide you
        full control over your data.
      </p>

      <p>
        If you wish to delete your data associated with our app, you have two options:
      </p>
      <ul>
        <li>
          <strong>1. In-App Deletion:</strong> You can delete your account and
          associated data directly from within the MGA Buzz Connect app under{" "}
          <em>Account Settings</em>.
        </li>
        <li>
          <strong>2. Email Request:</strong> You can request deletion of your
          data by contacting us at{" "}
          <a href="mailto:support@mgabrandbuzz.com">support@mgabrandbuzz.com</a>.
          We will process your request within 7 working days.
        </li>
      </ul>

      <p>
        Once deletion is completed, all personal information, connected social
        media data, and stored content will be permanently removed from our
        servers.
      </p>

      <p>
        For any further questions, please contact us at{" "}
        <a href="mailto:support@mgabrandbuzz.com">support@mgabrandbuzz.com</a>.
      </p>

      <p className="effective-date">Effective Date: July 14, 2025</p>
    </div>
  );
};

export default DataDeletionPolicy;
