import { useMemo } from "react";
import { PlusCircle, MinusCircle, PieChart, Target } from "lucide-react";
import { useCategories } from "./useCategories";

// 1. Optimization: Move static configuration OUTSIDE the hook.
// These don't rely on props or state, so they shouldn't be re-created on every render.
const CONFIGS = {
  income: {
    title: "Add Income",
    bgGradient: "from-green-200/30 to-green-300/20",
    borderColor: "border-green-100/50",
    gradient: "from-green-500 to-green-600",
  },
  expense: {
    title: "Add Expense",
    bgGradient: "from-red-200/30 to-red-300/20",
    borderColor: "border-red-100/50",
    gradient: "from-red-500 to-red-600",
  },
  budget: {
    title: "Add Budget",
    bgGradient: "from-blue-200/30 to-blue-300/20",
    borderColor: "border-blue-100/50",
    gradient: "from-blue-500 to-blue-600",
  },
  goal: {
    title: "Add Goal",
    bgGradient: "from-purple-200/30 to-purple-300/20",
    borderColor: "border-purple-100/50",
    gradient: "from-purple-500 to-purple-600",
  },
};

const ICONS = {
  income: PlusCircle,
  expense: MinusCircle,
  budget: PieChart,
  goal: Target,
};

export const useModalFormHooks = (type) => {
  const { data: categoriesData } = useCategories();

  // 2. Optimization: Memoize the filtering logic.
  // This ensures we don't re-loop through the array unless the data actually changes.
  const { expenseCategories, incomeCategories } = useMemo(() => {
    const data = categoriesData?.data || [];
    return {
      expenseCategories: data.filter((cat) => cat.type === "expense"),
      incomeCategories: data.filter((cat) => cat.type === "income"),
    };
  }, [categoriesData]);

  const config = CONFIGS[type] || CONFIGS.income;
  const IconComponent = ICONS[type] || PlusCircle;

  return {
    config,
    IconComponent,
    expenseCategories,
    incomeCategories,
  };
};
