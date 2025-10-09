import React from "react";
import { useNavigate } from "react-router-dom";
import "./LegalPages.css";

const DataDeletionPolicy = () => {
  const navigate = useNavigate(); // initialize navigation

  const goToDashboard = () => {
    navigate("/dashboard"); // replace with your dashboard route
  };

  return (
    <div className="legal-container">
      <h1>Data Deletion Policy</h1>
      <p>
        <strong>MGA Buzz Connect</strong> is committed to protecting user privacy and ensuring responsible handling of data.
        This Data Deletion Policy explains how users can request deletion of their data and how we process such requests.
      </p>

      <h2>1. Scope</h2>
      <p>This policy applies to all personal and business data collected and processed by MGA Buzz Connect, including:</p>
      <ul>
        <li>Account information (name, email, billing info).</li>
        <li>Social media credentials (API tokens, account IDs).</li>
        <li>Content uploaded for scheduling (text, images, videos, captions).</li>
        <li>Analytics and reporting data retrieved from social media APIs.</li>
        <li>System logs and usage activity.</li>
      </ul>

      <h2>2. User-Initiated Deletion</h2>
      <p>Users may request deletion of their data in two ways:</p>
      <ul>
        <li>
          <strong>Via Account Dashboard:</strong> Users can delete their account under
          <em> Settings &gt; Account &gt; Delete Account</em>.
        </li>
        <li>
          <strong>Via Email Request:</strong> By contacting us at{" "}
          <a href="mailto:contact@mgabuzzconnect.com">contact@mgabuzzconnect.com</a>{" "}
          from the registered email address.
        </li>
      </ul>
      <p>Upon a valid request, we will:</p>
      <ul>
        <li>Immediately revoke all active API tokens and disconnect linked social media accounts.</li>
        <li>Schedule deletion of user content, credentials, and analytics data.</li>
      </ul>

      <h2>3. Retention Periods</h2>
      <ul>
        <li><strong>Immediate Deletion:</strong> Social media tokens and authentication credentials are revoked instantly.</li>
        <li><strong>Within 7 Days:</strong> User-generated content (posts, media files, scheduled drafts) is permanently deleted.</li>
        <li><strong>Within 30 Days:</strong> Analytics, reporting, and system logs are removed.</li>
        <li><strong>Legal &amp; Financial Records:</strong> Billing and transaction data may be retained for up to 7 years as required by tax and compliance laws.</li>
      </ul>

      <h2>4. Exceptions</h2>
      <p>We may retain certain data if:</p>
      <ul>
        <li>Required by law or legal process.</li>
        <li>Necessary to resolve disputes or enforce agreements.</li>
        <li>Needed to prevent fraudulent or abusive use of our services.</li>
      </ul>

      <h2>5. Third-Party Data Handling</h2>
      <p>
        Social media content already published through MGA Buzz Connect cannot be deleted from the respective platform
        (e.g., Instagram, LinkedIn, Twitter/X, YouTube). Users must delete posts directly on those platforms.
      </p>
      <p>
        Data stored by third-party service providers (e.g., payment gateways, hosting providers) will be subject to
        their retention policies.
      </p>

      <h2>6. Confirmation of Deletion</h2>
      <p>
        Once deletion is complete, users will receive a confirmation email. If deletion cannot be fulfilled due to
        legal or technical reasons, we will notify the user with details.
      </p>

      <h2>7. Policy Updates</h2>
      <p>
        We may update this policy from time to time to reflect changes in regulations or services. Updates will be
        communicated via email or in-app notification.
      </p>

      <h2>8. Contact</h2>
      <p>
        For questions or deletion requests, contact us at{" "}
        <a href="mailto:contact@mgabuzzconnect.com">contact@mgabuzzconnect.com</a>.
      </p>
      <p>📍 MGA Buzz Connect, Mumbai, Maharashtra, India</p>

      <button className="back-dashboard-btn" onClick={goToDashboard}>
        ← Back to Dashboard
      </button>
    </div>

  );
};

export default DataDeletionPolicy;
