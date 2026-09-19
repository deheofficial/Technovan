import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks';

export function RequireAuth() {
  const location = useLocation();
  const token = useAppSelector((state) => state.auth.token);
  return token ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

export function RequireAdmin() {
  const location = useLocation();
  const { token, user } = useAppSelector((state) => state.auth);
  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user?.role !== 'ADMIN' && user?.role !== 'SUPPORT') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
