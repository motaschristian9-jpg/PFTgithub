import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PrivateRoutes from "./components/PrivateRoutes.jsx";
import PublicRoutes from "./components/PublicRoutes.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import DataLoader from "./components/DataLoader.jsx";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import DashboardLayout from "./layout/DashboardLayout.jsx";

// Lazy Load Pages
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const LoginPage = lazy(() => import("./pages/authpages/LoginPage.jsx"));
const SignupPage = lazy(() => import("./pages/authpages/SignupPage.jsx"));
const Dashboard = lazy(() => import("./pages/userpages/Dashboard.jsx"));
const TransactionsPage = lazy(() => import("./pages/userpages/TransactionsPage.jsx"));
const BudgetPage = lazy(() => import("./pages/userpages/BudgetPage.jsx"));
const SavingsPage = lazy(() => import("./pages/userpages/SavingsPage.jsx"));
const ReportsPage = lazy(() => import("./pages/userpages/ReportsPage.jsx"));
const SettingsPage = lazy(() => import("./pages/userpages/SettingsPage.jsx"));
const EmailVerificationPage = lazy(() => import("./pages/authpages/EmailVerificationPage.jsx"));
const ResetPasswordPage = lazy(() => import("./pages/authpages/ResetPasswordPage.jsx"));
const ForgotPasswordPage = lazy(() => import("./pages/authpages/ForgotPasswordPage.jsx"));
const GoogleCallbackPage = lazy(() => import("./pages/authpages/GoogleCallbackPage.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const CareersPage = lazy(() => import("./pages/CareersPage.jsx"));
const BlogPage = lazy(() => import("./pages/BlogPage.jsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.jsx"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage.jsx"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Loading Screen Component
import LoadingScreen from "./components/LoadingScreen";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <ErrorBoundary>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Public routes under "/" */}
              <Route path="/" element={<PublicRoutes />}>
                <Route index element={<LandingPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="careers" element={<CareersPage />} />
                <Route path="blog" element={<BlogPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="terms-of-service" element={<TermsOfServicePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="signup" element={<SignupPage />} />
                <Route
                  path="email-verification"
                  element={<EmailVerificationPage />}
                />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
                <Route
                  path="auth/google/callback"
                  element={<GoogleCallbackPage />}
                />
              </Route>

              {/* Private routes nested inside PrivateRoutes */}
              {/* Private routes nested inside PrivateRoutes */}
              <Route element={<PrivateRoutes />}>
                <Route
                  element={
                    <DataLoader>
                      <DashboardLayout />
                    </DataLoader>
                  }
                >
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="transaction" element={<TransactionsPage />} />
                  <Route path="budget" element={<BudgetPage />} />
                  <Route path="saving" element={<SavingsPage />} />
                  <Route path="report" element={<ReportsPage />} />
                  <Route path="setting" element={<SettingsPage />} />
                </Route>
              </Route>

              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
