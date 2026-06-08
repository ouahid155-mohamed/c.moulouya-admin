import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute   from "./components/PrivateRoute";
import AdminLayout    from "./components/layout/AdminLayout";
import Login          from "./pages/auth/Login";
import Dashboard      from "./pages/Dashboard";
import Profile        from "./pages/profile/Profile";
import Messages       from "./pages/contact/Messages";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword  from "./pages/auth/ResetPassword";

// CMS Pages
import CmsTexts       from "./pages/cms/CmsTexts";
import CmsSpecialties from "./pages/cms/CmsSpecialties";
import CmsStats       from "./pages/cms/CmsStats";
import CmsContact     from "./pages/cms/CmsContact";
import CmsFaq         from "./pages/cms/CmsFaq";
import CmsMedia       from "./pages/cms/CmsMedia";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protégé avec layout */}
        <Route element={<PrivateRoute />}>
          <Route element={<AdminLayout><Dashboard /></AdminLayout>} path="/" />
          <Route element={<AdminLayout><Profile /></AdminLayout>}   path="/profile" />
          <Route element={<AdminLayout><Messages /></AdminLayout>}  path="/messages" />
          
          {/* CMS Routes */}
          <Route element={<AdminLayout><CmsTexts /></AdminLayout>}        path="/cms/texts" />
          <Route element={<AdminLayout><CmsSpecialties /></AdminLayout>}  path="/cms/specialties" />
          <Route element={<AdminLayout><CmsStats /></AdminLayout>}        path="/cms/stats" />
          <Route element={<AdminLayout><CmsContact /></AdminLayout>}      path="/cms/contact" />
          <Route element={<AdminLayout><CmsFaq /></AdminLayout>}          path="/cms/faq" />
          <Route element={<AdminLayout><CmsMedia /></AdminLayout>}        path="/cms/media" />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
