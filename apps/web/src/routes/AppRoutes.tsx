import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminShell from '../app/AdminShell';
import {
  AdminBlogPage,
  AdminChangeManagementPage,
  AdminInquiriesPage,
  AdminOverviewPage,
  AdminPricingPage,
  AdminProjectsPage,
  AdminQuotationPage,
  AdminServicesPage,
  ArticlePage,
  DashboardPage,
  HomePage,
  LoginPage,
  PaymentsPage,
  ProjectsPage,
  RegisterPage,
} from '../pages';
import { RequireAdmin, RequireAuth } from './guards';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/article/:slug" element={<ArticlePage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AdminShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/projects" element={<ProjectsPage />} />
          <Route path="/dashboard/payments" element={<PaymentsPage />} />
        </Route>
      </Route>

      <Route element={<RequireAdmin />}>
        <Route element={<AdminShell />}>
          <Route path="/admin/overview" element={<AdminOverviewPage />} />
          <Route path="/admin/services" element={<AdminServicesPage />} />
          <Route path="/admin/pricing" element={<AdminPricingPage />} />
          <Route path="/admin/projects" element={<AdminProjectsPage />} />
          <Route path="/admin/blog" element={<AdminBlogPage />} />
          <Route path="/admin/inquiries" element={<AdminInquiriesPage />} />
          <Route path="/admin/change-management" element={<AdminChangeManagementPage />} />
          <Route path="/admin/quotation" element={<AdminQuotationPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
