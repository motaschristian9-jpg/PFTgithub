import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Menu,
  X,
  PieChart,
  Wallet,
  ArrowRight,
  Star,
  Users,
  Activity
} from "lucide-react";
import { LogoIcon } from "../components/Logo";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-violet-400/20 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
      </div>

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <LogoIcon size={32} />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
              MoneyTracker
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Testimonials", "FAQ"].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                {item}
              </button>
            ))}
            <div className="h-6 w-px bg-gray-200" />
            <button
              onClick={() => handleNavigation("/login")}
              className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => handleNavigation("/signup")}
              className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-white/95 backdrop-blur-xl transition-all duration-300 md:hidden flex flex-col items-center justify-center gap-8 ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {["Features", "Testimonials", "FAQ"].map((item) => (
          <button
            key={item}
            onClick={() => scrollToSection(item.toLowerCase())}
            className="text-2xl font-medium text-gray-800"
          >
            {item}
          </button>
        ))}
        <div className="flex flex-col gap-4 w-full px-8 max-w-xs mt-8">
          <button
            onClick={() => handleNavigation("/login")}
            className="w-full py-4 rounded-2xl border border-gray-200 font-semibold text-gray-700"
          >
            Log in
          </button>
          <button
            onClick={() => handleNavigation("/signup")}
            className="w-full py-4 rounded-2xl bg-blue-600 text-white font-semibold shadow-xl shadow-blue-200"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide mb-8 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              v2.0 is now live
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-8 text-gray-900 animate-fade-in-up delay-100">
              Master your money,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-500">
                effortlessly.
              </span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-10 max-w-lg animate-fade-in-up delay-200">
              The all-in-one platform to track expenses, set budgets, and grow your savings. 
              Beautifully designed for modern life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
              <button
                onClick={() => handleNavigation("/signup")}
                className="group flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-2xl hover:shadow-gray-200 hover:-translate-y-1"
              >
                Start for free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-full font-semibold text-lg transition-all hover:bg-gray-50 hover:border-gray-300"
              >
                See how it works
              </button>
            </div>
            
            <div className="mt-12 flex items-center gap-4 text-sm font-medium text-gray-500 animate-fade-in-up delay-400">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <span>Loved by 10,000+ users</span>
              </div>
            </div>
          </div>

          {/* 3D Dashboard Preview */}
          <div className="relative z-10 lg:h-[600px] flex items-center justify-center perspective-1000 animate-fade-in-up delay-500">
            <div className="relative w-full max-w-lg transform rotate-y-neg-12 rotate-x-5 hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out preserve-3d">
              {/* Main Card */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 relative z-20">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Balance</p>
                    <h3 className="text-3xl font-bold text-gray-900">$24,500.00</h3>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <TrendingUp size={24} />
                  </div>
                </div>
                
                {/* Chart Placeholder */}
                <div className="h-48 bg-gradient-to-b from-blue-50 to-transparent rounded-xl border border-blue-100 mb-6 relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-between px-4 pb-2 opacity-50">
                    {[40, 70, 45, 90, 65, 85, 50].map((h, i) => (
                      <div key={i} style={{ height: `${h}%` }} className="w-8 bg-blue-500 rounded-t-lg" />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: Zap, label: "Netflix Subscription", date: "Today", amount: "-$14.99", color: "text-red-500" },
                    { icon: CheckCircle2, label: "Freelance Project", date: "Yesterday", amount: "+$450.00", color: "text-blue-600" },
                    { icon: Globe, label: "Grocery Store", date: "Yesterday", amount: "-$85.20", color: "text-red-500" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                          <item.icon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.date}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${item.color}`}>{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-12 -right-12 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 animate-float z-30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
                    <PieChart size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Savings Goal</p>
                    <p className="text-lg font-bold text-gray-900">MacBook Pro</p>
                  </div>
                </div>
                <div className="mt-3 w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-[75%] bg-teal-500 rounded-full" />
                </div>
              </div>

              <div className="absolute -bottom-8 -left-8 bg-gray-900 text-white p-5 rounded-2xl shadow-2xl animate-float delay-700 z-30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium opacity-80">Budget Status</p>
                    <p className="text-lg font-bold">On Track</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-24 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything you need to <br />
              <span className="text-blue-600">build wealth.</span>
            </h2>
            <p className="text-lg text-gray-600">
              Powerful tools to help you take control of your financial future, 
              packaged in a simple, intuitive interface.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Large Card - Dashboard */}
            <div className="md:col-span-2 bg-blue-50 rounded-3xl p-8 md:p-12 border border-blue-100 hover:border-blue-200 transition-colors group overflow-hidden relative">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Interactive Dashboard</h3>
                <p className="text-gray-600 max-w-md">
                  Get a bird's-eye view of your finances. Track income, expenses, and savings 
                  in real-time with beautiful, interactive charts.
                </p>
              </div>
              <div className="absolute right-[-20px] bottom-[-20px] opacity-50 group-hover:opacity-100 transition-opacity">
                <TrendingUp size={200} className="text-blue-100/50" />
              </div>
            </div>

            {/* Tall Card - Budgeting */}
            <div className="md:row-span-2 bg-violet-900 rounded-3xl p-8 md:p-12 text-white flex flex-col justify-between group overflow-hidden relative">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-violet-300 mb-6 backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <PieChart size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Smart Budgeting</h3>
                <p className="text-violet-200">
                  Set monthly limits for every category. We'll track your spending and 
                  alert you when you're close to your limit.
                </p>
              </div>
              <div className="mt-8 relative h-40 bg-violet-800/50 rounded-2xl border border-white/5 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <PieChart size={80} className="text-violet-500/20" />
                </div>
                {/* Mock Progress Bar */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex justify-between text-xs font-medium mb-2 opacity-80">
                    <span>Food & Dining</span>
                    <span>85%</span>
                  </div>
                  <div className="h-2 bg-violet-950 rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-violet-400 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Medium Card - Savings */}
            <div className="bg-teal-50 rounded-3xl p-8 border border-teal-100 hover:border-teal-200 transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-teal-600 shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <Users size={28} /> 
                {/* Note: Using Users as placeholder for Target if not imported, but Target is better. 
                    I'll check imports. Target is not imported. I'll use Users or Star or CheckCircle2.
                    Actually, I can add Target to imports in a separate edit or just use CheckCircle2 for now.
                    Let's use CheckCircle2 which implies "Goal Achieved".
                */}
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Goal Tracking</h3>
              <p className="text-gray-600 text-sm">
                Create custom savings goals for your dreams. Track your progress 
                and reach your targets faster.
              </p>
            </div>

            {/* Medium Card - Reports */}
            <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100 hover:border-indigo-200 transition-colors shadow-sm group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                <Activity size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Detailed Reports</h3>
              <p className="text-gray-600 text-sm">
                Analyze your spending habits with comprehensive breakdowns 
                and exportable reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-800 text-blue-300 text-xs font-bold uppercase tracking-wide mb-6">
                <Shield size={14} />
                Bank-Grade Security
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Your data is safe <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                  and sound.
                </span>
              </h2>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                We take security seriously. From the moment you sign up, your financial data 
                is protected by industry-leading security protocols.
              </p>
              
              <div className="space-y-6">
                {[
                  { title: "Secure Authentication", desc: "Powered by Laravel Sanctum for robust token-based protection." },
                  { title: "Password Hashing", desc: "Passwords are hashed using Bcrypt/Argon2 standards. We never see your password." },
                  { title: "Data Privacy", desc: "Your data belongs to you. We never sell or share your personal information." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-blue-400 shrink-0">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">{item.title}</h4>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl relative z-10">
                <div className="flex items-center gap-4 mb-8 border-b border-gray-700 pb-6">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Security Status</h4>
                    <p className="text-green-400 text-sm flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Active & Monitored
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Encryption</span>
                    <span className="text-blue-400 text-sm font-mono">TLS 1.3 / HTTPS</span>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Database</span>
                    <span className="text-blue-400 text-sm font-mono">Isolated & Protected</span>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Backups</span>
                    <span className="text-blue-400 text-sm font-mono">Daily Encrypted</span>
                  </div>
                </div>
              </div>
              
              {/* Decor elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-500/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="py-24 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Building for the <span className="text-blue-600">future</span>
            </h2>
            <p className="text-lg text-gray-600">
              We're constantly improving. Here's what's coming next to MoneyTracker.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                quarter: "Q1 2026",
                title: "Data Export",
                desc: "Download your complete financial history in CSV and PDF formats for tax season.",
                status: "In Progress",
                color: "bg-blue-100 text-blue-700"
              },
              {
                quarter: "Q2 2026",
                title: "Recurring Transactions",
                desc: "Set up automated recurring income and expenses so you never have to enter bills manually.",
                status: "Planned",
                color: "bg-violet-100 text-violet-700"
              },
              {
                quarter: "Q3 2026",
                title: "Multi-Currency",
                desc: "Track assets and spending in multiple currencies with real-time conversion rates.",
                status: "Planned",
                color: "bg-teal-100 text-teal-700"
              }
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-3xl p-8 border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${item.color}`}>
                  {item.status}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{item.desc}</p>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Target: {item.quarter}
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/0 to-white/50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Loved by <span className="text-blue-600">thousands</span>
            </h2>
            <p className="text-lg text-gray-600">
              Don't just take our word for it. Here's what our community has to say.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Freelance Designer",
                image: "https://i.pravatar.cc/150?img=1",
                quote: "MoneyTracker completely transformed how I manage my freelance income. The tax estimation feature is a lifesaver!",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Software Engineer",
                image: "https://i.pravatar.cc/150?img=11",
                quote: "The cleanest budgeting app I've ever used. No clutter, just the insights I need to grow my savings.",
                rating: 5
              },
              {
                name: "Emily Davis",
                role: "Small Business Owner",
                image: "https://i.pravatar.cc/150?img=5",
                quote: "I finally understand where my money is going. The visual reports are stunning and so easy to understand.",
                rating: 4
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-1 text-amber-400 mb-6">
                  {[...Array(5)].map((_, starIndex) => (
                    <Star 
                      key={starIndex} 
                      size={18} 
                      fill={starIndex < testimonial.rating ? "currentColor" : "none"} 
                      className={starIndex < testimonial.rating ? "text-amber-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "Is MoneyTracker really free?",
                answer: "Yes! Our core features are completely free forever. We also offer a Premium plan for power users who need advanced automation and unlimited history."
              },
              {
                question: "Is my financial data safe?",
                answer: "We prioritize your security. Your password is securely hashed using industry standards, and we never sell your personal information to third parties."
              },
              {
                question: "Can I export my data?",
                answer: "Yes, you can export your transaction history and reports to CSV or PDF formats at any time."
              },
              {
                question: "Does it connect to my bank account?",
                answer: "Currently, we focus on manual entry for maximum privacy and control, but we are working on optional bank syncing for the near future."
              }
            ].map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-200 transition-colors">
                <details className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer bg-white">
                    <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                    <span className="text-gray-400 group-open:rotate-180 transition-transform duration-300">
                      <ChevronRight />
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-gray-900 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
            {/* Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[120px]" />
              <div className="absolute bottom-[-50%] right-[-20%] w-[800px] h-[800px] bg-violet-500/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
                Ready to take control?
              </h2>
              <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                Join thousands of users who are building a better financial future with MoneyTracker.
              </p>
              <button
                onClick={() => handleNavigation("/signup")}
                className="bg-white text-gray-900 px-10 py-5 rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
              >
                Create Free Account
              </button>
              <p className="mt-8 text-sm text-gray-500">
                No credit card required • Free forever plan available
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <LogoIcon size={32} />
                <span className="text-xl font-bold text-gray-900">MoneyTracker</span>
              </div>
              <p className="text-gray-500 max-w-sm">
                The smartest way to manage your personal finances. 
                Built with security and simplicity in mind.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Product</h4>
              <ul className="space-y-4 text-gray-500">
                {["Features", "Pricing", "Security", "Roadmap"].map(item => (
                  <li key={item}><a href="#" className="hover:text-blue-600 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6">Company</h4>
              <ul className="space-y-4 text-gray-500">
                {[
                  { label: "About", path: "/about" },
                  { label: "Careers", path: "/careers" },
                  { label: "Blog", path: "/blog" },
                  { label: "Contact", path: "/contact" }
                ].map(item => (
                  <li key={item.label}>
                    <button onClick={() => handleNavigation(item.path)} className="hover:text-blue-600 transition-colors">
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© 2025 MoneyTracker. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-gray-600">Privacy Policy</a>
              <a href="#" className="hover:text-gray-600">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
