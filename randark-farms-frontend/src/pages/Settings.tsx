import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PageHeader from '@/components/layout/PageHeader';
import { User, Save } from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="font-semibold mb-4">Farm Information</h3>
            <div className="space-y-4">
              <Input label="Farm Name" defaultValue="Randark Farms" />
              <Input label="Contact Email" defaultValue={user?.email} />
              <Input label="Phone Number" placeholder="+233 XX XXX XXXX" />
              <Input label="Default Currency" defaultValue="GH₵" disabled />
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">System Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Date Format</label>
                <select className="input">
                  <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                  <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                  <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="label">Area Unit</label>
                <select className="input">
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                <label className="text-sm">Enable email notifications</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                <label className="text-sm">Enable browser notifications</label>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold mb-4">Account</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-brand-700 text-white flex items-center justify-center">
                <User size={24} />
              </div>
              <div>
                <p className="font-semibold">{user?.name || 'Admin'}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <Button className="w-full">
              <Save size={16} className="mr-2" />
              Save Changes
            </Button>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Data Management</h3>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full">Export All Data</Button>
              <Button variant="secondary" className="w-full">Backup Database</Button>
              <Button variant="danger" className="w-full">Clear All Data</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;