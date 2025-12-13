import React from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

const BudgetHeader = ({ onAddBudget }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t('app.budgets.header.title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('app.budgets.header.subtitle')}
        </p>
      </div>

      <button
        onClick={onAddBudget}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
      >
        <Plus size={18} />
        <span>{t('app.budgets.header.createBtn')}</span>
      </button>
    </div>
  );
};

export default BudgetHeader;
