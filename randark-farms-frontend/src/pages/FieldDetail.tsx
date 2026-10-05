import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fieldService, activityService, cropService } from '@/services/api';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Sprout,
  Activity,
  Plus,
  Clock,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

type Tab = 'overview' | 'timeline';

const FieldDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Guard: don't fetch if id is missing or literally "undefined"
  const hasValidId = !!id && id !== 'undefined' && id !== 'null';

  const { data: field, isLoading } = useQuery({
    queryKey: ['field', id],
    queryFn: () => fieldService.getById(id!),
    enabled: hasValidId,
  });

  const { data: activities } = useQuery({
    queryKey: ['field-activities', id],
    queryFn: () => activityService.getAll({ field_id: id }),
    enabled: hasValidId,
  });

  const { data: crops } = useQuery({
    queryKey: ['field-crops', id],
    queryFn: () => cropService.getAll({ field_id: id }),
    enabled: hasValidId,
  });

  // Sorted copy (never mutate the query result)
  const sortedActivities = useMemo(() => {
    if (!activities) return [];
    return [...activities].sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [activities]);

  // Invalid id in URL
  if (!hasValidId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-semibold text-amber-800 mb-1">
          Invalid field link
        </h2>
        <p className="text-sm text-amber-700 mb-4">
          The field ID in the URL is missing or invalid. Try opening the field
          from the list.
        </p>
        <Button onClick={() => navigate('/fields')}>
          <ArrowLeft size={16} className="mr-2" />
          Back to Fields
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={40} />
      </div>
    );
  }

  if (!field) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-1">Field not found</h2>
        <p className="text-sm text-gray-500 mb-4">
          This field may have been deleted or the link is incorrect.
        </p>
        <Button onClick={() => navigate('/fields')}>
          <ArrowLeft size={16} className="mr-2" />
          Back to Fields
        </Button>
      </div>
    );
  }

  // Backend populates farm_id into { _id, name } — but TS thinks it's a string.
  // Cast to any to read the name safely.
  const farmId: any = field.farm_id;
  const farmObj: any = (field as any).farm;
  const farmName: string =
    farmId?.name || farmObj?.name || '—';

  const currentCrop: string = (crops as any)?.[0]?.name || '—';

  return (
    <div>
      <button
        onClick={() => navigate('/fields')}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Fields
      </button>

      <PageHeader
        title={field.name}
        subtitle={`${farmName} · ${(field as any).area || 0} ${(field as any).area_unit || ''}`}
        actionLabel="Add Activity"
        onAction={() => navigate('/activities')}
        icon={<Plus size={16} />}
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'timeline'
              ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Activity Timeline
          {sortedActivities.length > 0 && (
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {sortedActivities.length}
            </span>
          )}
        </button>
      </div>

      {/* ── OVERVIEW ───────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <Sprout size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Current Crop
                </p>
                <p className="font-semibold truncate">{currentCrop}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Area
                </p>
                <p className="font-semibold">
                  {(field as any).area || 0} {(field as any).area_unit || ''}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Planting Date
                </p>
                <p className="font-semibold">
                  {(field as any).planting_date
                    ? formatDate((field as any).planting_date)
                    : '—'}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                <Activity size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Status
                </p>
                <Badge variant="success">
                  {(field as any).status || 'Unknown'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── TIMELINE ───────────────────────────────── */}
      {activeTab === 'timeline' && (
        <>
          {sortedActivities.length > 0 ? (
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-emerald-200 dark:bg-emerald-900/50" />

              <div className="space-y-5">
                {sortedActivities.map((activity: any) => (
                  <div
                    key={activity._id || activity.id}
                    className="relative pl-8"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-2 flex h-4 w-4 items-center justify-center rounded-full border-2 border-emerald-500 bg-white dark:bg-gray-900">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                        <p className="font-semibold">
                          {activity.activity_type || 'Activity'}
                        </p>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={12} />
                          {activity.date ? formatDate(activity.date) : '—'}
                        </span>
                      </div>

                      {activity.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.description}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        {activity.cost != null && (
                          <span>
                            Cost: <strong>{activity.cost}</strong>
                          </span>
                        )}
                        {activity.person_involved && (
                          <span>By: {activity.person_involved}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Activity size={40} />}
              title="No activities recorded"
              description="Log an activity to build this field's timeline."
              actionLabel="Add Activity"
              onAction={() => navigate('/activities')}
            />
          )}
        </>
      )}
    </div>
  );
};

export default FieldDetail;