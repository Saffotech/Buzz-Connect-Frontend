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
      <p className="effective-date">Effective Date: July 14, 2025</p>

      <p>
        Welcome to <strong>MGA Buzz Connect</strong> ("we", "our", or "us").
        These Terms of Service ("Terms") govern your use of our website,
        application, and services ("Platform"). By using MGA Buzz Connect, you
        agree to be bound by these Terms.
      </p>

      <h2>1. Use of Our Service</h2>
      <ul>
        <li>You must be at least 18 years old or have legal parental/guardian consent to use this platform.</li>
        <li>You are responsible for the security of your account credentials.</li>
        <li>You agree to use the platform only for lawful purposes and in accordance with all applicable laws.</li>
      </ul>

      <h2>2. Account and Social Media Access</h2>
      <p>
        When you connect your social media accounts, you authorize us to access
        your account through the APIs (e.g., Instagram Graph API) for the
        purpose of scheduling, posting, and managing content on your behalf. We
        do not post or retrieve data without your consent.
      </p>

      <h2>3. User Content</h2>
      <ul>
        <li>You retain ownership of the content you upload or schedule using our platform.</li>
        <li>You grant MGA Buzz Connect a limited license to process, display, and distribute your content solely to provide the services.</li>
      </ul>

      <h2>4. Subscription and Billing</h2>
      <p>
        Some features may be offered under paid subscriptions. All payments are
        non-refundable unless otherwise stated. We reserve the right to change
        pricing with reasonable notice.
      </p>

      <h2>5. Termination</h2>
      <p>
        We reserve the right to suspend or terminate your access if you violate
        these Terms or misuse the service.
      </p>

      <h2>6. Limitation of Liability</h2>
      <p>
        We are not liable for any indirect, incidental, or consequential damages
        resulting from your use of the platform. The platform is provided "as is" without warranties of any kind.
      </p>

      <h2>7. Third-Party Services</h2>
      <p>
        Our platform integrates with third-party services such as Instagram and
        Facebook. Your use of those services is subject to their respective
        terms and policies.
      </p>

      <h2>8. Modifications</h2>
      <p>
        We may update these Terms at any time. We will notify users of
        significant changes via email or in-app notifications. Continued use of
        the platform indicates your acceptance of the updated Terms.
      </p>

      <h2>9. Governing Law</h2>
      <p>These Terms are governed by and construed in accordance with the laws of India.</p>

      <h2>10. Contact Us</h2>
      <p>
        If you have any questions about these Terms, please contact us at:
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
