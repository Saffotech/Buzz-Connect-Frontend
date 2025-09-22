import React from "react";
import { useNavigate } from "react-router-dom";
import "./LegalPages.css";

const PrivacyPolicy = () => {
  const navigate = useNavigate(); // initialize navigation

  const goToDashboard = () => {
    navigate("/dashboard"); // replace with your dashboard route
  };

  return (
    <div className="legal-container">
      <h1>Privacy Policy</h1>
      <p className="effective-date">Effective Date: July 14, 2025</p>

      <p>
        <strong>MGA Buzz Connect</strong> ("we", "our", or "us") is committed to
        protecting your privacy. This Privacy Policy explains how we collect,
        use, disclose, and safeguard your information when you use our platform
        to manage and schedule content across social media platforms. By using
        our services, you agree to the practices described in this policy.
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>
          <strong>Account Information:</strong> Your name, email address, and
          contact details.
        </li>
        <li>
          <strong>Social Media Data:</strong> With your permission, we collect
          data from your connected social media accounts (e.g., Instagram,
          Facebook) such as profile information, posts, analytics, and
          scheduling data.
        </li>
        <li>
          <strong>Usage Data:</strong> Information about how you interact with
          our platform, including pages visited and actions taken.
        </li>
        <li>
          <strong>Device Data:</strong> IP address, browser type, and operating
          system.
        </li>
        <li>
          <strong>Cookies & Tracking:</strong> We use cookies and similar
          technologies to improve your experience and analyze usage.
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>Provide and maintain our services</li>
        <li>Allow you to schedule and manage social media posts</li>
        <li>Authenticate you via third-party platforms (Meta, Instagram, etc.)</li>
        <li>Send notifications and updates</li>
        <li>Analyze usage to improve our platform</li>
        <li>Comply with legal and regulatory obligations</li>
      </ul>

      <h2>3. Sharing Your Information</h2>
      <p>
        We do <strong>not sell</strong> or rent your personal data. We only
        share your information with:
      </p>
      <ul>
        <li>
          Social media platforms (e.g., Instagram Graph API, Facebook Graph API)
          to publish and retrieve your content with your explicit permission.
        </li>
        <li>
          Service providers who help operate our platform (e.g., cloud hosting,
          analytics, customer support).
        </li>
        <li>Legal authorities when required by law.</li>
      </ul>

      <h2>4. Data Retention</h2>
      <p>
        We retain your personal data only as long as necessary to provide our
        services, comply with legal obligations, resolve disputes, and enforce
        agreements. You may request deletion of your data at any time by
        contacting us.
      </p>

      <h2>5. Data Security</h2>
      <p>
        We use industry-standard security practices, including encryption and
        access control, to protect your data. However, no method of transmission
        or storage is 100% secure, and we cannot guarantee absolute security.
      </p>

      <h2>6. Your Rights</h2>
      <ul>
        <li>Access and update your personal information</li>
        <li>Disconnect your social media accounts at any time</li>
        <li>
          Request deletion of your data by contacting us at{" "}
          <a href="mailto:mgabrandbuzz@gmail.com">
            mgabrandbuzz@gmail.com
          </a>
        </li>
        <li>
          If you are located in the EU/EEA, you have additional rights under
          GDPR, including data portability and the right to object to
          processing.
        </li>
        <li>
          If you are a California resident, you may exercise rights under CCPA,
          including opting out of data sharing.
        </li>
      </ul>

      <h2>7. Children's Privacy</h2>
      <p>
        Our services are not directed to children under the age of 13. We do not
        knowingly collect personal information from children. If we become aware
        that a child has provided us with personal data, we will delete it
        immediately.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy periodically. Changes will be posted
        on this page with an updated effective date.
      </p>

      <h2>9. Contact Us</h2>
      <p>
        If you have questions about this policy, please contact us at:
        <br />
        <strong>Email:</strong>{" "}
        <a href="mailto:mgabrandbuzz@gmail.com">mgabrandbuzz@gmail.com</a>
      </p>

      <p className="thank-you">Thank you for trusting MGA Buzz Connect.</p>
      <button className="back-dashboard-btn" onClick={goToDashboard}>
        ← Back to Dashboard
      </button>
    </div>
  );
};

export default PrivacyPolicy;
