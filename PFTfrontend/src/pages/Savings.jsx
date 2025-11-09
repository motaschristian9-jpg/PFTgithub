export default function Savings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            Savings
          </h1>
          <p className="text-gray-600 mt-1">
            Plan and track your savings goals
          </p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-green-100/50">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Savings Page
          </h3>
          <p className="text-gray-600">
            This page will help you set and track progress towards your savings goals.
          </p>
        </div>
      </div>
    </div>
  );
}
