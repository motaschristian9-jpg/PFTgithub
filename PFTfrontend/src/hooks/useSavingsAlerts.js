import { useRef } from "react";
import MySwal, { showSuccess, showError, baseConfig } from "../utils/swal";
import { formatCurrency } from "../utils/currency";
import { useTranslation } from "react-i18next";

  export const useSavingsAlerts = ({
  userCurrency,
  stats,
  availableBalance,
  setLocalSaving,
  setIsSaving,
  optimisticUpdateGlobal,
  rollbackOptimisticGlobal,
  optimisticUpdateSavingsList,
  updateSavingMutation,
  handleCreateContributionTransaction,
  handleCreateWithdrawalTransaction,
  localSaving,
  onClose,
}) => {
  const isSwalOpen = useRef(false);
  const { t } = useTranslation();

  const handleQuickContribute = () => {
    if (isSwalOpen.current) return;
    isSwalOpen.current = true;

    const formattedAvailableBalance = formatCurrency(
      availableBalance ?? 0,
      userCurrency
    );

    MySwal.fire({
      ...baseConfig,
      title: t('app.savings.alerts.addContributionTitle'),
      html: `
        <input id="swal-amount" type="number" step="0.01" class="block w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-bold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all" placeholder="${t('app.savings.alerts.addContributionPlaceholder')}">
        <div class="flex items-center justify-between mt-3 px-1">
           <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">${t('app.savings.alerts.availableBalance')}</span>
           <span class="text-sm font-bold text-gray-900 dark:text-gray-200 font-mono">${formattedAvailableBalance}</span>
        </div>
        <div class="mt-2 px-1 text-left">
           <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
             <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             ${t('app.savings.alerts.recordedAsExpense')}
           </span>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: t('app.savings.alerts.contributeBtn'),
      cancelButtonText: t('app.savings.card.cancelBtn'),
      customClass: {
        ...baseConfig.customClass,
        confirmButton:
          "bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl shadow-lg transition-colors mx-2",
        // Keep baseConfig cancelButton or override if needed. baseConfig uses gray-50/gray-700 which is good.
      },
      didClose: () => {
        isSwalOpen.current = false;
      },
      preConfirm: () => {
        const amount = parseFloat(document.getElementById("swal-amount").value);
        if (isNaN(amount) || amount <= 0) {
          MySwal.showValidationMessage(t('app.savings.alerts.validAmount'));
          return false;
        }
        if (availableBalance !== undefined && amount > availableBalance) {
          MySwal.showValidationMessage(
            `${t('app.savings.alerts.insufficientFunds')}${formattedAvailableBalance}`
          );
          return false;
        }
        return amount;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const amountToAdd = result.value;
        setIsSaving(true);

        const newCurrentAmount = stats.current + amountToAdd;

        setLocalSaving((prev) => ({
          ...prev,
          current_amount: newCurrentAmount.toString(),
        }));
        
        // Optimistic update for the parent list
        if (optimisticUpdateSavingsList) {
          optimisticUpdateSavingsList(localSaving.id, newCurrentAmount);
        }

        const tempTxId = Date.now();
        const tempTransaction = {
          id: tempTxId,
          amount: amountToAdd,
          name: `Deposit: ${localSaving.name}`,
          description: `Funds transferred to savings goal: ${localSaving.name}`,
          date: new Date().toISOString(),
          type: "expense",
          pending: true,
        };

        // 1. Optimistic Update - REMOVED (Handled by useCreateTransaction)
        // optimisticUpdateGlobal(tempTransaction);

        try {
          // 2. Parallel execution
          const response = await (handleCreateContributionTransaction
            ? handleCreateContributionTransaction(
                amountToAdd,
                localSaving.name,
                localSaving.id
              )
            : Promise.resolve(null));

          // If backend observer works, the invalidation below will fetch correct data
          // But we keep optimistic update for immediate feedback
          
          if (!response) throw new Error("Transaction creation failed");

          showSuccess(
            t('app.savings.alerts.contributionAddedTitle'),
            t('app.savings.alerts.contributionAddedMsg', { 
                amount: formatCurrency(amountToAdd, userCurrency), 
                name: localSaving.name 
            })
          );
        } catch (error) {
          console.error("Error adding contribution", error);
          // 4. Rollback on Error
          // rollbackOptimisticGlobal(tempTxId); // Rollback handled by query mutation 
          showError(t('app.savings.alerts.errorTitle'), t('app.savings.alerts.addFailed'));
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const handleQuickWithdraw = () => {
    if (isSwalOpen.current) return;
    isSwalOpen.current = true;

    const formattedCurrent = formatCurrency(stats.current, userCurrency);

    MySwal.fire({
      ...baseConfig,
      title: t('app.savings.alerts.withdrawTitle'),
      html: `
        <input id="swal-withdraw-amount" type="number" step="0.01" class="block w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-bold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all" placeholder="${t('app.savings.alerts.withdrawPlaceholder')}">
        <div class="flex items-center justify-between mt-3 px-1">
           <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">${t('app.savings.alerts.availableToWithdraw')}</span>
           <span class="text-sm font-bold text-gray-900 dark:text-gray-200 font-mono">${formattedCurrent}</span>
        </div>
        <div class="mt-2 px-1 text-left">
           <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-900/30 text-xs font-semibold text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-800/50">
             <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             ${t('app.savings.alerts.recordedAsIncome')}
           </span>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: t('app.savings.alerts.withdrawBtn'),
      cancelButtonText: t('app.savings.card.cancelBtn'),
      customClass: {
        ...baseConfig.customClass,
        confirmButton:
          "bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-xl shadow-lg transition-colors mx-2",
      },
      didClose: () => {
        isSwalOpen.current = false;
      },
      preConfirm: () => {
        const amount = parseFloat(
          document.getElementById("swal-withdraw-amount").value
        );
        if (isNaN(amount) || amount <= 0) {
          MySwal.showValidationMessage(t('app.savings.alerts.validAmount'));
          return false;
        }
        if (amount > stats.current) {
          MySwal.showValidationMessage(t('app.savings.alerts.cannotWithdrawMore'));
          return false;
        }
        return amount;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const amountToWithdraw = result.value;
        setIsSaving(true);

        const newCurrentAmount = Math.max(0, stats.current - amountToWithdraw);

        setLocalSaving((prev) => ({
          ...prev,
          current_amount: newCurrentAmount.toString(),
        }));
        
        // Optimistic update for the parent list
        if (optimisticUpdateSavingsList) {
          optimisticUpdateSavingsList(localSaving.id, newCurrentAmount);
        }

        const tempTxId = Date.now();
        const tempTransaction = {
          id: tempTxId,
          amount: amountToWithdraw,
          name: `Withdrawal: ${localSaving.name}`,
          description: `Funds moved from savings goal: ${localSaving.name}`,
          date: new Date().toISOString(),
          type: "income",
          pending: true,
        };

        // 1. Optimistic Update - REMOVED (Handled by useCreateTransaction)
        // optimisticUpdateGlobal(tempTransaction);

        try {
          // 2. Parallel execution (Withdrawal)
          const response = await (handleCreateWithdrawalTransaction
            ? handleCreateWithdrawalTransaction(
                amountToWithdraw,
                localSaving.name,
                localSaving.id
              )
            : Promise.resolve(null));
            
          if (!response) throw new Error("Transaction creation failed");

          const wasDeleted = response?.deleted;

          if (wasDeleted) {
            showSuccess(
              t('app.savings.alerts.withdrawnDeletedTitle'),
              t('app.savings.alerts.withdrawnDeletedMsg', {
                  amount: formatCurrency(amountToWithdraw, userCurrency)
              })
            );
            onClose();
          } else {
            showSuccess(
              t('app.savings.alerts.withdrawnTitle'),
              t('app.savings.alerts.withdrawnMsg', {
                  amount: formatCurrency(amountToWithdraw, userCurrency),
                  name: localSaving.name
              })
            );
          }
        } catch (error) {
          console.error("Error withdrawing", error);
          // 4. Rollback on Error
          // rollbackOptimisticGlobal(tempTxId); // Rollback handled by query mutation
          showError(t('app.savings.alerts.errorTitle'), t('app.savings.alerts.withdrawFailed'));
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  return { handleQuickContribute, handleQuickWithdraw };
};
