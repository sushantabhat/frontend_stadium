import React, { useContext } from 'react';
import DashboardScreen from '../../components/dashboard/DashboardScreen';
import { AuthContext } from '../../context/AuthContext';
import { bindDashboardContent, staffDashboardContent } from '../../data/dashboardContent';

export default function StaffDashboardScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const dashboardProps = bindDashboardContent(staffDashboardContent, navigation);

  return <DashboardScreen {...dashboardProps} onLogout={logout} />;
}
