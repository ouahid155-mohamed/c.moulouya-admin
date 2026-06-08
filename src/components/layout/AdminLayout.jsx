import Sidebar from "./Sidebar";
import "./AdminLayout.css";

export default function AdminLayout({ children }) {
  return (
    <div className="al-wrapper">
      <Sidebar />
      <main className="al-main">
        {children}
      </main>
    </div>
  );
}
