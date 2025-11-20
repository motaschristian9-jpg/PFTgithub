export default function MainView({ children }) {
  return (
    <main className="flex-1 p-6 space-y-6 overflow-auto relative z-10">
      {/* This will render the current page content */}
      <div className="min-h-[calc(100vh-200px)]">
        {children}
      </div>
    </main>
  );
}
