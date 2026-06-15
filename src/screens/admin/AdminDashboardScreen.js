import React, { useContext } from 'react';
import DashboardScreen from '../../components/dashboard/DashboardScreen';
import { AuthContext } from '../../context/AuthContext';
import { bindDashboardContent, adminDashboardContent } from '../../data/dashboardContent';

export default function AdminDashboardScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const dashboardProps = bindDashboardContent(adminDashboardContent, navigation);

  return <DashboardScreen {...dashboardProps} onLogout={logout} />;
}
