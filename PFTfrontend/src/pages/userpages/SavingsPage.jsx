import { useState, useMemo } from "react";
import {
  Calendar,
  DollarSign,
  Plus,
  Target,
  Clock,
  Eye,
  Trash2,
  TrendingUp,
  CheckCircle2,
  PiggyBank,
  Award,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";

// Layout & Components
import Topbar from "../../layout/Topbar.jsx";
import Sidebar from "../../layout/Sidebar.jsx";
import Footer from "../../layout/Footer.jsx";
import MainView from "../../layout/MainView.jsx";
import { useDataContext } from "../../components/DataLoader";

export default function SavingsPage() {
  const queryClient = useQueryClient();

  // --- UI State ---
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 768;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Data Access ---
  const { user, savingsData } = useDataContext();

  const allSavings = useMemo(() => savingsData?.data || [], [savingsData]);

  // --- OPTIMIZATION: MEMOIZED CALCULATIONS ---

  // 1. Split Active vs Completed
  const { activeSavings, historySavings } = useMemo(() => {
    const active = [];
    const history = [];

    allSavings.forEach((goal) => {
      const current = Number(goal.current_amount || 0);
      const target = Number(goal.target_amount || 1);
      // Logic: It is history if status is explicitly completed OR reached 100%
      if (goal.status === "completed" || (current >= target && target > 0)) {
        history.push(goal);
      } else {
        active.push(goal);
      }
    });

    return { activeSavings: active, historySavings: history };
  }, [allSavings]);

  // 2. Overview Statistics
  const stats = useMemo(() => {
    const totalSaved = allSavings.reduce(
      (sum, s) => sum + Number(s.current_amount || 0),
      0
    );
    const totalTarget = allSavings.reduce(
      (sum, s) => sum + Number(s.target_amount || 0),
      0
    );
    const totalRemaining = Math.max(totalTarget - totalSaved, 0);

    return {
      totalSaved,
      totalTarget,
      totalRemaining,
      activeCount: activeSavings.length,
      completedCount: historySavings.length,
    };
  }, [allSavings, activeSavings, historySavings]);

  // --- HELPERS ---

  const getProgressInfo = (current, target) => {
    const percent = target > 0 ? (current / target) * 100 : 0;

    // Green scaling for progress
    if (percent >= 100)
      return {
        label: "Completed",
        colorClass: "bg-green-100 text-green-800",
        textClass: "text-green-800",
        barColor: "bg-green-600",
        iconBg: "bg-green-100",
      };
    if (percent >= 75)
      return {
        label: "Almost There",
        colorClass: "bg-green-100 text-green-700",
        textClass: "text-green-700",
        barColor: "bg-green-500",
        iconBg: "bg-green-50",
      };
    if (percent >= 50)
      return {
        label: "Halfway",
        colorClass: "bg-emerald-50 text-emerald-700",
        textClass: "text-emerald-700",
        barColor: "bg-emerald-500",
        iconBg: "bg-emerald-50",
      };

    return {
      label: "In Progress",
      colorClass: "bg-green-50 text-green-600",
      textClass: "text-green-600",
      barColor: "bg-green-400",
      iconBg: "bg-green-50",
    };
  };

  // --- HANDLERS ---

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newValue = !prev;
      localStorage.setItem("sidebarOpen", JSON.stringify(newValue));
      return newValue;
    });
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    console.log("Delete placeholder for ID:", id);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white via-green-50 to-emerald-50">
      <style>{` .swal-z-index-fix { z-index: 10000 !important; } `}</style>

      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-emerald-300/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-emerald-100/30 to-green-200/20 rounded-full blur-2xl"></div>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        mobileMenuOpen={mobileMenuOpen}
        toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div className="flex-1 flex flex-col relative z-10">
        <Topbar
          toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          notifications={[]}
          user={user}
        />

        <MainView>
          <div className="space-y-6 p-4 sm:p-6 lg:p-0">
            {/* 1. Header & Actions */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-emerald-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                    <PiggyBank className="text-white" size={28} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                      Savings Goals
                    </h1>
                    <p className="text-gray-500 mt-1">
                      Track your progress and reach your financial dreams
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => console.log("Open Modal Placeholder")}
                  className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 font-medium"
                >
                  <Plus size={18} />
                  <span>New Goal</span>
                </button>
              </div>
            </section>

            {/* 2. Overview Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Total Saved (Green) */}
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-green-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Saved
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    ${stats.totalSaved.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <DollarSign size={24} />
                </div>
              </div>

              {/* Total Target (Emerald/Dark Green) */}
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Target
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    ${stats.totalTarget.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <Target size={24} />
                </div>
              </div>

              {/* Completion Status (Green/Teal) */}
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-teal-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Goals Reached
                  </p>
                  <div className="flex space-x-4 mt-1">
                    <div className="text-center">
                      <span className="block text-xl font-bold text-teal-600">
                        {stats.completedCount}
                      </span>
                      <span className="text-[10px] uppercase text-gray-400 font-semibold">
                        Done
                      </span>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="text-center">
                      <span className="block text-xl font-bold text-green-600">
                        {stats.activeCount}
                      </span>
                      <span className="text-[10px] uppercase text-gray-400 font-semibold">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                  <Award size={24} />
                </div>
              </div>
            </section>

            {/* 3. Active Savings Grid */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-emerald-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-6 min-h-[300px]">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">
                    Active Goals
                  </h2>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    {activeSavings.length} In Progress
                  </span>
                </div>

                {activeSavings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                      <Target className="text-green-300" size={40} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      No active goals
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 max-w-xs">
                      Set a goal to start saving for your next big purchase or
                      emergency fund.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {activeSavings.map((s) => {
                      const current = Number(s.current_amount || 0);
                      const target = Number(s.target_amount || 1);
                      const remaining = Math.max(target - current, 0);
                      const percent = target > 0 ? (current / target) * 100 : 0;
                      const widthPercent = Math.min(percent, 100);
                      const statusInfo = getProgressInfo(current, target);

                      return (
                        <div
                          key={s.id}
                          className="group relative cursor-pointer"
                          onClick={() => console.log("Open Card Placeholder")}
                        >
                          <div className="relative bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 overflow-hidden">
                            {/* Top Bar Indicator */}
                            <div
                              className={`absolute top-0 left-0 right-0 h-1.5 ${statusInfo.barColor}`}
                            ></div>

                            <div className="flex items-start justify-between mb-4 mt-1">
                              <div className="flex-1 min-w-0 mr-4">
                                <h3 className="font-bold text-lg text-gray-800 truncate">
                                  {s.name}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5 truncate uppercase tracking-wider font-medium">
                                  Target: ${target.toLocaleString()}
                                </p>
                              </div>
                              <div
                                className={`p-2 rounded-lg ${statusInfo.iconBg}`}
                              >
                                <Target
                                  className={statusInfo.textClass}
                                  size={20}
                                />
                              </div>
                            </div>

                            {/* Dates */}
                            <div className="flex items-center space-x-3 mb-5 text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">
                              <Calendar size={14} />
                              <span className="truncate">
                                {s.target_date
                                  ? new Date(s.target_date).toLocaleDateString()
                                  : "No deadline"}
                              </span>
                            </div>

                            {/* Stats Rows */}
                            <div className="space-y-3 mb-5">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Saved</span>
                                <span className="font-bold text-gray-800">
                                  ${current.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Remaining</span>
                                <span className="font-bold text-gray-600">
                                  ${remaining.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs font-semibold text-gray-500 uppercase">
                                  Progress
                                </span>
                                <span
                                  className={`text-xs font-bold ${statusInfo.textClass}`}
                                >
                                  {percent.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ease-out ${statusInfo.barColor}`}
                                  style={{ width: `${widthPercent}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between pt-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusInfo.colorClass}`}
                              >
                                {statusInfo.label}
                              </span>
                              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="p-1.5 bg-gray-50 rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50">
                                  <Eye size={16} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* 4. Completed History (Desktop) */}
            {historySavings.length > 0 && (
              <section className="relative hidden lg:block">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-emerald-300/20 rounded-2xl blur opacity-40"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 overflow-hidden">
                  <div className="p-6 border-b border-green-100/50 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">
                      Completed Goals
                    </h3>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <CheckCircle2 size={16} className="text-green-500" />{" "}
                      Accomplished
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-green-50/30 border-b border-green-100">
                        <tr>
                          <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                            Goal Name
                          </th>
                          <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                            Target Amount
                          </th>
                          <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                            Saved
                          </th>
                          <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                            Date Reached
                          </th>
                          <th className="py-4 px-6 font-semibold text-xs text-gray-500 uppercase tracking-wider text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-green-100/50">
                        {historySavings.map((s) => (
                          <tr
                            key={s.id}
                            className="hover:bg-green-50/20 transition-colors"
                          >
                            <td className="py-4 px-6 text-gray-800 font-medium">
                              {s.name}
                            </td>
                            <td className="py-4 px-6 text-gray-600">
                              ${Number(s.target_amount).toLocaleString()}
                            </td>
                            <td className="py-4 px-6 font-bold text-green-600">
                              ${Number(s.current_amount).toLocaleString()}
                            </td>
                            <td className="py-4 px-6 text-gray-500 text-sm">
                              {s.target_date
                                ? new Date(s.target_date).toLocaleDateString()
                                : "-"}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  className="p-2 rounded-lg transition-colors text-gray-400 hover:text-green-600 hover:bg-green-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log("Open View Placeholder");
                                  }}
                                  aria-label="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  className="p-2 rounded-lg transition-colors text-gray-400 hover:text-red-600 hover:bg-red-50"
                                  onClick={(e) => handleDelete(s.id, e)}
                                  aria-label="Delete Goal"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* 5. Mobile History Cards */}
            {historySavings.length > 0 && (
              <section className="relative lg:hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-emerald-300/20 rounded-2xl blur opacity-40"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 overflow-hidden">
                  <div className="p-4 border-b border-green-100/50">
                    <h3 className="text-lg font-bold text-gray-800">
                      Completed Goals
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                    {historySavings.map((s) => (
                      <div
                        key={s.id}
                        className="p-4 hover:bg-green-50/20 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-gray-800">{s.name}</p>
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
                            Done
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm mb-3">
                          <span className="text-gray-500">
                            Saved:{" "}
                            <span className="text-green-600 font-bold">
                              ${Number(s.current_amount).toLocaleString()}
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => console.log("Open View Placeholder")}
                            className="text-green-600"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(s.id, e)}
                            className="text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        </MainView>
        <Footer />
      </div>
    </div>
  );
}
