import React from "react";
import { useNavigate } from "react-router-dom";
import "./LegalPages.css";

const TestingInstructions = () => {
  const navigate = useNavigate(); // initialize navigation

  const goToDashboard = () => {
    navigate("/dashboard"); // replace with your dashboard route
  };

  return (
    <div className="legal-container">
      <h1>MGA Buzz Connect</h1>
      <h2>Testing Instructions</h2>

      <p>
        These Testing Instructions provide a framework for validating the functionality,
        security, and reliability of the MGA Buzz Connect platform across supported social
        media integrations.
      </p>

      <h3>1. Environment Setup</h3>
      <ul>
        <li>Staging Environment: Test features in a non-production environment before release.</li>
        <li>Test Accounts: Use dedicated Instagram, Facebook, LinkedIn, Twitter/X, and YouTube accounts for QA.</li>
        <li>Test Data: Prepare sample text, images, and videos that comply with platform requirements.</li>
      </ul>

      <h3>2. Authentication & Access Control</h3>
      <ul>
        <li><strong>User Signup & Login:</strong> Test registration, login, and password reset flows.</li>
        <li><strong>Social Media Integrations:</strong> Connect/disconnect Instagram, Facebook, LinkedIn, Twitter/X, YouTube. Validate tokens and re-authentication after expiry.</li>
        <li><strong>Access Control:</strong> Confirm users only access their own content. Test role-based access (admin vs. user).</li>
      </ul>

      <h3>3. Core Functionality – Scheduling & Publishing</h3>
      <ul>
        <li>Create drafts with text, hashtags, emojis, and media.</li>
        <li>Schedule posts across time zones; modify or delete schedules.</li>
        <li>Test publishing immediately and at scheduled times on all platforms.</li>
        <li>Error Handling: Expired tokens, failed publishing retries, invalid file types with clear messages.</li>
      </ul>

      <h3>4. Analytics & Reporting</h3>
      <ul>
        <li>Verify likes, comments, shares, and views retrieval from each platform.</li>
        <li>Ensure reporting dashboards are accurate and responsive.</li>
        <li>Check refresh frequency and error handling for unavailable APIs.</li>
      </ul>

      <h3>5. Notifications</h3>
      <ul>
        <li>In-app and email notifications for publishing success, failure, and token expiration.</li>
        <li>Validate frequency to avoid spam.</li>
      </ul>

      <h3>6. Security Testing</h3>
      <ul>
        <li>Confirm encryption of credentials and tokens.</li>
        <li>Test session timeouts, forced logout, and unauthorized access attempts.</li>
        <li>Run penetration tests (SQL injection, XSS, CSRF).</li>
      </ul>

      <h3>7. Cross-Platform & Device Testing</h3>
      <ul>
        <li>Browsers: Chrome, Safari, Firefox, Edge.</li>
        <li>Devices: Desktop, tablets, mobile.</li>
        <li>OS: Windows, macOS, iOS, Android.</li>
        <li>Responsiveness: Verify adaptive layouts across screens.</li>
      </ul>

      <h3>8. Performance Testing</h3>
      <ul>
        <li>Validate behavior under heavy load (multiple users).</li>
        <li>Measure publishing delays vs. schedule.</li>
        <li>Check recovery after downtime or API failure.</li>
      </ul>

      <h3>9. Compliance Testing</h3>
      <ul>
        <li>Verify compliance with all platform API policies.</li>
        <li>Confirm data retention per Privacy Policy.</li>
        <li>Ensure GDPR/PDP Bill rights (data deletion, revoke access).</li>
      </ul>

      <h3>10. Final Release Checklist</h3>
      <ul>
        <li>✅ Authentication works across all supported platforms.</li>
        <li>✅ Scheduling & publishing validated in all time zones.</li>
        <li>✅ Media compatibility confirmed.</li>
        <li>✅ Error handling tested for token expiry and API limits.</li>
        <li>✅ Analytics dashboards accurate and responsive.</li>
        <li>✅ Notifications clear and timely.</li>
        <li>✅ Security verified for encryption and access control.</li>
        <li>✅ UI tested across browsers and devices.</li>
        <li>✅ Performance stable under load.</li>
        <li>✅ Data privacy & compliance met.</li>
      </ul>

      <p>
        Thank you,
        <br />
        MGA Buzz Connect Team
      </p>

      <button className="back-dashboard-btn" onClick={goToDashboard}>
        ← Back to Dashboard
      </button>
    </div>

  );
};

export default TestingInstructions;
