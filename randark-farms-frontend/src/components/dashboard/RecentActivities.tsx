import React from 'react';
import Card from '@/components/ui/Card';
import { Activity } from '@/types';
import { formatDate } from '@/lib/utils';

interface RecentActivitiesProps {
  activities: Activity[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
      <div className="space-y-2">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500">No recent activities.</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium">{activity.activity_type}</p>
                <p className="text-xs text-gray-500">
                  {activity.farm?.name} {activity.field?.name ? `· ${activity.field.name}` : ''}
                </p>
              </div>
              <span className="text-xs text-gray-500">{formatDate(activity.date)}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default RecentActivities;