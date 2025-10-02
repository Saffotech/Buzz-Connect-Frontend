import React from "react";
import { useNavigate } from "react-router-dom";
import "./LegalPages.css";

const TermsOfService = () => {
  const navigate = useNavigate(); // initialize navigation

  const goToDashboard = () => {
    navigate("/dashboard"); // replace with your dashboard route
  };

  return (
    <div className="legal-container">
      <h1>Terms of Service</h1>
     
       <p>
       Welcome to <strong>MGA Buzz Connect</strong> , a subscription-based social media scheduling and publishing platform operated by <strong>MGA Buzz Connect, Mumbai, Maharashtra, India.</strong>
       </p>
       <p>
        By using our services, you agree to these Terms of Service. If you do not agree, you may not use the platform.
       </p>

      <h2>1. Services</h2>

      <p>MGA Buzz Connect allows users to schedule, publish, and manage content across social media platforms (Instagram, Facebook, LinkedIn, Twitter/X, YouTube).</p>
      <ul>
        <li>The exact features available depend on your subscription plan.</li>
        <li>Services are provided through official APIs (Meta, LinkedIn, Twitter/X, YouTube).</li>
      </ul>

      <h2>2. Eligibility</h2>
      <ul>
       <li>You must be at least 18 years old to use our services.</li>
       <li>You are responsible for ensuring that your use of the platform complies with the terms and policies of each connected social media platform.</li>
      </ul>

      <h2>3. Accounts</h2>
      <ul>
        <li>You must provide accurate registration details.</li>
        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
        <li>You must notify us immediately if you suspect unauthorized use of your account.</li>
      </ul>

      <h2>4. Subscriptions & Payments</h2>
      <ul>
       <li>Our services are billed on a recurring subscription basis.</li>
       <li>Fees are due in advance and are <strong>non-refundable</strong> unless required by law.</li>
       <li>We may suspend or terminate service for non-payment.</li>
       <li>We may change pricing with prior notice.</li>
      </ul>

      <h2>5. Use of APIs and Credentials</h2>
      <ul>
      <li>We use secure tokens to connect with third-party platforms.</li>
      <li>You grant us permission to publish and manage content on your behalf.</li>
      <li>If you revoke access or if a platform limits your account, our service may not function properly.</li>
      </ul>

      <h2>6. Acceptable Use</h2>

      <p>You agree not to:</p>
      <ul>
     <li>Post unlawful, harmful, or misleading content.</li>
     <li>Use the service to spam or harass others.</li>
     <li>Attempt to bypass or misuse our systems.</li>
     <li>Violate the terms of Instagram, Facebook, LinkedIn, Twitter/X, or YouTube.</li>
      </ul>

     <p>We may suspend or terminate your account if you breach these rules.</p>

      <h2>7. Intellectual Property</h2>
      <ul>
      <li>All rights in the MGA Buzz Connect platform (software, design, branding) belong to MGA Buzz Connect.</li>
      <li>You retain rights to the content you upload but grant us a license to process, store, and publish it on your behalf.</li>
      </ul>

      <h2>8. Disclaimers</h2>
      <ul>
       <li>Our services are provided as available.</li>
       <li>We do not guarantee uninterrupted or error-free operation.</li>
       <li>Social media platforms may change their APIs or policies, which may affect service availability.</li>
      </ul>

      <h2>9. Limitation of Liability</h2>
      <ul>
        <li>MGA Buzz Connect is not liable for loss of data, account suspensions, or actions taken by social media platforms.</li>
        <li>Our total liability under these Terms is limited to the fees you paid in the last 30 days.</li>
        </ul>

        <h2>10. Termination</h2>
      <ul>
        <li>You may cancel your subscription at any time via your account dashboard.</li>
        <li>We may terminate or suspend accounts that violate these Terms or for non-payment.</li>
        <li>Upon termination, we will delete your stored credentials and content in accordance with our Data Deletion Policy.</li>
        </ul>

          <h2>11. Governing Law & Dispute Resolution</h2>
      <ul>
        <li>These Terms are governed by the laws of India.</li>
        <li>Courts in Mumbai, Maharashtra shall have exclusive jurisdiction over disputes.</li>
        </ul>

      <h2>12. Contact Us</h2>
      <p>
       For questions, please contact us at:
        <br />
        <strong>Email:</strong> <a href="mailto:mgabrandbuzz@gmail.com">mgabrandbuzz@gmail.com</a>
      </p>

      <p className="thank-you">Thank you for using MGA Buzz Connect.</p>
      <button className="back-dashboard-btn" onClick={goToDashboard}>
        ← Back to Dashboard
      </button>
    </div>
  );
};

export default TermsOfService;
