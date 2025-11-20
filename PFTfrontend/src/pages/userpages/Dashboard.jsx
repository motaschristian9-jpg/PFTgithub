import React, { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import Topbar from "../../layout/Topbar.jsx";
import Sidebar from "../../layout/Sidebar.jsx";
import Footer from "../../layout/Footer.jsx";
import MainView from "../../layout/MainView.jsx";
import { logoutUser } from "../../api/auth.js";
import { useAuth } from "../../hooks/useAuth";
import { fetchTransactions } from "../../api/transactions";
import LoadingScreen from "../../components/LoadingScreen";
import Swal from "sweetalert2";

const Dashboard = () => {
  const { user, isLoading: userLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 768;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newValue = !prev;
      localStorage.setItem("sidebarOpen", JSON.stringify(newValue));
      return newValue;
    });
  };

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your account',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await logoutUser();
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
      } catch (error) {
        console.error("Logout failed:", error);
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
      }
    }
  };

  if (userLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-green-300/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-green-100/30 to-green-200/20 rounded-full blur-2xl"></div>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} mobileMenuOpen={mobileMenuOpen} toggleMobileMenu={toggleMobileMenu} />

      {/* Main content */}
      <div className="flex-1 flex flex-col relative z-10">
        <Topbar
          toggleMobileMenu={toggleMobileMenu}
          notifications={[]}
          hasUnread={false}
          setHasUnread={() => {}}
          user={user}
          handleLogout={handleLogout}
        />

        <MainView>
          <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
            {/* Header */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <DollarSign className="text-white" size={20} />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                      Dashboard
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                      Welcome back, {user?.name || "User"}! Here's your financial overview.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Transactions Summary */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-100/50 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 text-sm">
                        Total Income
                      </h3>
                      <p className="text-2xl font-bold text-green-600">
                        ${(transactions?.data || []).filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-200/30 to-red-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-red-100/50 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <TrendingDown className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 text-sm">
                        Total Expenses
                      </h3>
                      <p className="text-2xl font-bold text-red-500">
                        ${(transactions?.data || []).filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <DollarSign className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 text-sm">
                        Net Balance
                      </h3>
                      <p className={`text-2xl font-bold ${(transactions?.data || []).filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0) - (transactions?.data || []).filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        ${((transactions?.data || []).filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0) - (transactions?.data || []).filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Transactions */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-6 lg:p-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Transactions</h3>
                {(transactions?.data || []).length > 0 ? (
                  <div className="space-y-2">
                    {(transactions?.data || []).slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center p-4 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors">
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                        </div>
                        <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                          {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <DollarSign className="text-gray-400" size={24} />
                      </div>
                      <p className="text-gray-500">No transactions found</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </MainView>

        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
