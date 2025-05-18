import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Calendar, Download, Filter, Users, BookOpen, CheckCircle, MapPin, AlertCircle } from 'lucide-react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import '../../assets/css/AdminReports.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/admin/reports?range=${dateRange}`);
      setReportData(response.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.response?.data?.message || 'Failed to load reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const handleExport = (type) => {
    if (!reportData) return;
    
    let dataToExport = [];
    let fileName = 'report';
    
    switch(type) {
      case 'subjects':
        dataToExport = reportData.popularSubjects?.map(item => ({
          Subject: item._id,
          'Session Count': item.count
        })) || [];
        fileName = 'popular-subjects';
        break;
      case 'completion':
        dataToExport = [{
          'Total Sessions': reportData.completionRate?.total || 0,
          'Completed Sessions': reportData.completionRate?.completed || 0,
          'Completion Rate (%)': reportData.completionRate?.rate?.toFixed(2) || 0
        }];
        fileName = 'completion-rates';
        break;
      case 'cities':
        dataToExport = reportData.usageByCity?.map(item => ({
          City: item._id,
          'User Count': item.count
        })) || [];
        fileName = 'usage-by-city';
        break;
      case 'growth':
        dataToExport = reportData.userGrowth?.map(item => ({
          Date: item._id?.year + '-' + String(item._id?.month).padStart(2, '0'),
          'New Users': item.count
        })) || [];
        fileName = 'user-growth';
        break;
      default:
        // Export all data
        dataToExport = [
          ...(reportData.popularSubjects?.map(item => ({
            Report: 'Popular Subjects',
            Subject: item._id,
            Count: item.count
          })) || []),
          {
            Report: 'Completion Rates',
            'Total Sessions': reportData.completionRate?.total || 0,
            'Completed Sessions': reportData.completionRate?.completed || 0,
            'Rate (%)': reportData.completionRate?.rate?.toFixed(2) || 0
          },
          ...(reportData.usageByCity?.map(item => ({
            Report: 'Usage By City',
            City: item._id,
            'User Count': item.count
          })) || []),
          ...(reportData.userGrowth?.map(item => ({
            Report: 'User Growth',
            Date: item._id?.year + '-' + String(item._id?.month).padStart(2, '0'),
            'New Users': item.count
          })) || [])
        ];
        fileName = 'all-reports';
    }
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `${fileName}-${dateRange}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loader"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <AlertCircle size={24} />
        <p>{error}</p>
        <button onClick={fetchReports}>Try Again</button>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="admin-error">
        <AlertCircle size={24} />
        <p>No report data available</p>
        <button onClick={fetchReports}>Retry</button>
      </div>
    );
  }

  // Chart data preparation functions with null checks
  const getSubjectsChartData = () => ({
    labels: reportData.popularSubjects?.map(item => item._id) || [],
    datasets: [{
      label: 'Session Count',
      data: reportData.popularSubjects?.map(item => item.count) || [],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  });

  const getCompletionChartData = () => ({
    labels: ['Completed', 'Cancelled', 'Other'],
    datasets: [{
      data: [
        reportData.completionRate?.completed || 0,
        reportData.completionRate?.cancelled || 0,
        (reportData.completionRate?.total || 0) - 
          (reportData.completionRate?.completed || 0) - 
          (reportData.completionRate?.cancelled || 0)
      ],
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 206, 86, 0.6)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)'
      ],
      borderWidth: 1
    }]
  });

  const getCitiesChartData = () => ({
    labels: reportData.usageByCity?.map(item => item._id) || [],
    datasets: [{
      label: 'User Count',
      data: reportData.usageByCity?.map(item => item.count) || [],
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1
    }]
  });

  const getGrowthChartData = () => ({
    labels: reportData.userGrowth?.map(item => `${item._id?.month}/${item._id?.year}`) || [],
    datasets: [{
      label: 'New Users',
      data: reportData.userGrowth?.map(item => item.count) || [],
      fill: false,
      backgroundColor: 'rgba(255, 159, 64, 0.6)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 2,
      tension: 0.1
    }]
  });

  const renderOverviewTab = () => (
    <div className="reports-overview">
      <div className="report-cards">
        <div className="report-card">
          <div className="card-header">
            <BookOpen size={20} />
            <h3>Popular Subjects</h3>
          </div>
          <div className="card-content">
            <div className="chart-container">
              <Bar 
                data={getSubjectsChartData()} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    x: {
                      type: 'category'
                    }
                  }
                }} 
              />
            </div>
            <button 
              className="export-button"
              onClick={() => handleExport('subjects')}
              disabled={!reportData.popularSubjects?.length}
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        <div className="report-card">
          <div className="card-header">
            <CheckCircle size={20} />
            <h3>Completion Rates</h3>
          </div>
          <div className="card-content">
            <div className="completion-stats">
              <div className="stat-item">
                <span className="stat-value">{reportData.completionRate?.rate?.toFixed(2) || 0}%</span>
                <span className="stat-label">Completion Rate</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{reportData.completionRate?.completed || 0}</span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{reportData.completionRate?.total || 0}</span>
                <span className="stat-label">Total</span>
              </div>
            </div>
            <div className="chart-container">
              <Pie 
                data={getCompletionChartData()} 
                options={{
                  responsive: true
                }}
              />
            </div>
            <button 
              className="export-button"
              onClick={() => handleExport('completion')}
              disabled={!reportData.completionRate}
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        <div className="report-card">
          <div className="card-header">
            <MapPin size={20} />
            <h3>Usage By City</h3>
          </div>
          <div className="card-content">
            <div className="chart-container">
              <Bar 
                data={getCitiesChartData()} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    x: {
                      type: 'category'
                    }
                  }
                }} 
              />
            </div>
            <button 
              className="export-button"
              onClick={() => handleExport('cities')}
              disabled={!reportData.usageByCity?.length}
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        <div className="report-card">
          <div className="card-header">
            <Users size={20} />
            <h3>User Growth</h3>
          </div>
          <div className="card-content">
            <div className="chart-container">
              <Line 
                data={getGrowthChartData()} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false }
                  }
                }} 
              />
            </div>
            <button 
              className="export-button"
              onClick={() => handleExport('growth')}
              disabled={!reportData.userGrowth?.length}
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIndividualTab = (tab) => {
    switch(tab) {
      case 'subjects':
        return (
          <div className="report-detail">
            <h2>Popular Subjects</h2>
            <div className="chart-container-large">
              <Bar 
                data={getSubjectsChartData()} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Most Popular Subjects by Session Count' }
                  },
                  scales: {
                    x: {
                      type: 'category'
                    }
                  }
                }} 
              />
            </div>
            <div className="export-section">
              <button 
                className="export-button-large"
                onClick={() => handleExport('subjects')}
                disabled={!reportData.popularSubjects?.length}
              >
                <Download size={16} /> Export Subject Data
              </button>
            </div>
          </div>
        );
      case 'completion':
        return (
          <div className="report-detail">
            <h2>Session Completion Rates</h2>
            <div className="completion-details">
              <div className="completion-stats-large">
                <div className="stat-item-large">
                  <span className="stat-value-large">{reportData.completionRate?.rate?.toFixed(2) || 0}%</span>
                  <span className="stat-label-large">Completion Rate</span>
                </div>
                <div className="stat-item-large">
                  <span className="stat-value-large">{reportData.completionRate?.completed || 0}</span>
                  <span className="stat-label-large">Completed Sessions</span>
                </div>
                <div className="stat-item-large">
                  <span className="stat-value-large">{reportData.completionRate?.total || 0}</span>
                  <span className="stat-label-large">Total Sessions</span>
                </div>
              </div>
              <div className="chart-container-large">
                <Pie 
                  data={getCompletionChartData()} 
                  options={{
                    responsive: true,
                    plugins: {
                      title: { display: true, text: 'Session Status Distribution' }
                    }
                  }} 
                />
              </div>
            </div>
            <div className="export-section">
              <button 
                className="export-button-large"
                onClick={() => handleExport('completion')}
                disabled={!reportData.completionRate}
              >
                <Download size={16} /> Export Completion Data
              </button>
            </div>
          </div>
        );
      case 'cities':
        return (
          <div className="report-detail">
            <h2>Platform Usage By City</h2>
            <div className="chart-container-large">
              <Bar 
                data={getCitiesChartData()} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'User Distribution by City' }
                  },
                  scales: {
                    x: {
                      type: 'category'
                    }
                  }
                }} 
              />
            </div>
            <div className="export-section">
              <button 
                className="export-button-large"
                onClick={() => handleExport('cities')}
                disabled={!reportData.usageByCity?.length}
              >
                <Download size={16} /> Export City Data
              </button>
            </div>
          </div>
        );
      case 'growth':
        return (
          <div className="report-detail">
            <h2>User Growth Over Time</h2>
            <div className="chart-container-large">
              <Line 
                data={getGrowthChartData()} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'New Users Over Time' }
                  }
                }} 
              />
            </div>
            <div className="export-section">
              <button 
                className="export-button-large"
                onClick={() => handleExport('growth')}
                disabled={!reportData.userGrowth?.length}
              >
                <Download size={16} /> Export Growth Data
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-reports-container">
      <div className="reports-header">
        <h1>Platform Analytics</h1>
        <div className="report-controls">
          <div className="date-range-selector">
            <Filter size={16} />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <button 
            className="export-all-button"
            onClick={() => handleExport('all')}
            disabled={!reportData}
          >
            <Download size={16} /> Export All Data
          </button>
        </div>
      </div>

      <div className="report-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'subjects' ? 'active' : ''}`}
          onClick={() => setActiveTab('subjects')}
          disabled={!reportData?.popularSubjects?.length}
        >
          Subjects
        </button>
        <button
          className={`tab-button ${activeTab === 'completion' ? 'active' : ''}`}
          onClick={() => setActiveTab('completion')}
          disabled={!reportData?.completionRate}
        >
          Completion
        </button>
        <button
          className={`tab-button ${activeTab === 'cities' ? 'active' : ''}`}
          onClick={() => setActiveTab('cities')}
          disabled={!reportData?.usageByCity?.length}
        >
          Cities
        </button>
        <button
          className={`tab-button ${activeTab === 'growth' ? 'active' : ''}`}
          onClick={() => setActiveTab('growth')}
          disabled={!reportData?.userGrowth?.length}
        >
          Growth
        </button>
      </div>

      <div className="report-content">
        {activeTab === 'overview' ? renderOverviewTab() : renderIndividualTab(activeTab)}
      </div>
    </div>
  );
};

export default Reports;