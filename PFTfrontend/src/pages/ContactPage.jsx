import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, MessageSquare, Phone } from "lucide-react";
import { LogoIcon } from "../components/Logo";

export default function ContactPage() {
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

      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl text-gray-600">
            We'd love to hear from you. Our team is here to help.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: MessageSquare, title: "Chat Support", desc: "Our fastest way to get help.", action: "Start Chat" },
            { icon: Mail, title: "Email Us", desc: "Send us a detailed message.", action: "support@moneytracker.com" },
            { icon: Phone, title: "Phone", desc: "Mon-Fri from 8am to 5pm.", action: "+1 (555) 000-0000" }
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 p-8 rounded-3xl text-center border border-gray-100">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6 shadow-sm">
                <item.icon size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm mb-6">{item.desc}</p>
              <span className="text-blue-600 font-semibold">{item.action}</span>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 max-w-2xl mx-auto shadow-xl shadow-gray-100">
          <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input type="email" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Message</label>
              <textarea className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32" placeholder="How can we help?" />
            </div>
            <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">
              Send Message
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
