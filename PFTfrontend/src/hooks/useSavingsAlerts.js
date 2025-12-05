import { useRef } from "react";
import MySwal, { showSuccess, showError } from "../utils/swal";
import { formatCurrency } from "../utils/currency";

export const useSavingsAlerts = ({
  userCurrency,
  stats,
  availableBalance,
  setLocalSaving,
  setIsSaving,
  optimisticUpdateGlobal,
  rollbackOptimisticGlobal,
  updateSavingMutation,
  handleCreateContributionTransaction,
  handleCreateWithdrawalTransaction,
  localSaving,
  onClose,
}) => {
  const isSwalOpen = useRef(false);

  const handleQuickContribute = () => {
    if (isSwalOpen.current) return;
    isSwalOpen.current = true;

    const formattedAvailableBalance = formatCurrency(
      availableBalance ?? 0,
      userCurrency
    );

    MySwal.fire({
      title: "Add Contribution",
      html: `
        <input id="swal-amount" type="number" step="0.01" class="swal2-input custom-swal-input" placeholder="Amount to add (e.g., 50.00)">
        <div class="text-sm text-gray-500 mt-2">Available Net Balance: ${formattedAvailableBalance}</div>
        <div class="text-xs text-emerald-600 font-medium mt-1">(Recorded as Expense)</div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Contribute",
      customClass: {
        container: "z-[10000]",
        confirmButton:
          "bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl shadow-lg transition-colors mx-2",
        cancelButton:
          "text-gray-600 hover:bg-gray-100 font-medium py-2 px-4 rounded-xl transition-colors mx-2",
        popup: "rounded-2xl shadow-2xl border border-gray-100 p-6",
        input:
          "h-10 mt-2 mb-4 rounded-lg border border-gray-300 text-base px-3 w-full box-border",
      },
      buttonsStyling: false,
      didClose: () => {
        isSwalOpen.current = false;
      },
      preConfirm: () => {
        const amount = parseFloat(document.getElementById("swal-amount").value);
        if (isNaN(amount) || amount <= 0) {
          MySwal.showValidationMessage("Please enter a valid amount.");
          return false;
        }
        if (availableBalance !== undefined && amount > availableBalance) {
          MySwal.showValidationMessage(
            `Insufficient funds. Available: ${formattedAvailableBalance}`
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

        // 1. Optimistic Update
        optimisticUpdateGlobal(tempTransaction);

        try {
          // 2. Parallel execution
          await Promise.all([
            updateSavingMutation.mutateAsync({
              id: localSaving.id,
              data: { ...localSaving, current_amount: newCurrentAmount },
            }),
            handleCreateContributionTransaction
              ? handleCreateContributionTransaction(
                  amountToAdd,
                  localSaving.name,
                  localSaving.id
                )
              : Promise.resolve(null),
          ]);

          showSuccess(
            "Contribution Added!",
            `${formatCurrency(amountToAdd, userCurrency)} added to ${
              localSaving.name
            }.`
          );
        } catch (error) {
          console.error("Error adding contribution", error);
          // 4. Rollback on Error
          rollbackOptimisticGlobal(tempTxId);
          showError("Error", "Failed to add contribution.");
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
      title: "Withdraw Funds",
      html: `
        <input id="swal-withdraw-amount" type="number" step="0.01" class="swal2-input custom-swal-input" placeholder="Amount to withdraw">
        <div class="text-sm text-gray-500 mt-2">Available to Withdraw: ${formattedCurrent}</div>
        <div class="text-xs text-rose-600 font-medium mt-1">(Recorded as Income)</div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Withdraw",
      customClass: {
        container: "z-[10000]",
        confirmButton:
          "bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-xl shadow-lg transition-colors mx-2",
        cancelButton:
          "text-gray-600 hover:bg-gray-100 font-medium py-2 px-4 rounded-xl transition-colors mx-2",
        popup: "rounded-2xl shadow-2xl border border-gray-100 p-6",
        input:
          "h-10 mt-2 mb-4 rounded-lg border border-gray-300 text-base px-3 w-full box-border",
      },
      buttonsStyling: false,
      didClose: () => {
        isSwalOpen.current = false;
      },
      preConfirm: () => {
        const amount = parseFloat(
          document.getElementById("swal-withdraw-amount").value
        );
        if (isNaN(amount) || amount <= 0) {
          MySwal.showValidationMessage("Please enter a valid amount.");
          return false;
        }
        if (amount > stats.current) {
          MySwal.showValidationMessage("Cannot withdraw more than saved.");
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

        // 1. Optimistic Update
        optimisticUpdateGlobal(tempTransaction);

        try {
          // 2. Parallel execution
          const [response] = await Promise.all([
            updateSavingMutation.mutateAsync({
              id: localSaving.id,
              data: { ...localSaving, current_amount: newCurrentAmount },
            }),
            handleCreateWithdrawalTransaction
              ? handleCreateWithdrawalTransaction(
                  amountToWithdraw,
                  localSaving.name,
                  localSaving.id
                )
              : Promise.resolve(null),
          ]);

          const wasDeleted = response?.deleted;

          if (wasDeleted) {
            showSuccess(
              "Withdrawn & Deleted",
              `${formatCurrency(
                amountToWithdraw,
                userCurrency
              )} withdrawn. Goal deleted as it is empty.`
            );
            onClose();
          } else {
            showSuccess(
              "Withdrawn!",
              `${formatCurrency(
                amountToWithdraw,
                userCurrency
              )} withdrawn from ${localSaving.name}.`
            );
          }
        } catch (error) {
          console.error("Error withdrawing", error);
          // 4. Rollback on Error
          rollbackOptimisticGlobal(tempTxId);
          showError("Error", "Failed to withdraw funds.");
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  return { handleQuickContribute, handleQuickWithdraw };
};
