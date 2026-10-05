import React from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { InventoryItem } from '@/types';

interface InventoryAlertsProps {
  items: InventoryItem[];
}

const InventoryAlerts: React.FC<InventoryAlertsProps> = ({ items }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Inventory Alerts</h3>
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No low stock items.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {item.quantity} {item.unit} remaining
                </p>
              </div>
              <Badge variant="danger">Low Stock</Badge>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default InventoryAlerts;