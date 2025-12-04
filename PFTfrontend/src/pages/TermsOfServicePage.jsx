import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { LogoIcon } from "../components/Logo";

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-gray-500">Last updated: December 05, 2025</p>
        </div>

        <div className="prose prose-lg text-gray-600">
          <p>
            Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the MoneyTracker website and mobile application (the "Service") operated by MoneyTracker ("us", "we", or "our").
          </p>
          <p>
            Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
          </p>

          <h3 className="text-gray-900 font-bold mt-8 mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" /> Accounts
          </h3>
          <p>
            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>
          <p>
            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.
          </p>

          <h3 className="text-gray-900 font-bold mt-8 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" /> Intellectual Property
          </h3>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property of MoneyTracker and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
          </p>

          <h3 className="text-gray-900 font-bold mt-8 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-600" /> Termination
          </h3>
          <p>
            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
          <p>
            All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
          </p>

          <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-2">Questions?</h4>
            <p className="text-sm">
              If you have any questions about these Terms, please contact us at: <br />
              <span className="text-blue-600 font-medium">legal@moneytracker.com</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
