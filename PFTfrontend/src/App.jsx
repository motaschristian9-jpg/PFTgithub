import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage.jsx";
import SignupPage from "./pages/authpages/SignupPage.jsx";
import LoginPage from "./pages/authpages/LoginPage.jsx";
import EmailVerificationPage from "./pages/authpages/EmailVerificationPage.jsx";
import GoogleCallbackPage from "./pages/authpages/GoogleCallbackPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/email-verification" element={<EmailVerificationPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
    </Routes>
  );
}
