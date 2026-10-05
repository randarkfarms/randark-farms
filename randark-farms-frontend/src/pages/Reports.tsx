import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportService, farmService } from '@/services/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/layout/PageHeader';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/hooks/useToast';
import {
  FileText,
  Download,
  Activity,
  Droplets,
  Leaf,
  Wallet,
  Package,
  Wrench,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

const Reports: React.FC = () => {
  const { showToast } = useToast();
  const [selectedReport, setSelectedReport] = useState('activities');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [farmId, setFarmId] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { data: farms } = useQuery({
    queryKey: ['farms'],
    queryFn: () => farmService.getAll(),
  });

  const reportTypes = [
    { id: 'activities', label: 'Activity Report', icon: Activity },
    { id: 'spraying', label: 'Spraying Report', icon: Droplets },
    { id: 'fertilizers', label: 'Fertilizer Report', icon: Leaf },
    { id: 'expenses', label: 'Expense Report', icon: Wallet },
    { id: 'harvests', label: 'Harvest Report', icon: Package },
    { id: 'inventory', label: 'Inventory Report', icon: Package },
    { id: 'equipment', label: 'Equipment Report', icon: Wrench },
  ];

  // Normalize whatever shape the backend returns into a plain array
  const normalizeRows = (raw: any): any[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.results)) return raw.results;
    if (Array.isArray(raw.rows)) return raw.rows;
    if (Array.isArray(raw.report)) return raw.report;
    if (Array.isArray(raw.records)) return raw.records;
    if (Array.isArray(raw.items)) return raw.items;
    return [];
  };

  const buildFilters = () => ({
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    farm_id: farmId || undefined,
  });

  const generateReport = async () => {
    setLoading(true);
    setReportData(null);
    try {
      const filters = buildFilters();
      console.log('GENERATE REPORT REQUEST:', {
        reportType: selectedReport,
        filters,
      });

      const raw = await reportService.generateReport(selectedReport, filters);
      console.log('GENERATE REPORT RESPONSE:', raw);

      const rows = normalizeRows(raw);

      if (rows.length === 0) {
        showToast('Report generated but no matching records found', 'error');
      } else {
        showToast(`Report generated (${rows.length} records)`);
      }

      setReportData({ rows, raw });
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to generate report';
      console.error('GENERATE REPORT FAILED:', {
        status,
        data: error?.response?.data,
        error,
      });
      showToast(`${message}${status ? ` (${status})` : ''}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const filters = buildFilters();
      const blob = await reportService.exportCSV(selectedReport, filters);
      const url = window.URL.createObjectURL(blob as any);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedReport}_report.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('CSV downloaded');
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to export CSV';
      console.error('EXPORT CSV FAILED:', error?.response?.data || error);
      showToast(message, 'error');
    }
  };

  const renderReportTable = () => {
    const rows = reportData?.rows || [];

    if (rows.length === 0) {
      return (
        <p className="text-gray-500">
          No records match the selected filters. Try widening the date range or
          clearing the farm filter.
        </p>
      );
    }

    if (selectedReport === 'activities') {
      return (
        <Table headers={['Date', 'Activity', 'Farm', 'Field', 'Description']}>
          {rows.map((item: any, i: number) => (
            <TableRow key={item._id || item.id || i}>
              <TableCell>{item.date ? formatDate(item.date) : '-'}</TableCell>
              <TableCell>{item.activity_type || '-'}</TableCell>
              <TableCell>{item.farm_id?.name || item.farm?.name || '-'}</TableCell>
              <TableCell>{item.field_id?.name || item.field?.name || '-'}</TableCell>
              <TableCell>{item.description || item.notes || '-'}</TableCell>
            </TableRow>
          ))}
        </Table>
      );
    }

    if (selectedReport === 'spraying') {
      return (
        <Table headers={['Date', 'Product', 'Farm', 'Field', 'Quantity', 'Cost']}>
          {rows.map((item: any, i: number) => (
            <TableRow key={item._id || item.id || i}>
              <TableCell>{item.date ? formatDate(item.date) : '-'}</TableCell>
              <TableCell>{item.product_name || '-'}</TableCell>
              <TableCell>{item.farm_id?.name || item.farm?.name || '-'}</TableCell>
              <TableCell>{item.field_id?.name || item.field?.name || '-'}</TableCell>
              <TableCell>
                {item.quantity_used ?? '-'} {item.unit || ''}
              </TableCell>
              <TableCell>
                {item.cost != null ? formatCurrency(item.cost) : '-'}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      );
    }

    if (selectedReport === 'fertilizers') {
      return (
        <Table headers={['Date', 'Fertilizer', 'Farm', 'Field', 'Quantity', 'Cost']}>
          {rows.map((item: any, i: number) => (
            <TableRow key={item._id || item.id || i}>
              <TableCell>{item.date ? formatDate(item.date) : '-'}</TableCell>
              <TableCell>{item.fertilizer_name || '-'}</TableCell>
              <TableCell>{item.farm_id?.name || item.farm?.name || '-'}</TableCell>
              <TableCell>{item.field_id?.name || item.field?.name || '-'}</TableCell>
              <TableCell>
                {item.quantity ?? '-'} {item.unit || ''}
              </TableCell>
              <TableCell>
                {item.cost != null ? formatCurrency(item.cost) : '-'}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      );
    }

    if (selectedReport === 'expenses') {
      return (
        <Table headers={['Date', 'Category', 'Description', 'Farm', 'Amount']}>
          {rows.map((item: any, i: number) => (
            <TableRow key={item._id || item.id || i}>
              <TableCell>{item.date ? formatDate(item.date) : '-'}</TableCell>
              <TableCell>{item.category || '-'}</TableCell>
              <TableCell>{item.description || '-'}</TableCell>
              <TableCell>{item.farm_id?.name || item.farm?.name || '-'}</TableCell>
              <TableCell>
                {item.amount != null ? formatCurrency(item.amount) : '-'}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      );
    }

    if (selectedReport === 'harvests') {
      return (
        <Table headers={['Date', 'Crop', 'Farm', 'Quantity', 'Revenue']}>
          {rows.map((item: any, i: number) => (
            <TableRow key={item._id || item.id || i}>
              <TableCell>{item.date ? formatDate(item.date) : '-'}</TableCell>
              <TableCell>{item.crop_id?.name || item.crop?.name || '-'}</TableCell>
              <TableCell>{item.farm_id?.name || item.farm?.name || '-'}</TableCell>
              <TableCell>
                {item.quantity ?? '-'} {item.unit || ''}
              </TableCell>
              <TableCell>{formatCurrency(item.total_revenue || 0)}</TableCell>
            </TableRow>
          ))}
        </Table>
      );
    }

    // Generic fallback for inventory, equipment, and anything else
    const firstRow = rows[0] || {};
    const keys = Object.keys(firstRow).filter(
      (k) =>
        k !== '_id' &&
        k !== 'id' &&
        k !== '__v' &&
        k !== 'createdAt' &&
        k !== 'updatedAt'
    );

    return (
      <Table headers={keys}>
        {rows.map((item: any, i: number) => (
          <TableRow key={item._id || item.id || i}>
            {keys.map((key) => {
              const value = item[key];
              let display: string;
              if (value == null) display = '-';
              else if (typeof value === 'object' && !Array.isArray(value))
                display = value.name || value._id || '-';
              else if (Array.isArray(value)) display = value.length.toString();
              else display = String(value);
              return <TableCell key={key}>{display}</TableCell>;
            })}
          </TableRow>
        ))}
      </Table>
    );
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Generate and export professional reports"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold mb-3">Report Type</h3>
            <div className="space-y-2">
              {reportTypes.map((report) => (
                <button
                  key={report.id}
                  onClick={() => {
                    setSelectedReport(report.id);
                    setReportData(null);
                  }}
                  className={`w-full flex items-center gap-2 p-2 rounded text-left text-sm transition-colors ${
                    selectedReport === report.id
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <report.icon size={16} />
                  {report.label}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-3">Filters</h3>
            <div className="space-y-3">
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <Select
                label="Farm"
                placeholder="All Farms"
                options={
                  farms?.map((f: any) => ({ value: f._id || f.id, label: f.name })) || []
                }
                value={farmId}
                onChange={(e) => setFarmId(e.target.value)}
              />
              <Button onClick={generateReport} loading={loading} className="w-full">
                <FileText size={16} className="mr-2" />
                Generate Report
              </Button>
              {reportData && reportData.rows?.length > 0 && (
                <Button onClick={exportCSV} variant="secondary" className="w-full">
                  <Download size={16} className="mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <h3 className="font-semibold mb-4">
              Report Results
              {reportData?.rows?.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({reportData.rows.length} records)
                </span>
              )}
            </h3>
            {loading ? (
              <div className="flex justify-center py-10">
                <Spinner size={32} />
              </div>
            ) : reportData ? (
              renderReportTable()
            ) : (
              <p className="text-gray-500">Select filters and generate a report.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;