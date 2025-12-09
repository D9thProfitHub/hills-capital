import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton
} from '@mui/material';
import {
  People,
  TrendingUp,
  SmartToy,
  ContentCopy,
  Notifications,
  AttachMoney,
  Visibility,
  Edit
} from '@mui/icons-material';
import { statsApi } from '../../../services/adminApi';

const AdminHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeInvestments: 0,
    pendingBotRequests: 0,
    pendingCopyTrading: 0,
    activeSubscribers: 0,
    totalRevenue: 0,
    totalActiveInvestmentValue: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [topInvestors, setTopInvestors] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivities();
    fetchTopInvestors();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data } = await statsApi.getOverview();
      setStats({
        totalUsers: data.totalUsers || 0,
        activeInvestments: data.activeInvestments || 0,
        pendingBotRequests: data.pendingBotRequests || 0,
        pendingCopyTrading: data.pendingCopyTrading || 0,
        activeSubscribers: data.activeSubscribers || 0,
        totalRevenue: data.totalRevenue || 0,
        totalActiveInvestmentValue: data.totalActiveInvestmentValue || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const { data } = await statsApi.getRecentActivities();
      setRecentActivities(data.data || []);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    }
  };

  const fetchTopInvestors = async () => {
    try {
      const { data } = await statsApi.getTopInvestors();
      setTopInvestors(data.data || []);
    } catch (error) {
      console.error('Error fetching top investors:', error);
      setTopInvestors([]);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: '50%',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {React.cloneElement(icon, { sx: { color: `${color}.main`, fontSize: 30 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'active': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard Overview
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={<People />}
            color="primary"
            subtitle={`${stats.totalUsers} registered users`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={<AttachMoney />}
            color="info"
            subtitle={`Total platform revenue`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Bot Requests"
            value={stats.pendingBotRequests}
            icon={<SmartToy />}
            color="warning"
            subtitle={stats.pendingBotRequests > 0 ? `${stats.pendingBotRequests} pending approval` : 'No pending requests'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Copy Trading"
            value={stats.pendingCopyTrading}
            icon={<ContentCopy />}
            color="secondary"
            subtitle={stats.pendingCopyTrading > 0 ? `${stats.pendingCopyTrading} pending requests` : 'No active requests'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Subscribers"
            value={stats.activeSubscribers}
            icon={<Notifications />}
            color="error"
            subtitle={`${stats.activeSubscribers} of ${stats.totalUsers} users subscribed`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Plan/Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{activity.user}</TableCell>
                        <TableCell>{activity.action}</TableCell>
                        <TableCell>{activity.amount}</TableCell>
                        <TableCell>{activity.plan}</TableCell>
                        <TableCell>
                          <Chip
                            label={activity.status}
                            color={getStatusColor(activity.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{activity.time}</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>


      </Grid>
    </Box>
  );
};

export default AdminHome;
