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
       

      <p>
       MGA Buzz Connect values your privacy. This Privacy Policy explains what data we collect, how we use it, and your choices. By using our services, you agree to this Policy.
      </p>

      <h2>1. Information We Collect</h2>

      <p>We collect information in the following categories:</p>
      <ul>
        <li>
          <strong>Account Information:</strong> name, email, phone (optional), billing details.
        </li>
        <li>
          <strong>Authentication Data:</strong> social media tokens, account IDs, encrypted credentials.
        </li>
        <li>
          <strong>Usage Data:</strong> social media tokens, account IDs, encrypted credentials.
        </li>
        <li>
          <strong>Content Data:</strong> posts, images, videos, captions you upload for scheduling. 
        </li>
     
      </ul>

      <h2>2. How We Use Your Data</h2>

      <p>We use your data to:</p>
      <ul>
        <li>Provide, improve, and secure our services.</li>
        <li>Authenticate with social media APIs (Instagram, Facebook, LinkedIn, Twitter/X, YouTube).</li>
        <li>Publish and schedule your content on your behalf.</li>
        <li>Send service updates and important notifications.</li>
        <li>Process payments and manage subscriptions.</li>
        <li>Comply with legal obligations.</li>
      </ul>

      <p>We <strong>do not sell your personal data</strong> to advertisers or third parties.</p>


      <h2>3. Sharing of Data</h2>
      <p>
        We only share data with:
      </p>
      <ul>
        <li>
          <strong>Service Providers:</strong> payment gateways, hosting providers, analytics tools.
        </li>
        <li>
          <strong>Social Media Platforms:</strong> via official APIs, to enable publishing and analytics.
        </li>
        <li>
          <strong>Legal Authorities:</strong> if required by law or to protect against misuse.
        </li>
      </ul>

      <h2>4. Data Security</h2>
      <ul>
        <li>Social media tokens and credentials are stored using encryption.</li>
        <li>Access is restricted to authorized systems and staff.</li>
        <li>We use industry-standard security practices, but no system is 100% secure.</li>
      </ul>


      <h2>5. Data Retention</h2>
      <ul>
      <li>We keep your account data as long as you have an active subscription.</li>
      <li>Upon account deletion, we remove your data in line with our Data Deletion Policy.</li>
      <li>Billing and compliance records may be retained as required by law.</li>
      </ul>

       <h2>6. Your Rights</h2>
       <p>Depending on your location, you may have rights to:</p>
      <ul>
      <li>Access the personal data we hold about you.</li>
      <li>Request correction or deletion of your data.</li>
      <li>Revoke consent for connecting social media accounts.</li>
      <li>Request a copy of your data (data portability).</li>
      </ul>

       <p>
         You can exercise these rights by contacting {" "}
          <a href="mailto:mgabrandbuzz@gmail.com">
            mgabrandbuzz@gmail.com
          </a>
        </p>

         <h2>7. Children’s Privacy</h2>
         <p>Our services are not intended for individuals under 18. We do not knowingly collect their data.</p>


         <h2>8. International Transfers</h2>
         <p>Your data may be stored or processed outside India. By using our services, you consent to such transfers, subject to applicable data protection laws.</p>

        <h2>9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. If changes are significant, we will notify you via email or in-app notifications.</p>

        <h2>10. Contact Us</h2>
      <p>
       For questions about this Privacy Policy or to make a privacy request, contact us:
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
