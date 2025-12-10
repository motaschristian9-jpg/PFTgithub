import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye } from "lucide-react";
import { LogoIcon } from "../components/Logo";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <nav className="border-b border-gray-100 py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
            <LogoIcon size={28} />
            <span className="text-xl font-bold text-gray-900">MoneyTracker</span>
          </div>
          <button onClick={() => navigate("/")} className="text-sm font-medium text-gray-600 hover:text-blue-600">
            Back to Home
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-500">Last updated: December 05, 2025</p>
        </div>

        <div className="prose prose-lg text-gray-600">
          <p>
            At MoneyTracker, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our mobile application.
          </p>

          <h3 className="text-gray-900 font-bold mt-8 mb-4 flex items-center gap-2">
            <Shield size={20} className="text-blue-600" /> Information We Collect
          </h3>
          <p>
            We collect information that you voluntarily provide to us when you register on the application, express an interest in obtaining information about us or our products and services, when you participate in activities on the application, or otherwise when you contact us.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Personal Data (Name, Email Address)</li>
            <li>Financial Data (Transaction history, Budgets)</li>
            <li>Derivative Data (IP address, Browser type)</li>
          </ul>

          <h3 className="text-gray-900 font-bold mt-8 mb-4 flex items-center gap-2">
            <Lock size={20} className="text-blue-600" /> How We Use Your Information
          </h3>
          <p>
            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the application to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Create and manage your account.</li>
            <li>Process your transactions and send related information.</li>
            <li>Email you regarding your account or order.</li>
            <li>Generate a personal profile about you to make future visits more personalized.</li>
          </ul>

          <h3 className="text-gray-900 font-bold mt-8 mb-4 flex items-center gap-2">
            <Eye size={20} className="text-blue-600" /> Disclosure of Your Information
          </h3>
          <p>
            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
            <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
          </ul>

          <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-2">Contact Us</h4>
            <p className="text-sm">
              If you have questions or comments about this Privacy Policy, please contact us at: <br />
              <span className="text-blue-600 font-medium">privacy@moneytracker.com</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
