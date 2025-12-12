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
import { useTransactionsPageLogic } from "../../hooks/useTransactionsPageLogic";
import TransactionModal from "../../components/TransactionModal.jsx";
import ImportModal from "../../components/ImportModal.jsx";
import { useBulkCreateTransactions } from "../../hooks/useTransactions";
import TransactionsHeader from "../../components/transactions/TransactionsHeader";
import TransactionsStats from "../../components/transactions/TransactionsStats";
import TransactionsFilters from "../../components/transactions/TransactionsFilters";
import TransactionsTable from "../../components/transactions/TransactionsTable";
import Papa from "papaparse";
import { format } from "date-fns";

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

  const { mutateAsync: bulkCreate } = useBulkCreateTransactions();
  const [importModalOpen, setImportModalOpen] = React.useState(false);

  const handleImport = async (data) => {
      try {
          await bulkCreate({ transactions: data });
      } catch (error) {
          console.error("Import error in page:", error);
      }
  };

  const handleExport = () => {
    if (!transactions || transactions.length === 0) {
        return;
    }

    // Format data for CSV
    const csvData = transactions.map(t => ({
        Date: format(new Date(t.date), 'yyyy-MM-dd'), // Ensure standard ISO format
        Category: t.category ? t.category.name : 'Uncategorized',
        Name: t.name,
        Amount: t.amount,
        Type: t.type,
        Description: t.description || ''
    }));

    // Convert to CSV string
    const csv = Papa.unparse(csvData);

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


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
          onImport={() => setImportModalOpen(true)}
          onExport={handleExport}
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
          onPageChange={setPage}
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

      <ImportModal url=""
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
      />
    </motion.div>
  );
}
