import React from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { AppShell } from './components/layout/AppShell.jsx';
import { LoginPage } from './features/auth/LoginPage.jsx';
import { DashboardPage } from './features/dashboard/DashboardPage.jsx';
import { InventoryListPage } from './features/inventory/InventoryListPage.jsx';
import { ProductDetailPage } from './features/inventory/ProductDetailPage.jsx';
import { SupplierListPage } from './features/suppliers/SupplierListPage.jsx';
import { SupplierDetailPage } from './features/suppliers/SupplierDetailPage.jsx';
import { SupplierOrderListPage } from './features/supplier-orders/SupplierOrderListPage.jsx';
import { SupplierOrderDetailPage } from './features/supplier-orders/SupplierOrderDetailPage.jsx';
import { JobCardListPage } from './features/jobs/JobCardListPage.jsx';
import { JobCardCreatePage } from './features/jobs/JobCardCreatePage.jsx';
import { JobCardDetailPage } from './features/jobs/JobCardDetailPage.jsx';
import { EngineJobListPage } from './features/jobs/EngineJobListPage.jsx';
import { EngineJobCreatePage } from './features/jobs/EngineJobCreatePage.jsx';
import { InvoiceListPage } from './features/billing/InvoiceListPage.jsx';
import { InvoiceCreatePage } from './features/billing/InvoiceCreatePage.jsx';
import { InvoiceDetailPage } from './features/billing/InvoiceDetailPage.jsx';
import { OutstandingPage } from './features/billing/OutstandingPage.jsx';
import { ExpenseListPage } from './features/expenses/ExpenseListPage.jsx';
import { PageSkeleton } from './components/ui/Skeleton.jsx';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <PageSkeleton />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <PageSkeleton />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      {/* Protected Routes inside AppShell */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Products & Inventory */}
        <Route path="/inventory" element={<InventoryListPage />} />
        <Route path="/inventory/:id" element={<ProductDetailPage />} />

        {/* Suppliers & Supplier Orders */}
        <Route path="/suppliers" element={<SupplierListPage />} />
        <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
        <Route path="/supplier-orders" element={<SupplierOrderListPage />} />
        <Route path="/supplier-orders/:id" element={<SupplierOrderDetailPage />} />

        {/* Full Service Jobs */}
        <Route path="/jobs/full-service" element={<JobCardListPage />} />
        <Route path="/jobs/full-service/new" element={<JobCardCreatePage />} />
        <Route path="/jobs/full-service/:id" element={<JobCardDetailPage />} />

        {/* Engine Jobs */}
        <Route path="/jobs/engine-job" element={<EngineJobListPage />} />
        <Route path="/jobs/engine-job/new" element={<EngineJobCreatePage />} />
        <Route path="/jobs/engine-job/:id" element={<JobCardDetailPage />} />

        {/* Billing & Invoicing */}
        <Route path="/invoices" element={<InvoiceListPage />} />
        <Route path="/invoices/new" element={<InvoiceCreatePage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />

        {/* Outstanding & Receivables (Khata) */}
        <Route path="/outstanding" element={<OutstandingPage />} />

        {/* Operating Expenses (OPEX) */}
        <Route path="/expenses" element={<ExpenseListPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
