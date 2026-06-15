import React, { useContext } from 'react';
import DashboardScreen from '../../components/dashboard/DashboardScreen';
import { AuthContext } from '../../context/AuthContext';
import { bindDashboardContent, fanDashboardContent } from '../../data/dashboardContent';

export default function FanDashboardScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const dashboardProps = bindDashboardContent(fanDashboardContent, navigation);

  return <DashboardScreen {...dashboardProps} onLogout={logout} />;
}
