import SavingsModal from "../../components/SavingsModal.jsx";
import SavingsCardModal from "../../components/SavingsCardModal.jsx";
import SavingsHeader from "../../components/savings/SavingsHeader.jsx";
import SavingsStats from "../../components/savings/SavingsStats.jsx";
import SavingsCharts from "../../components/savings/SavingsCharts.jsx";
import SavingsFilters from "../../components/savings/SavingsFilters.jsx";
import ActiveSavingsList from "../../components/savings/ActiveSavingsList.jsx";
import SavingsHistoryTable from "../../components/savings/SavingsHistoryTable.jsx";

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
  } = useSavingsPageLogic();

  const userCurrency = user?.currency || "USD";

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <SavingsHeader onAddSaving={handleCreate} />

      <SavingsStats stats={stats} userCurrency={userCurrency} />

      {activeTab === "active" && (
        <SavingsCharts savings={activeSavings} userCurrency={userCurrency} />
      )}

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

      <div className="space-y-6">
        {activeTab === "active" && (
          <ActiveSavingsList
            savings={activeSavings}
            getProgressInfo={getProgressInfo}
            handleCardClick={handleCardClick}
            userCurrency={userCurrency}
          />
        )}

        {activeTab === "history" && (
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
      />
    </div>
  );
}
