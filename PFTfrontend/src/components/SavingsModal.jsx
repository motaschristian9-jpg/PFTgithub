import { useState, useEffect } from "react";
import { X, PiggyBank } from "lucide-react";

export default function SavingsModal({
  isOpen,
  onClose,
  onSave,
  editMode,
  saving,
}) {
  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    current_amount: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editMode && saving) {
      setFormData({
        name: saving.name || "",
        target_amount: saving.target_amount || "",
        current_amount: saving.current_amount || "",
        description: saving.description || "",
      });
    } else {
      setFormData({
        name: "",
        target_amount: "",
        current_amount: "",
        description: "",
      });
    }
    setErrors({});
  }, [editMode, saving, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const submitData = {
        ...formData,
        target_amount: parseFloat(formData.target_amount) || 0,
        current_amount: parseFloat(formData.current_amount) || 0,
      };

      if (editMode) {
        submitData.id = saving.id;
      }

      await onSave(submitData);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.message || "An error occurred" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <PiggyBank className="text-green-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {editMode ? "Edit Savings Goal" : "Create Savings Goal"}
              </h2>
              <p className="text-sm text-gray-500">
                {editMode ? "Update your savings goal" : "Set a new savings target"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                errors.name ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="e.g., Emergency Fund"
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
            )}
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.target_amount}
                onChange={(e) => handleInputChange("target_amount", e.target.value)}
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  errors.target_amount ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="0.00"
                required
              />
            </div>
            {errors.target_amount && (
              <p className="mt-1 text-sm text-red-600">{errors.target_amount[0]}</p>
            )}
          </div>

          {/* Current Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.current_amount}
                onChange={(e) => handleInputChange("current_amount", e.target.value)}
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  errors.current_amount ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.current_amount && (
              <p className="mt-1 text-sm text-red-600">{errors.current_amount[0]}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                errors.description ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Optional description..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description[0]}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : editMode ? "Update Goal" : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
