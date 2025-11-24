import { PlusCircle, MinusCircle, PieChart, Target } from "lucide-react";
import { useCategories } from "./useCategories";

export const useModalFormHooks = (type) => {
  const { data: categoriesData, isLoading } = useCategories();

  const expenseCategories = categoriesData?.data?.filter(cat => cat.type === 'expense') || [];
  const incomeCategories = categoriesData?.data?.filter(cat => cat.type === 'income') || [];

  const configs = {
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

  const icons = {
    income: PlusCircle,
    expense: MinusCircle,
    budget: PieChart,
    goal: Target,
  };

  const config = configs[type] || configs.income;
  const IconComponent = icons[type] || PlusCircle;

  return {
    config,
    IconComponent,
    expenseCategories,
    incomeCategories,
  };
};
