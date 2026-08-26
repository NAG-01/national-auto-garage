import React from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { AppShell } from './components/layout/AppShell.jsx';
import { LoginPage } from './features/auth/LoginPage.jsx';
import { DesignSystemShowcase } from './pages/DesignSystemShowcase.jsx';
import { DashboardPage } from './features/dashboard/DashboardPage.jsx';
import { InventoryListPage } from './features/inventory/InventoryListPage.jsx';
import { ProductDetailPage } from './features/inventory/ProductDetailPage.jsx';
import { SupplierListPage } from './features/suppliers/SupplierListPage.jsx';
import { SupplierDetailPage } from './features/suppliers/SupplierDetailPage.jsx';
import { SupplierOrderListPage } from './features/supplier-orders/SupplierOrderListPage.jsx';
import { SupplierOrderDetailPage } from './features/supplier-orders/SupplierOrderDetailPage.jsx';
import { CustomerListPage } from './features/customers/CustomerListPage.jsx';
import { CustomerDetailPage } from './features/customers/CustomerDetailPage.jsx';
import { VehicleListPage } from './features/vehicles/VehicleListPage.jsx';
import { VehicleDetailPage } from './features/vehicles/VehicleDetailPage.jsx';
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
import { PartnershipPage } from './features/partnership/PartnershipPage.jsx';
import { ReportsPage } from './features/reports/ReportsPage.jsx';
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

        {/* Phase 12 Live Module: Operations Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Phase 4 Live Module: Products & Inventory */}
        <Route path="/inventory" element={<InventoryListPage />} />
        <Route path="/inventory/:id" element={<ProductDetailPage />} />

        {/* Phase 5 Live Module: Suppliers & Supplier Orders */}
        <Route path="/suppliers" element={<SupplierListPage />} />
        <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
        <Route path="/supplier-orders" element={<SupplierOrderListPage />} />
        <Route path="/supplier-orders/:id" element={<SupplierOrderDetailPage />} />

        {/* Phase 6 Live Module: Customers & Bikes */}
        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />

        {/* Phase 6 Live Module: Vehicles Fleet Directory */}
        <Route path="/vehicles" element={<VehicleListPage />} />
        <Route path="/vehicles/:id" element={<VehicleDetailPage />} />

        {/* Phase 7 Live Module: Full Service Jobs */}
        <Route path="/jobs/full-service" element={<JobCardListPage />} />
        <Route path="/jobs/full-service/new" element={<JobCardCreatePage />} />
        <Route path="/jobs/full-service/:id" element={<JobCardDetailPage />} />

        {/* Phase 8 Live Module: Engine Jobs */}
        <Route path="/jobs/engine-job" element={<EngineJobListPage />} />
        <Route path="/jobs/engine-job/new" element={<EngineJobCreatePage />} />
        <Route path="/jobs/engine-job/:id" element={<JobCardDetailPage />} />

        {/* Phase 9 Live Module: Billing & Invoicing */}
        <Route path="/invoices" element={<InvoiceListPage />} />
        <Route path="/invoices/new" element={<InvoiceCreatePage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />

        {/* Phase 10 Live Module: Outstanding & Receivables */}
        <Route path="/outstanding" element={<OutstandingPage />} />

        {/* Phase 13 Live Module: Operating Expenses (OPEX) */}
        <Route path="/expenses" element={<ExpenseListPage />} />

        {/* Phase 11 Live Module: Partnership & Monthly Settlement */}
        <Route path="/partnership" element={<PartnershipPage />} />

        {/* Phase 14 Live Module: Workshop Reports & Financial Analytics */}
        <Route path="/reports" element={<ReportsPage />} />

        <Route path="/design-system" element={<DesignSystemShowcase />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
