import { useRef } from "react";
import { User, Mail, CreditCard, ChevronRight, Camera, Save, Loader2 } from "lucide-react";
import { SUPPORTED_CURRENCIES } from "../../utils/currency";

export default function ProfileSettings({
  formData,
  setFormData,
  previewUrl,
  setPreviewUrl,
  setAvatarFile,
  onSave,
  isSaving,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 pb-8 border-b border-gray-100">
        <div className="relative group shrink-0">
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-4xl font-bold text-gray-400 border-4 border-white shadow-lg overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{formData.name?.[0]?.toUpperCase() || "U"}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="absolute bottom-1 right-1 p-3 bg-white rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-gray-900 transition-colors hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Camera size={18} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">Your Profile</h3>
          <p className="text-gray-500 text-base">
            Update your photo and personal details here.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-2.5">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Full Name
          </label>
          <div className="relative">
            <User
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-base focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all placeholder:text-gray-400"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Email Address
          </label>
          <div className="relative">
            <Mail
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 text-base cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-1">
            Email address cannot be changed.
          </p>
        </div>

        <div className="space-y-2.5">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Currency
          </label>
          <div className="relative">
            <CreditCard
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />


            <select
              value={formData.currency}
              onChange={(e) =>
                setFormData({ ...formData, currency: e.target.value })
              }
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-base focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none appearance-none cursor-pointer hover:border-gray-300 transition-colors"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol}) - {c.name}
                </option>
              ))}
            </select>
            <ChevronRight
              size={20}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none"
            />
          </div>
        </div>
      </div>


      <div className="flex justify-end pt-8 border-t border-gray-100">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          <span>{isSaving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>
    </div>
  );
}
