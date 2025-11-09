import { Outlet } from "react-router-dom";

export default function MainView() {
  return (
    <main className="flex-1 p-6 space-y-6 overflow-auto relative z-10">
      <Outlet />
    </main>
  );
}
