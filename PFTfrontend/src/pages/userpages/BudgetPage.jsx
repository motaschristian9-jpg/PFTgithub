import React from "react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

import BudgetModal from "../../components/BudgetModal.jsx";
import BudgetCardModal from "../../components/BudgetCardModal.jsx";
import BudgetHeader from "../../components/budgets/BudgetHeader.jsx";
import BudgetStats from "../../components/budgets/BudgetStats.jsx";
import BudgetCharts from "../../components/budgets/BudgetCharts.jsx";
import BudgetFilters from "../../components/budgets/BudgetFilters.jsx";
import ActiveBudgetsList from "../../components/budgets/ActiveBudgetsList.jsx";
import BudgetHistoryTable from "../../components/budgets/BudgetHistoryTable.jsx";
import BudgetHistoryCharts from "../../components/budgets/BudgetHistoryCharts.jsx";

import { useBudgetPageLogic } from "../../hooks/useBudgetPageLogic";

export default function BudgetPage() {
  const {
    modalOpen,
    setModalOpen,
    editingBudget,
    setEditingBudget,
    budgetCardModalOpen,
    setBudgetCardModalOpen,
    selectedBudget,
    setSelectedBudget,
    activeTab,
    setActiveTab,
    historyPage,
    setHistoryPage,
    search,
    setSearch,
    categoryId,
    setCategoryId,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    user,
    categoriesData,
    activeBudgets,
    historyBudgets,
    historyLoading,
    budgetStats,
    getCategoryName,
    getBudgetSpent,
    getBudgetStatusInfo,
    handleBudgetCardModalOpen,
    handleDelete,
    handleSaveBudget,
    handleDeleteTransaction,
    historyTotalPages,
  } = useBudgetPageLogic();

  const userCurrency = user?.currency || "USD";

  return (
    <motion.div 
      className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <BudgetHeader
          onAddBudget={() => {
            setEditingBudget(null);
            setModalOpen(true);
          }}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <BudgetStats
          stats={budgetStats}
          activeTab={activeTab}
          userCurrency={userCurrency}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        {activeTab === "active" ? (
          <BudgetCharts 
            budgets={activeBudgets} 
            userCurrency={userCurrency} 
            getBudgetSpent={getBudgetSpent}
          />
        ) : (
          <BudgetHistoryCharts 
            budgets={historyBudgets} 
            userCurrency={userCurrency} 
            getBudgetSpent={getBudgetSpent}
          />
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <BudgetFilters
          search={search}
          setSearch={setSearch}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          categoriesData={categoriesData}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortDir={sortDir}
          setSortDir={setSortDir}
        />
      </motion.div>

      {activeTab === "active" ? (
        <motion.div variants={itemVariants}>
          <ActiveBudgetsList
            budgets={activeBudgets}
            getBudgetSpent={getBudgetSpent}
            getBudgetStatusInfo={getBudgetStatusInfo}
            getCategoryName={getCategoryName}
            handleBudgetCardModalOpen={handleBudgetCardModalOpen}
            userCurrency={userCurrency}
          />
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
          <BudgetHistoryTable
            budgets={historyBudgets}
            loading={historyLoading}
            getBudgetSpent={getBudgetSpent}
            getBudgetStatusInfo={getBudgetStatusInfo}
            getCategoryName={getCategoryName}
            handleBudgetCardModalOpen={handleBudgetCardModalOpen}
            handleDelete={handleDelete}
            userCurrency={userCurrency}
            historyPage={historyPage}
            setHistoryPage={setHistoryPage}
            totalPages={historyTotalPages}
          />
        </motion.div>
      )}

      <BudgetModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingBudget(null);
        }}
        onSave={handleSaveBudget}
        editMode={!!editingBudget}
        budget={editingBudget}
        categories={categoriesData?.data || []}
        currentBudgets={activeBudgets}
      />

      <BudgetCardModal
        isOpen={budgetCardModalOpen}
        onClose={() => {
          setBudgetCardModalOpen(false);
          setSelectedBudget(null);
        }}
        budget={selectedBudget}
        onDeleteBudget={handleDelete}
        onEditBudget={handleSaveBudget}
        onDeleteTransaction={handleDeleteTransaction}
        getCategoryName={getCategoryName}
        isReadOnly={activeTab === "history"}
      />
    </motion.div>
  );
}
