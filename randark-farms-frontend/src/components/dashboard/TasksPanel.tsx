import React from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Task } from '@/types';
import { formatDate, isOverdue } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';

interface TasksPanelProps {
  tasks: Task[];
  title?: string;
  onTaskClick?: (taskId: string) => void;
}

const TasksPanel: React.FC<TasksPanelProps> = ({ tasks, title = "Today's Tasks", onTaskClick }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500">No tasks for today.</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onTaskClick?.(task.id)}
              className="flex items-start gap-3 p-2 -mx-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            >
              <div className="mt-0.5">
                {task.status === 'Completed' ? (
                  <CheckCircle2 size={18} className="text-green-500" />
                ) : (
                  <Circle size={18} className={isOverdue(task.due_date) ? 'text-red-500' : 'text-gray-400'} />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-xs text-gray-500">
                  {task.farm?.name || ''} {task.field?.name ? `· ${task.field.name}` : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{formatDate(task.due_date)}</p>
                <Badge variant={task.priority === 'Urgent' ? 'danger' : task.priority === 'High' ? 'warning' : 'neutral'}>
                  {task.priority}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default TasksPanel;