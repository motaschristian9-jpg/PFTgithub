import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Award, Globe } from "lucide-react";
import { LogoIcon } from "../components/Logo";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Simple Nav */}
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

      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="mb-12">
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors">
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Us</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            We're on a mission to simplify personal finance for everyone. 
            MoneyTracker was built to help you take control of your financial future.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: Users, title: "Community First", desc: "Built for real people with real financial goals." },
            { icon: Award, title: "Excellence", desc: "Award-winning design and security standards." },
            { icon: Globe, title: "Global Vision", desc: "Helping users worldwide achieve financial freedom." }
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                <item.icon size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="prose prose-lg text-gray-600">
          <p>
            Founded in 2025, MoneyTracker started with a simple idea: budgeting shouldn't be boring. 
            We believe that when you can see your money clearly, you can make better decisions.
          </p>
          <p>
            Our team consists of finance experts, designers, and engineers who are passionate about 
            creating tools that are not only powerful but also a joy to use.
          </p>
        </div>
      </main>
    </div>
  );
}
