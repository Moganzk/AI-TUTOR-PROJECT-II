import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import './AnalyticsDashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AnalyticsDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState(30);
  const [userRole, setUserRole] = useState('student');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/api/analytics/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { days: timeRange }
      });

      if (response.data.success) {
        setDashboardData(response.data.data);
        setUserRole(response.data.user_role);
      } else {
        toast.error('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error('Failed to connect to analytics service');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchDashboardData();
    toast.success('Analytics data refreshed');
  };

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="analytics-dashboard">
        <div className="error-container">
          <h3>Analytics Unavailable</h3>
          <p>Unable to load analytics data. Please try again.</p>
          <button onClick={fetchDashboardData} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>📊 Analytics Dashboard</h1>
          <p className="dashboard-subtitle">
            {userRole === 'admin' ? 'Platform Analytics' : 
             userRole === 'staff' ? 'Course Analytics' : 'My Progress'}
          </p>
        </div>
        
        <div className="header-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="time-range-select"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 3 months</option>
          </select>
          
          <button onClick={refreshData} className="btn btn-secondary">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          Courses
        </button>
        <button 
          className={`tab ${activeTab === 'engagement' ? 'active' : ''}`}
          onClick={() => setActiveTab('engagement')}
        >
          Engagement
        </button>
        {userRole === 'admin' && (
          <button 
            className={`tab ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            System Health
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <OverviewTab data={dashboardData.overview} userRole={userRole} />
        )}
        {activeTab === 'courses' && (
          <CoursesTab data={dashboardData.course_performance} />
        )}
        {activeTab === 'engagement' && (
          <EngagementTab data={dashboardData.user_engagement} />
        )}
        {activeTab === 'system' && userRole === 'admin' && (
          <SystemHealthTab data={dashboardData.system_health} />
        )}
      </div>
    </div>
  );
};

const OverviewTab = ({ data, userRole }) => {
  const metricCards = [
    { 
      title: 'Total Users', 
      value: data.total_users || 0, 
      icon: '👥',
      change: '+12%',
      positive: true
    },
    { 
      title: 'Active Courses', 
      value: data.total_courses || 0, 
      icon: '📚',
      change: '+8%',
      positive: true
    },
    { 
      title: 'Assignments', 
      value: data.total_assignments || 0, 
      icon: '📝',
      change: '+15%',
      positive: true
    },
    { 
      title: 'Completion Rate', 
      value: `${data.completion_rate || 0}%`, 
      icon: '✅',
      change: '+3%',
      positive: true
    }
  ];

  return (
    <div className="overview-tab">
      <div className="metrics-grid">
        {metricCards.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">{metric.icon}</span>
              <span className={`metric-change ${metric.positive ? 'positive' : 'negative'}`}>
                {metric.change}
              </span>
            </div>
            <div className="metric-value">{metric.value}</div>
            <div className="metric-title">{metric.title}</div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Growth Trend</h3>
          <Line
            data={{
              labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
              datasets: [{
                label: 'New Users',
                data: [12, 19, 15, 25],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: false }
              }
            }}
          />
        </div>

        <div className="chart-container">
          <h3>User Distribution</h3>
          <Doughnut
            data={{
              labels: ['Students', 'Instructors', 'Admins'],
              datasets: [{
                data: [85, 12, 3],
                backgroundColor: [
                  'rgba(54, 162, 235, 0.8)',
                  'rgba(255, 99, 132, 0.8)',
                  'rgba(255, 205, 86, 0.8)'
                ]
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

const CoursesTab = ({ data }) => {
  const topCourses = data.top_courses || [];

  return (
    <div className="courses-tab">
      <div className="courses-summary">
        <div className="summary-card">
          <h3>Total Enrollments</h3>
          <div className="summary-value">{data.total_enrollments || 0}</div>
        </div>
        <div className="summary-card">
          <h3>Avg Completion Rate</h3>
          <div className="summary-value">{data.avg_completion_rate || 0}%</div>
        </div>
      </div>

      <div className="courses-list">
        <h3>Top Performing Courses</h3>
        <div className="courses-table">
          <div className="table-header">
            <span>Course</span>
            <span>Enrollments</span>
            <span>Completion Rate</span>
            <span>Avg Progress</span>
          </div>
          {topCourses.map((course, index) => (
            <div key={index} className="table-row">
              <span className="course-title">{course.course_title}</span>
              <span>{course.enrollment_count}</span>
              <span>{course.completion_rate}%</span>
              <span>{course.avg_progress}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-container">
        <h3>Course Performance</h3>
        <Bar
          data={{
            labels: topCourses.slice(0, 5).map(course => course.course_title),
            datasets: [{
              label: 'Completion Rate (%)',
              data: topCourses.slice(0, 5).map(course => course.completion_rate),
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              title: { display: false }
            },
            scales: {
              y: { beginAtZero: true, max: 100 }
            }
          }}
        />
      </div>
    </div>
  );
};

const EngagementTab = ({ data }) => {
  return (
    <div className="engagement-tab">
      <div className="engagement-metrics">
        <div className="metric-card">
          <h4>Daily Active Users</h4>
          <div className="metric-value">{data.daily_active_users || 0}</div>
        </div>
        <div className="metric-card">
          <h4>Weekly Active Users</h4>
          <div className="metric-value">{data.weekly_active_users || 0}</div>
        </div>
        <div className="metric-card">
          <h4>Avg Session Duration</h4>
          <div className="metric-value">{data.avg_session_duration || 0} min</div>
        </div>
        <div className="metric-card">
          <h4>Retention Rate</h4>
          <div className="metric-value">{data.retention_rate || 0}%</div>
        </div>
      </div>

      <div className="feature-usage">
        <h3>Feature Usage</h3>
        <div className="feature-list">
          {Object.entries(data.feature_usage || {}).map(([feature, usage]) => (
            <div key={feature} className="feature-item">
              <span className="feature-name">{feature}</span>
              <div className="feature-bar">
                <div 
                  className="feature-progress" 
                  style={{ width: `${(usage / 100) * 100}%` }}
                ></div>
              </div>
              <span className="feature-value">{usage}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SystemHealthTab = ({ data }) => {
  const healthStatus = (status) => {
    return status === 'healthy' ? '🟢' : status === 'unhealthy' ? '🔴' : '🟡';
  };

  return (
    <div className="system-health-tab">
      <div className="health-overview">
        <div className="health-card">
          <h4>Database Status</h4>
          <div className="health-status">
            {healthStatus(data.database_status)} {data.database_status}
          </div>
        </div>
        <div className="health-card">
          <h4>Cache Status</h4>
          <div className="health-status">
            {healthStatus(data.cache_status)} {data.cache_status}
          </div>
        </div>
        <div className="health-card">
          <h4>Cache Hit Rate</h4>
          <div className="health-value">{data.cache_hit_rate || 0}%</div>
        </div>
        <div className="health-card">
          <h4>Avg Response Time</h4>
          <div className="health-value">{data.response_time || 0}ms</div>
        </div>
      </div>

      <div className="performance-metrics">
        <h3>Performance Metrics</h3>
        <div className="metrics-list">
          <div className="metric-item">
            <span>Error Rate</span>
            <span className={`metric-value ${data.error_rate > 5 ? 'warning' : 'good'}`}>
              {data.error_rate || 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
