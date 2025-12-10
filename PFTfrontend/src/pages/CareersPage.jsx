import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, MapPin, Clock } from "lucide-react";
import { LogoIcon } from "../components/Logo";

export default function CareersPage() {
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
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Join Our Team</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Help us build the future of personal finance. We're looking for passionate individuals to join our remote-first team.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { role: "Senior Frontend Engineer", dept: "Engineering", type: "Full-time", loc: "Remote" },
            { role: "Product Designer", dept: "Design", type: "Full-time", loc: "Remote" },
            { role: "Customer Success Manager", dept: "Operations", type: "Full-time", loc: "New York, NY" },
            { role: "Backend Developer (Laravel)", dept: "Engineering", type: "Contract", loc: "Remote" }
          ].map((job, i) => (
            <div key={i} className="group bg-white border border-gray-200 p-6 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{job.role}</h3>
                  <p className="text-gray-500 mt-1">{job.dept}</p>
                </div>
                <div className="flex flex-col items-end gap-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} /> {job.loc}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} /> {job.type}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gray-50 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Don't see the right role?</h3>
          <p className="text-gray-600 mb-6">
            We're always looking for talent. Send your resume to careers@moneytracker.com
          </p>
          <button className="bg-gray-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors">
            Email Us
          </button>
        </div>
      </main>
    </div>
  );
}
