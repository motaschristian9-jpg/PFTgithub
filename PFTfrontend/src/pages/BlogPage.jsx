import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { LogoIcon } from "../components/Logo";

export default function BlogPage() {
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

      <main className="container mx-auto px-6 py-16 max-w-5xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Blog</h1>
          <p className="text-xl text-gray-600">
            Tips, tricks, and insights on mastering your money.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "5 Ways to Save for a House in 2025",
              excerpt: "Strategies to boost your savings rate without sacrificing your lifestyle.",
              date: "Dec 01, 2025",
              author: "Sarah J.",
              image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            },
            {
              title: "Understanding the 50/30/20 Rule",
              excerpt: "The classic budgeting rule explained for modern finances.",
              date: "Nov 28, 2025",
              author: "Mike T.",
              image: "https://images.unsplash.com/photo-1554224155-984063584d45?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            },
            {
              title: "Why We Switched to Serverless",
              excerpt: "A technical deep dive into how MoneyTracker scales.",
              date: "Nov 15, 2025",
              author: "Dev Team",
              image: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            }
          ].map((post, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="aspect-video bg-gray-100 rounded-2xl mb-4 overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{post.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{post.excerpt}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
