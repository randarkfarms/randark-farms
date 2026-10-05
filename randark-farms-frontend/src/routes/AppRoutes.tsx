import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Spinner from '@/components/ui/Spinner';

const Login = lazy(() => import('@/pages/Login'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Farms = lazy(() => import('@/pages/Farms'));
const FarmDetail = lazy(() => import('@/pages/FarmDetail'));
const Fields = lazy(() => import('@/pages/Fields'));
const FieldDetail = lazy(() => import('@/pages/FieldDetail'));
const Crops = lazy(() => import('@/pages/Crops'));
const Activities = lazy(() => import('@/pages/Activities'));
const Spraying = lazy(() => import('@/pages/Spraying'));
const Fertilizers = lazy(() => import('@/pages/Fertilizers'));
const Expenses = lazy(() => import('@/pages/Expenses'));
const Harvests = lazy(() => import('@/pages/Harvests'));
const Inventory = lazy(() => import('@/pages/Inventory'));
const Equipment = lazy(() => import('@/pages/Equipment'));
const Tasks = lazy(() => import('@/pages/Tasks'));
const Reports = lazy(() => import('@/pages/Reports'));
const Settings = lazy(() => import('@/pages/Settings'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner size={40} /></div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Outlet />
              </DashboardLayout>
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/farms" element={<Farms />} />
          <Route path="/farms/:id" element={<FarmDetail />} />
          <Route path="/fields" element={<Fields />} />
          <Route path="/fields/:id" element={<FieldDetail />} />
          <Route path="/crops" element={<Crops />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/spraying" element={<Spraying />} />
          <Route path="/fertilizers" element={<Fertilizers />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/harvests" element={<Harvests />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;