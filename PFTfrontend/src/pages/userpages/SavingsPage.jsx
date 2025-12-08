import React from "react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars

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

import SavingsModal from "../../components/SavingsModal.jsx";
import SavingsCardModal from "../../components/SavingsCardModal.jsx";
import SavingsHeader from "../../components/savings/SavingsHeader.jsx";
import SavingsStats from "../../components/savings/SavingsStats.jsx";
import SavingsCharts from "../../components/savings/SavingsCharts.jsx";
import SavingsFilters from "../../components/savings/SavingsFilters.jsx";
import ActiveSavingsList from "../../components/savings/ActiveSavingsList.jsx";
import SavingsHistoryTable from "../../components/savings/SavingsHistoryTable.jsx";
import SavingsHistoryCharts from "../../components/savings/SavingsHistoryCharts.jsx";

import { useSavingsPageLogic } from "../../hooks/useSavingsPageLogic";

export default function SavingsPage() {
  const {
    isFormModalOpen,
    setIsFormModalOpen,
    isCardModalOpen,
    setIsCardModalOpen,
    selectedSaving,
    setSelectedSaving,
    activeTab,
    setActiveTab,
    historyPage,
    setHistoryPage,
    search,
    setSearch,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    user,
    activeSavings,
    historySavings,
    historyLoading,
    stats,
    getProgressInfo,
    handleCreate,
    handleCardClick,
    handleSave,
    handleDeleteTransaction,
    handleDelete,
    historyTotalPages,
    availableBalance,
    totalActiveCount,
    handleCreateContributionTransaction,
    handleCreateWithdrawalTransaction,
  } = useSavingsPageLogic();

  const userCurrency = user?.currency || "USD";

  return (
    <motion.div 
      className="space-y-8 p-4 sm:p-6 lg:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <SavingsHeader onAddSaving={handleCreate} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <SavingsStats stats={stats} userCurrency={userCurrency} />
      </motion.div>

      <motion.div variants={itemVariants}>
        {activeTab === "active" ? (
          <SavingsCharts savings={activeSavings} userCurrency={userCurrency} />
        ) : (
          <SavingsHistoryCharts 
            savings={historySavings} 
            userCurrency={userCurrency} 
          />
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <SavingsFilters
          search={search}
          setSearch={setSearch}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortDir={sortDir}
          setSortDir={setSortDir}
        />
      </motion.div>

      <div className="space-y-6">
        {activeTab === "active" ? (
          <motion.div variants={itemVariants}>
            <ActiveSavingsList
              savings={activeSavings}
              getProgressInfo={getProgressInfo}
              handleCardClick={handleCardClick}
              userCurrency={userCurrency}
            />
          </motion.div>
        ) : (
          <motion.div variants={itemVariants}>
            <SavingsHistoryTable
              savings={historySavings}
              loading={historyLoading}
              handleCardClick={handleCardClick}
              handleDelete={handleDelete}
              userCurrency={userCurrency}
              historyPage={historyPage}
              setHistoryPage={setHistoryPage}
              totalPages={historyTotalPages}
            />
          </motion.div>
        )}
      </div>

      <SavingsModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedSaving(null);
        }}
        onSave={handleSave}
        editMode={!!selectedSaving}
        saving={selectedSaving}
        activeCount={totalActiveCount}
      />

      <SavingsCardModal
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setSelectedSaving(null);
        }}
        saving={selectedSaving}
        onDeleteSaving={handleDelete}
        onDeleteTransaction={handleDeleteTransaction}
        availableBalance={availableBalance}
        handleCreateContributionTransaction={handleCreateContributionTransaction}
        handleCreateWithdrawalTransaction={handleCreateWithdrawalTransaction}
      />
    </motion.div>
  );
}
