import React from "react";
import { Routes, Route } from "react-router-dom"; // Add these imports
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/authpages/LoginPage";
import SignupPage from "./pages/authpages/SignupPage";
import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Budgets from "./pages/Budgets";
import Savings from "./pages/Savings";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import "./App.css";

function App() {
  return (
    <div className="App min-h-screen w-full">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="transaction" element={<Transactions />} />
          <Route path="income" element={<Income />} />
          <Route path="expense" element={<Expenses />} />
          <Route path="budget" element={<Budgets />} />
          <Route path="saving" element={<Savings />} />
          <Route path="report" element={<Reports />} />
          <Route path="setting" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
