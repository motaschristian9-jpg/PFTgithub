import React from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/authpages/LoginPage.jsx";
import SignupPage from "./pages/authpages/SignupPage.jsx";
import Dashboard from "./pages/userpages/Dashboard.jsx";
import TransactionsPage from "./pages/userpages/TransactionsPage.jsx";
import BudgetPage from "./pages/userpages/BudgetPage.jsx";
import SavingsPage from "./pages/userpages/SavingsPage.jsx";
import ReportsPage from "./pages/userpages/ReportsPage.jsx";
import EmailVerificationPage from "./pages/authpages/EmailVerificationPage.jsx";
import ResetPasswordPage from "./pages/authpages/ResetPasswordPage.jsx";
import ForgotPasswordPage from "./pages/authpages/ForgotPasswordPage.jsx";
import GoogleCallbackPage from "./pages/authpages/GoogleCallbackPage.jsx";
import PrivateRoutes from "./components/PrivateRoutes.jsx";
import PublicRoutes from "./components/PublicRoutes.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import DataLoader from "./components/DataLoader.jsx";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Routes>
          {/* Public routes under "/" */}
          <Route path="/" element={<PublicRoutes />}>
            <Route index element={<LandingPage />} />
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
          <Route element={<PrivateRoutes />}>
            <Route
              path="dashboard"
              element={
                <DataLoader>
                  <Dashboard />
                </DataLoader>
              }
            />
            <Route
              path="transaction"
              element={
                <DataLoader>
                  <TransactionsPage />
                </DataLoader>
              }
            />
            <Route
              path="budget"
              element={
                <DataLoader>
                  <BudgetPage />
                </DataLoader>
              }
            />
            <Route
              path="saving"
              element={
                <DataLoader>
                  <SavingsPage />
                </DataLoader>
              }
            />
            <Route
              path="report"
              element={
                <DataLoader>
                  <ReportsPage />
                </DataLoader>
              }
            />
          </Route>
        </Routes>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
