import React, { useState, useEffect } from 'react';
import { Settings, Shield, UserCheck, Save, History, FileText, CheckCircle2 } from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
} from '../../components/ui/Table.jsx';
import { TableSkeleton } from '../../components/ui/Skeleton.jsx';
import { formatDateTime } from '../../utils/formatters.js';

export const SettingsPage = () => {
  const [data, setData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPagination, setAuditPagination] = useState(null);
  const [auditPage, setAuditPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    garageName: '',
    tagline: '',
    phone: '',
    email: '',
    address: '',
    gstNumber: '',
  });

  const toast = useToast();

  const fetchSettingsAndAudit = async () => {
    try {
      setLoading(true);
      const [settingsRes, auditRes] = await Promise.all([
        api.get('/settings'),
        api.get('/settings/audit-logs', { params: { page: auditPage, limit: 20 } }),
      ]);
      setData(settingsRes.data);
      setFormData({
        garageName: settingsRes.data.settings?.garageName || '',
        tagline: settingsRes.data.settings?.tagline || '',
        phone: settingsRes.data.settings?.phone || '',
        email: settingsRes.data.settings?.email || '',
        address: settingsRes.data.settings?.address || '',
        gstNumber: settingsRes.data.settings?.gstNumber || '',
      });
      setAuditLogs(auditRes.data);
      setAuditPagination(auditRes.pagination);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndAudit();
  }, [auditPage]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', formData);
      toast.success('Garage profile and settings updated successfully');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <TableSkeleton rows={8} cols={4} />;

  const { partners = [], employees = [], serviceTypes = [] } = data || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & System Configuration"
        subtitle="Manage garage branding, partner equity ratios, technician staff, and immutable audit logs."
      />

      {/* Garage Profile Settings */}
      <Card title="1. Garage Information & Invoice Header">
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Garage Business Name"
              required
              value={formData.garageName}
              onChange={(e) => setFormData({ ...formData, garageName: e.target.value })}
            />

            <Input
              label="Business Tagline / Subtitle"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Primary Contact Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="GSTIN / Tax ID"
              placeholder="e.g. 24AAAAA0000A1Z5"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
            />
          </div>

          <Input
            label="Workshop Physical Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" loading={saving} icon={Save}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Partner Configuration Overview (Configurable, Section 23) */}
      <Card title="2. Partner Ownership Equity Configuration" subtitle="Configurable partner ratios (Default 50% / 50%)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {partners.map((p) => (
            <div key={p._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                <Badge variant="accent">{p.ownershipPercentage}% Ownership</Badge>
              </div>
              <div className="text-xs text-slate-500">
                Code: <span className="font-mono font-bold text-slate-700">{p.code}</span> • Phone: {p.phone || '—'}
              </div>
              <div className="text-xs text-slate-500">Email: {p.email || '—'}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Technicians & Employees */}
      <Card title="3. Registered Employees & Mechanics" subtitle="Workshop technicians assigned to service job cards">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {employees.map((emp) => (
            <div key={emp._id} className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs space-y-1">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900">{emp.name}</div>
                <Badge variant="default">{emp.role}</Badge>
              </div>
              <div className="text-slate-500">Code: {emp.employeeCode}</div>
              <div className="text-slate-500">Phone: {emp.phone}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tamper-Proof Audit Logs Trail Viewer */}
      <Card
        title="4. Immutable Activity Audit Log"
        subtitle="Chronological record of status overrides, stock adjustments, invoice generation, payments, and settlements"
        noPadding
      >
        {auditLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No audit logs recorded yet.</div>
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User / Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Summary / Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log._id} hover={false}>
                    <TableCell className="text-xs text-slate-500 font-mono">
                      {formatDateTime(log.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-slate-900">{log.userName}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{log.userRole?.toLowerCase()}</div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-600 font-mono">{log.entityType}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-800 max-w-md">{log.summary}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination pagination={auditPagination} onPageChange={(newPage) => setAuditPage(newPage)} />
          </div>
        )}
      </Card>
    </div>
  );
};
