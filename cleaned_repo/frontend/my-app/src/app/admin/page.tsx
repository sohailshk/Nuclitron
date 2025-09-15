"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { MailTab } from '@/components/admin/MailTab';
import { 
  Users, 
  Database, 
  Settings, 
  Shield,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Mail,
  Filter,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";

// Types
interface SystemStat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface RecentActivity {
  id: number;
  type: string;
  message: string;
  time: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
}

interface SystemHealth {
  name: string;
  value: number;
  status: 'good' | 'warning' | 'critical';
}

const ADMIN_EMAILS = [
  'ashtondsouza192@gmail.com',
  // Add more admin emails here
];

export default function Admin() {
  const router = useRouter();
  const { isLoaded, userId, isSignedIn } = useAuth();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStat[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([]);

  // Check authentication and authorization
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    // Check if user is admin
    const checkAdmin = async () => {
      try {
        const email = user?.primaryEmailAddress?.emailAddress;
        const userIsAdmin = email ? ADMIN_EMAILS.includes(email) : false;
        setIsAdmin(userIsAdmin);
        
        if (!userIsAdmin) {
          toast.error('You do not have permission to access this page');
          router.push('/unauthorized');
          return;
        }

        // Load data
        await loadDashboardData();
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast.error('Failed to verify admin access');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [isLoaded, isSignedIn, router, user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API calls
      // const stats = await fetch('/api/admin/stats').then(res => res.json());
      // const activities = await fetch('/api/admin/activities').then(res => res.json());
      // const users = await fetch('/api/admin/users').then(res => res.json());
      // const health = await fetch('/api/admin/health').then(res => res.json());
      
      // Mock data - replace with actual API calls
      const mockStats: SystemStat[] = [
        {
          title: 'Total Users',
          value: '1,247',
          change: '+12%',
          trend: 'up',
          icon: Users,
          color: 'text-blue-600'
        },
        // ... other mock data
      ];
      
      setSystemStats(mockStats);
      // Set other states with mock data
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col space-y-6">
              <Skeleton className="h-12 w-1/3" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Skeleton className="h-80 rounded-lg" />
                <Skeleton className="h-80 rounded-lg" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center p-8">
          <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-primary-deep mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You don't have permission to access this page.</p>
          <Button onClick={() => router.push('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  // System health data
  const systemHealthData: SystemHealth[] = [
    { name: 'CPU Usage', value: 45, status: 'good' },
    { name: 'Memory Usage', value: 67, status: 'good' },
    { name: 'Disk Usage', value: 78, status: 'warning' },
    { name: 'Network Latency', value: 12, status: 'good' },
    { name: 'Database Connections', value: 23, status: 'good' }
  ];

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'mail', label: 'Mail', icon: Mail },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      {!isAdmin ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center p-8">
            <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-primary-deep mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">You don't have permission to access this page.</p>
            <Button onClick={() => router.push('/')}>Return to Home</Button>
          </div>
        </div>
      ) : (
        <>
          <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-primary-deep mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground">
                  System administration and data management for INCOIS ARGO platform
                </p>
              </div>
              <div className="flex items-center space-x-3 mt-4 md:mt-0">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </Button>
                <Button className="btn-ocean flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add User</span>
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {systemStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index} className="card-ocean">
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                            <p className="text-2xl font-bold text-primary-deep">{stat.value}</p>
                          </div>
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center`}>
                            <Icon className={`w-6 h-6 ${stat.color}`} />
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 mt-3">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">{stat.change}</span>
                          <span className="text-sm text-muted-foreground">from last week</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <Card className="card-ocean">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-primary-deep mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            activity.status === 'success' ? 'bg-green-500' : 
                            activity.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm text-primary-deep">{activity.message}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* System Health */}
                <Card className="card-ocean">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-primary-deep mb-6">System Health</h3>
                    <div className="space-y-4">
                      {systemHealth.map((health, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-primary-deep">{health.name}</span>
                            <span className="text-sm font-medium text-primary-deep">{health.value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getHealthColor(health.status)}`}
                              style={{ width: `${health.value}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <Card className="card-ocean">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-primary-deep">User Management</h3>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-semibold text-primary-deep">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-primary-deep">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-primary-deep">Role</th>
                          <th className="text-left py-3 px-4 font-semibold text-primary-deep">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-primary-deep">Last Login</th>
                          <th className="text-left py-3 px-4 font-semibold text-primary-deep">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b border-border/50 hover:bg-blue-50/50">
                            <td className="py-3 px-4 font-medium text-primary-deep">{user.name}</td>
                            <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                            <td className="py-3 px-4 text-muted-foreground">{user.role}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">{user.lastLogin}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Mail Tab */}
          {activeTab === 'mail' && <MailTab />}

          {/* Data Management Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="card-ocean">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-primary-deep mb-6">Data Quality</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Overall Quality Score</span>
                        <span className="text-2xl font-bold text-green-600">99.2%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Valid Profiles</span>
                        <span className="text-lg font-semibold text-primary-deep">2,384,567</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Invalid Profiles</span>
                        <span className="text-lg font-semibold text-red-600">19,433</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Pending Review</span>
                        <span className="text-lg font-semibold text-yellow-600">1,247</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="card-ocean">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-primary-deep mb-6">Data Processing</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Processed Today</span>
                        <span className="text-lg font-semibold text-primary-deep">2,847</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Processing Queue</span>
                        <span className="text-lg font-semibold text-yellow-600">156</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Failed Jobs</span>
                        <span className="text-lg font-semibold text-red-600">3</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg Processing Time</span>
                        <span className="text-lg font-semibold text-primary-deep">2.3s</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="card-ocean">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-primary-deep mb-6">Data Operations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                      <Upload className="w-6 h-6" />
                      <span>Import Data</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                      <Download className="w-6 h-6" />
                      <span>Export Data</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="w-6 h-6" />
                      <span>Sync Data</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="card-ocean">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-primary-deep mb-6">Server Status</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Server className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-muted-foreground">Web Server</span>
                        </div>
                        <span className="text-sm font-medium text-green-600">Online</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Database className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-muted-foreground">Database</span>
                        </div>
                        <span className="text-sm font-medium text-green-600">Online</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Wifi className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-muted-foreground">Network</span>
                        </div>
                        <span className="text-sm font-medium text-green-600">Online</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Cpu className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-muted-foreground">Processing</span>
                        </div>
                        <span className="text-sm font-medium text-yellow-600">High Load</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="card-ocean">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-primary-deep mb-6">System Resources</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">CPU Usage</span>
                          <span className="text-sm font-medium text-primary-deep">45%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Memory Usage</span>
                          <span className="text-sm font-medium text-primary-deep">67%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Disk Usage</span>
                          <span className="text-sm font-medium text-primary-deep">78%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="card-ocean">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-primary-deep mb-6">Security Status</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">SSL Certificate</span>
                        <span className="text-sm font-medium text-green-600">Valid</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Firewall</span>
                        <span className="text-sm font-medium text-green-600">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Intrusion Detection</span>
                        <span className="text-sm font-medium text-green-600">Monitoring</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Data Encryption</span>
                        <span className="text-sm font-medium text-green-600">AES-256</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="card-ocean">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-primary-deep mb-6">Access Logs</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Failed Login Attempts</span>
                        <span className="font-medium text-red-600">3</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Suspicious Activity</span>
                        <span className="font-medium text-yellow-600">1</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Admin Actions</span>
                        <span className="font-medium text-primary-deep">47</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Data Exports</span>
                        <span className="font-medium text-primary-deep">12</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
        </>
      )}
    </div>
  );
}