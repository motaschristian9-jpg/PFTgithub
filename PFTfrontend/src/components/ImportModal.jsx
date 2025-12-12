import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { X, Upload, FileText, Check, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import { format, parse, isValid } from "date-fns";
import { showSuccess, showError } from "../utils/swal";
import { motion, AnimatePresence } from "framer-motion";

const ImportModal = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
  }, []);

  const resetState = () => {
    setFile(null);
    setPreview([]);
    setError(null);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith('.csv')) {
            setError("Please upload a valid CSV file.");
            return;
        }
        setFile(selectedFile);
        setError(null);
        parseFile(selectedFile);
    }
  };

  const parseFile = (file) => {
    setIsProcessing(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsProcessing(false);
        if (results.data && results.data.length > 0) {
            // Validate first 3 rows
            const valid = validateStructure(results.data[0]);
            if (valid) {
                setPreview(results.data.slice(0, 5));
            } else {
                setError("Invalid CSV format. Required columns: Date, Amount, Type, Name/Description");
                setFile(null);
            }
        } else {
            setError("File is empty.");
            setFile(null);
        }
      },
      error: (err) => {
        setIsProcessing(false);
        setError("Error parsing file: " + err.message);
      }
    });
  };

  const validateStructure = (row) => {
      // Basic flexible check
      const keys = Object.keys(row).map(k => k.toLowerCase());
      const hasDate = keys.some(k => k.includes('date'));
      const hasAmount = keys.some(k => k.includes('amount'));
      return hasDate && hasAmount;
  };

  const processImport = async () => {
    setIsProcessing(true);
    setError(null);
    
    // re-parse full file to get all rows
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            try {
                const formattedData = [];
                
                for (let i = 0; i < results.data.length; i++) {
                    const row = results.data[i];
                    // Map logic
                    const keys = Object.keys(row);
                    const getDate = (k) => row[keys.find(key => key.toLowerCase().includes('date'))];
                    const getAmount = () => row[keys.find(key => key.toLowerCase().includes('amount'))];
                    const getType = () => {
                        const val = row[keys.find(key => key.toLowerCase().includes('type'))];
                        return val ? val.toLowerCase() : (Number(getAmount()) < 0 ? 'expense' : 'income');
                    };
                    const getCategory = () => row[keys.find(key => key.toLowerCase().includes('category'))];
                    const getName = () => row[keys.find(key => key.toLowerCase().includes('name') || key.toLowerCase().includes('description') || key.toLowerCase().includes('memo'))] || "Imported Transaction";

                    // Amount Validation
                    const amountRaw = getAmount();
                    const amountVal = Number(amountRaw);
                    
                    if (isNaN(amountVal)) {
                         throw new Error(`Row ${i + 1} has an invalid amount: "${amountRaw}". Please only use numbers.`);
                    }

                    // Date parsing attempts
                    let dateStr = getDate();
                    let dateObj = new Date(dateStr);
                    if (!isValid(dateObj)) {
                        dateObj = new Date(); 
                    }
                    const formattedDate = format(dateObj, 'yyyy-MM-dd');

                    formattedData.push({
                        date: formattedDate,
                        amount: Math.abs(amountVal),
                        type: getType().includes('inc') ? 'income' : 'expense',
                        name: getName(),
                        category: getCategory(), // Add category
                        description: 'Imported via CSV'
                    });
                }

                await onImport(formattedData);
                handleClose();
                showSuccess(`Successfully imported ${formattedData.length} transactions.`);
            } catch (err) {
                const msg = err.message || "Import failed";
                setError(msg);
                // showError(msg); // Removed as per user request (modal handles error UI)
            } finally {
                setIsProcessing(false);
            }
        }
    });
  };

  if (!mounted) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative z-[10000]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Upload className="text-blue-600" size={24} />
                Import Transactions
            </h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-500 transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {!file ? (
                <div 
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all group"
                >
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileText size={32} />
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Click to upload CSV</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Required columns: Date, Name, Amount, Type
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                                <FileText size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                        <button onClick={resetState} className="text-red-500 hover:bg-red-50 p-2 rounded-lg text-sm font-medium transition-colors">
                            Remove
                        </button>
                    </div>

                    {preview.length > 0 && (
                        <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500">
                                    <tr>
                                        {Object.keys(preview[0]).slice(0, 3).map(key => (
                                            <th key={key} className="px-4 py-2 font-medium capitalize">{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {preview.map((row, i) => (
                                        <tr key={i} className="bg-white dark:bg-gray-800">
                                            {Object.values(row).slice(0, 3).map((val, j) => (
                                                <td key={j} className="px-4 py-2 text-gray-700 dark:text-gray-300">{val}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="bg-gray-50 p-2 text-center text-xs text-gray-500">
                                Showing first 5 rows
                            </div>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".csv" 
                className="hidden" 
            />
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
            <button 
                onClick={handleClose}
                className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                disabled={isProcessing}
            >
                Cancel
            </button>
            <button 
                onClick={processImport}
                disabled={!file || !!error || isProcessing}
                className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
            >
                {isProcessing ? 'Processing...' : 'Import Transactions'}
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ImportModal;
