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
import { useTransactionsPageLogic } from "../../hooks/useTransactionsPageLogic";
import TransactionModal from "../../components/TransactionModal.jsx";
import TransactionsHeader from "../../components/transactions/TransactionsHeader";
import TransactionsStats from "../../components/transactions/TransactionsStats";
import TransactionsFilters from "../../components/transactions/TransactionsFilters";
import TransactionsTable from "../../components/transactions/TransactionsTable";

export default function TransactionsPage() {
  const {
    modalOpen,
    setModalOpen,
    editingTransaction,
    setEditingTransaction,
    datePreset,
    setDatePreset,
    setPage,
    type,
    setType,
    search,
    setSearch,
    sortBy,
    setSortBy,
    sortOrder,
    categoryId,
    setCategoryId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    user,
    isLoading,
    isFetching,
    isError,
    transactions,
    totalIncome,
    totalExpenses,
    pagination,
    filteredCategories,
    handleEdit,
    handleDelete,
    handleSort,
    isCreatingTransaction,
    updatingTransactionId,
  } = useTransactionsPageLogic();

  const userCurrency = user?.currency || "USD";
  const netBalance = totalIncome - totalExpenses;

  return (
    <motion.div 
      className="space-y-6 p-6 lg:p-8 max-w-[1600px] mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <TransactionsHeader
          onAddTransaction={() => {
            setEditingTransaction(null);
            setModalOpen(true);
          }}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <TransactionsStats
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          netBalance={netBalance}
          userCurrency={userCurrency}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <TransactionsFilters
          search={search}
          setSearch={setSearch}
          setPage={setPage}
          pagination={pagination}
          type={type}
          setType={setType}
          setCategoryId={setCategoryId}
          categoryId={categoryId}
          filteredCategories={filteredCategories}
          datePreset={datePreset}
          setDatePreset={setDatePreset}
          sortBy={sortBy}
          setSortBy={setSortBy}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <TransactionsTable
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          transactions={transactions}
          pagination={pagination}
          handleSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          userCurrency={userCurrency}
          isCreatingTransaction={isCreatingTransaction}
          updatingTransactionId={updatingTransactionId}
        />
      </motion.div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTransaction(null);
        }}
        onTransactionAdded={() => setPage(1)}
        editMode={!!editingTransaction}
        transactionToEdit={editingTransaction}
      />
    </motion.div>
  );
}
