import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Info,
  CreditCard,
  Package,
  Wrench,
  Users,
  Eye,
  RefreshCw,
  Search,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge, StatusBadge } from '../components/ui/Badge.jsx';
import { Input, CurrencyInput, Select, Textarea, SearchInput } from '../components/ui/Input.jsx';
import { Card, CalloutCard } from '../components/ui/Card.jsx';
import { KpiCard } from '../components/ui/KpiCard.jsx';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
} from '../components/ui/Table.jsx';
import { Modal, ConfirmDialog } from '../components/ui/Modal.jsx';
import { Skeleton, CardSkeleton, TableSkeleton, FormSkeleton } from '../components/ui/Skeleton.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { ErrorState } from '../components/ui/ErrorState.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  formatINR,
  formatNumber,
  formatDate,
  formatPhone,
  formatRegNumber,
} from '../utils/formatters.js';

export const DesignSystemShowcase = () => {
  const toast = useToast();

  // Interactive Component States
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(false);

  // Sample Table Data for demonstration
  const sampleTableData = [
    {
      id: 'NAG-INV-2026-0001',
      customer: 'Ahmed Khan',
      phone: '9876543210',
      bike: 'Honda Activa 6G',
      reg: 'GJ05AB1234',
      date: '2026-08-19',
      total: 2000,
      paid: 1000,
      outstanding: 1000,
      status: 'PARTIALLY_PAID',
    },
    {
      id: 'NAG-INV-2026-0002',
      customer: 'Rahul Verma',
      phone: '9898012345',
      bike: 'Hero Splendor Plus',
      reg: 'GJ05CD5678',
      date: '2026-08-18',
      total: 850,
      paid: 850,
      outstanding: 0,
      status: 'PAID',
    },
    {
      id: 'NAG-INV-2026-0003',
      customer: 'Suresh Patel',
      phone: '9724098765',
      bike: 'Bajaj Pulsar 150',
      reg: 'GJ05EF9012',
      date: '2026-08-17',
      total: 3500,
      paid: 0,
      outstanding: 3500,
      status: 'UNPAID',
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Page Header */}
      <PageHeader
        title="Design System Foundation"
        subtitle="Centralized design tokens, typography, and accessible UI primitives for National Auto Garage"
        breadcrumbs={[
          { label: 'Garage Workshop', to: '/dashboard' },
          { label: 'Design System Foundation' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant={showSkeletons ? 'accent' : 'outline'}
              size="sm"
              icon={RefreshCw}
              onClick={() => setShowSkeletons(!showSkeletons)}
            >
              {showSkeletons ? 'Hide Loading Skeletons' : 'Preview Skeletons'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              onClick={() =>
                toast.success('Design system token updated and ready for next phases!')
              }
            >
              Verify System
            </Button>
          </div>
        }
      />

      {/* 1. Color System & Design Tokens */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
            1. Global Color Tokens & Palette
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured palette for Dark Navy shell, Industrial Orange accent, neutrals, and semantic statuses.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xs">
            <div className="h-10 rounded-lg bg-slate-950 mb-2 border border-slate-800" />
            <div className="text-xs font-bold">Slate 900</div>
            <div className="text-[10px] text-slate-400">#0F172A (Shell & Text)</div>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="h-10 rounded-lg bg-orange-600 mb-2" />
            <div className="text-xs font-bold text-slate-900">Orange 600</div>
            <div className="text-[10px] text-slate-500">#EA580C (Accent)</div>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="h-10 rounded-lg bg-emerald-600 mb-2" />
            <div className="text-xs font-bold text-slate-900">Emerald 600</div>
            <div className="text-[10px] text-slate-500">#16A34A (Success / Paid)</div>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="h-10 rounded-lg bg-amber-500 mb-2" />
            <div className="text-xs font-bold text-slate-900">Amber 500</div>
            <div className="text-[10px] text-slate-500">#D97706 (Warning / Low Stock)</div>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="h-10 rounded-lg bg-rose-600 mb-2" />
            <div className="text-xs font-bold text-slate-900">Rose 600</div>
            <div className="text-[10px] text-slate-500">#DC2626 (Danger / Unpaid)</div>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="h-10 rounded-lg bg-blue-600 mb-2" />
            <div className="text-xs font-bold text-slate-900">Blue 600</div>
            <div className="text-[10px] text-slate-500">#2563EB (Info / Pending)</div>
          </div>
        </div>
      </section>

      {/* 2. Typography & Indian Formatting */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
            2. Typography & Indian Financial Formatting
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict Indian Rupee currency formats, formatted phone numbers, vehicle registrations, and clear text hierarchy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Financial & Metric Typography">
            <div className="space-y-3">
              <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                <span className="text-xs font-medium text-slate-500">Small Bill Amount:</span>
                <span className="text-lg font-bold text-slate-900">{formatINR(450)}</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                <span className="text-xs font-medium text-slate-500">Standard Service Bill:</span>
                <span className="text-xl font-extrabold text-slate-900">{formatINR(2000)}</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                <span className="text-xs font-medium text-slate-500">Monthly Cash Inflow:</span>
                <span className="text-2xl font-black text-emerald-600">{formatINR(125000)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-medium text-slate-500">50% Partner Net Share:</span>
                <span className="text-xl font-black text-orange-600">{formatINR(40000)}</span>
              </div>
            </div>
          </Card>

          <Card title="Entity & Domain Formatters">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs font-medium text-slate-500">Indian Mobile Number:</span>
                <span className="text-sm font-semibold text-slate-800 font-mono">
                  {formatPhone('9876543210')}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs font-medium text-slate-500">Bike Registration:</span>
                <span className="text-sm font-bold text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded">
                  {formatRegNumber('gj05ab1234')}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs font-medium text-slate-500">Date Formatting:</span>
                <span className="text-sm font-medium text-slate-700">
                  {formatDate('2026-08-19T00:00:00Z')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-500">Stock Quantity:</span>
                <span className="text-sm font-bold text-slate-900">{formatNumber(1500)} units</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 3. KPI & Stat Cards */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
            3. Operational & Financial KPI Cards
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Standardized cards for metrics, revenue, low stock counts, and receivables.
          </p>
        </div>

        {showSkeletons ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Today's Cash Collected"
              value={formatINR(8450)}
              subtitle="Realized payments"
              trend="+14.2%"
              trendDirection="up"
              variant="success"
              icon={CreditCard}
            />
            <KpiCard
              title="Customer Outstanding"
              value={formatINR(4500)}
              subtitle="Unpaid customer dues"
              trend="3 bills due"
              trendDirection="down"
              variant="danger"
              icon={AlertTriangle}
            />
            <KpiCard
              title="Active Service Jobs"
              value="8 Jobs"
              subtitle="5 Full Service, 3 Engine"
              variant="accent"
              icon={Wrench}
            />
            <KpiCard
              title="Low Stock Alerts"
              value="2 Items"
              subtitle="Reorder required"
              variant="warning"
              icon={Package}
            />
          </div>
        )}
      </section>

      {/* 4. Button System */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
            4. Unified Button System
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Variants, sizes, loading spinners, and disabled states across the application.
          </p>
        </div>

        <Card>
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                All Button Variants (Size: Medium)
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary (Slate 900)</Button>
                <Button variant="accent">Accent (Orange 600)</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="success">Success</Button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Button Sizes & Icons
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm" icon={Plus}>
                  Small Button (32px)
                </Button>
                <Button variant="accent" size="md" icon={Plus}>
                  Medium Button (40px)
                </Button>
                <Button variant="primary" size="lg" icon={Plus}>
                  Large Button (48px)
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  loading={buttonLoading}
                  onClick={() => {
                    setButtonLoading(true);
                    setTimeout(() => setButtonLoading(false), 2000);
                  }}
                >
                  {buttonLoading ? 'Saving...' : 'Click for Loading State'}
                </Button>
                <Button variant="secondary" size="md" disabled>
                  Disabled State
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 5. Status Badges System */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
            5. Status Badge System
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic status pills with semantic colors and indicator dots.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Inventory & Job Statuses">
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase block mb-2">
                  Inventory Stock Status:
                </span>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="IN_STOCK" />
                  <StatusBadge status="LOW_STOCK" />
                  <StatusBadge status="OUT_OF_STOCK" />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400 font-semibold uppercase block mb-2">
                  Service Job Status:
                </span>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="PENDING" />
                  <StatusBadge status="IN_PROGRESS" />
                  <StatusBadge status="COMPLETED" />
                  <StatusBadge status="DELIVERED" />
                  <StatusBadge status="CANCELLED" />
                </div>
              </div>
            </div>
          </Card>

          <Card title="Billing, Supplier & Payer Badges">
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase block mb-2">
                  Payment Statuses:
                </span>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="UNPAID" />
                  <StatusBadge status="PARTIALLY_PAID" />
                  <StatusBadge status="PAID" />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400 font-semibold uppercase block mb-2">
                  Payer Attribution & Vendors:
                </span>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="GARAGE_MONEY" />
                  <StatusBadge status="NAIM_PERSONAL" />
                  <StatusBadge status="IMRAN_PERSONAL" />
                  <StatusBadge status="ORDERED" />
                  <StatusBadge status="RECEIVED" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 6. Form Controls & Inputs */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
            6. Reusable Form Inputs & Selects
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Standard input controls with labels, required asterisks, helper text, and validation feedback.
          </p>
        </div>

        {showSkeletons ? (
          <FormSkeleton fields={4} />
        ) : (
          <Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Input
                label="Customer Name"
                placeholder="e.g. Ahmed Khan"
                required
                hint="Full name for invoice record"
              />
              <Input
                label="Mobile Number"
                type="tel"
                placeholder="9876543210"
                required
                hint="10-digit Indian mobile number"
              />
              <CurrencyInput
                label="Selling Price (₹)"
                placeholder="450"
                required
                hint="Retail MRP price"
              />
              <Select label="Payment Method" required>
                <option value="CASH">Cash Payment</option>
                <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="BANK_TRANSFER">Bank Transfer / IMPS</option>
                <option value="OTHER">Other</option>
              </Select>
              <Input
                label="Validation Error Example"
                defaultValue="Invalid Phone Number"
                error="Please enter a valid 10-digit phone number"
                required
              />
              <SearchInput
                value={searchValue}
                loading={searchLoading}
                onChange={(e) => setSearchValue(e.target.value)}
                onClear={() => setSearchValue('')}
                placeholder="Search products, customers, bills..."
              />
              <div className="sm:col-span-2 md:col-span-3">
                <Textarea
                  label="Customer Complaint / Service Details"
                  placeholder="e.g. Engine oil change, clutch adjustment, chain lubrication..."
                  rows={2}
                  hint="Free-text service problem notes"
                />
              </div>
            </div>
          </Card>
        )}
      </section>

      {/* 7. Responsive Data Table & Pagination */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
            7. Responsive Data Table & Pagination
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Standard table infrastructure with horizontal scroll protection, formatted columns, and row hovers.
          </p>
        </div>

        {showSkeletons ? (
          <TableSkeleton rows={3} cols={6} />
        ) : (
          <div className="space-y-2">
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Bill No</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Bike & Reg</TableHead>
                  <TableHead>Bill Total</TableHead>
                  <TableHead>Paid / Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {sampleTableData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono font-bold text-xs text-slate-900">
                      {row.id}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{row.customer}</div>
                      <div className="text-xs text-slate-500 font-mono">{formatPhone(row.phone)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-800">{row.bike}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        {formatRegNumber(row.reg)}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">
                      {formatINR(row.total)}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-emerald-600">
                        Paid: {formatINR(row.paid)}
                      </div>
                      {row.outstanding > 0 ? (
                        <div className="text-xs font-bold text-rose-600">
                          Due: {formatINR(row.outstanding)}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400">Due: ₹0</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast.info(`Inspecting bill ${row.id}`);
                            setModalOpen(true);
                          }}
                        >
                          View Bill
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination
              pagination={{
                page: currentPage,
                totalPages: 3,
                totalRecords: 12,
              }}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </section>

      {/* 8. Modals, Confirm Dialogs & Toast Triggers */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
            8. Modals, Confirmation Dialogs & Toasts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Accessible dialogs with keyboard Escape support, focus management, and non-intrusive feedback toasts.
          </p>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Dialog Triggers
              </h4>
              <div className="flex flex-wrap gap-2.5">
                <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
                  Open Sample Modal
                </Button>
                <Button variant="danger" size="md" onClick={() => setConfirmOpen(true)}>
                  Open Confirm Dialog
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Toast Feedback Triggers
              </h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success('Payment of ₹1,000 recorded successfully.')}
                >
                  Success Toast
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.error('Payment amount cannot exceed outstanding balance.')}
                >
                  Error Toast
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.warning('Low stock alert: Castrol Engine Oil (2 units remaining).')}
                >
                  Warning Toast
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info('Customer profile updated.')}
                >
                  Info Toast
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 9. Feedback States (Callouts, Empty & Error States) */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
            9. Information Callouts, Empty & Error States
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Clean empty state illustrations, error recoveries, and informational callouts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CalloutCard title="Cash-Based Model" type="info">
            Only money actually collected is considered available cash for 50/50 partner division.
          </CalloutCard>
          <CalloutCard title="Low Stock Warning" type="warning">
            2 spare parts have fallen below their minimum required threshold levels.
          </CalloutCard>
          <CalloutCard title="Payment Clearance" type="success">
            All customer invoices for today have been fully settled with zero outstanding.
          </CalloutCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EmptyState
            title="No Outstanding Receivables"
            description="All customer bills are currently paid in full. There are no unpaid balances."
            actionText="View Paid Invoices"
            onAction={() => toast.info('Viewing all paid invoices')}
          />
          <ErrorState
            title="Unable to Load Workshop Records"
            message="There was an issue connecting to the local database. Please check your connection and retry."
            onRetry={() => toast.info('Retrying connection...')}
          />
        </div>
      </section>

      {/* Sample Modal Instance */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Sample Modal Dialog"
        subtitle="Accessible dialog with backdrop and escape key support"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setModalOpen(false);
                toast.success('Action saved in modal!');
              }}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            This modal demonstrates the standard dialog container with responsive padding, smooth fade/zoom animations, and focus containment.
          </p>
          <Input label="Sample Field" placeholder="Enter details..." defaultValue="Sample input value" />
        </div>
      </Modal>

      {/* Sample Confirm Dialog Instance */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          toast.error('Action confirmed.');
        }}
        title="Confirm Cancellation"
        message="Are you sure you want to cancel this service job? This action will mark the status as CANCELLED."
        confirmText="Yes, Cancel Job"
        variant="danger"
      />
    </div>
  );
};
