import React from "react";
import "./LegalPages.css";

const TestingInstructions = () => {
  return (
    <div className="legal-container">
      <h1>MGA Buzz Connect</h1>
      <h2>Testing Instructions</h2>

      <p>
        Dear Meta Reviewer, please follow the steps below to test the integration of
        Instagram/Facebook login with our platform.
      </p>

      <ol>
        <li>
          Go to{" "}
          <a href="https://mgabrandbuzz.com" target="_blank" rel="noreferrer">
            https://mgabrandbuzz.com
          </a>.
        </li>
        <li>
          Click on <strong>Sign Up</strong> and create a test account.
        </li>
        <li>
          After login, click <strong>Connect Instagram / Facebook</strong>.
        </li>
        <li>
          You will be redirected to Meta’s login dialog. Use the test account provided
          below.
        </li>
      </ol>

      <div className="legal-box">
        <p>
          <strong>Test Account Credentials</strong> (Meta Test User):
        </p>
        <p>
          Email / Username: <em>[your-test-user-email]</em>
        </p>
        <p>
          Password: <em>[your-test-user-password]</em>
        </p>
      </div>

      <div className="legal-box">
        <p>
          <strong>Expected Result:</strong>
        </p>
        <ul>
          <li>
            After login, the Instagram/Facebook account should connect successfully.
          </li>
          <li>
            The connected account will be visible on the user dashboard.
          </li>
        </ul>
      </div>

      <p>
        Thank you,
        <br />
        MGA Buzz Connect Team
      </p>
    </div>
  );
};

export default TestingInstructions;
