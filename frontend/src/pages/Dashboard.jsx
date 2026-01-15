import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    AlertTriangle,
    ArrowRight,
    Plus
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { transactionsAPI, budgetsAPI, categoriesAPI } from '../api/api';
import './Dashboard.css';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        fetchDashboardData();
    }, [location.key]);

    const fetchDashboardData = async () => {
        try {
            const [summaryRes, transactionsRes, alertsRes] = await Promise.allSettled([
                transactionsAPI.getSummary({ startDate: '2020-01-01', endDate: new Date().toISOString().split('T')[0] }),
                transactionsAPI.getAll({ size: 5 }),
                budgetsAPI.getAlerts(),
            ]);

            // Her bir sonucu ayrı ayrı işle - hata olanları atla
            if (summaryRes.status === 'fulfilled') {
                setSummary(summaryRes.value.data.data);
            }
            if (transactionsRes.status === 'fulfilled') {
                setTransactions(transactionsRes.value.data.data.content || []);
            }
            if (alertsRes.status === 'fulfilled') {
                setAlerts(alertsRes.value.data.data || []);
            }
        } catch (error) {
            console.error('Dashboard data fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(amount || 0);
    };

    const pieData = [
        { name: 'Gelir', value: parseFloat(summary?.totalIncome) || 0, color: '#22c55e' },
        { name: 'Gider', value: parseFloat(summary?.totalExpense) || 0, color: '#ef4444' },
    ].filter(d => d.value > 0);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard fade-in">
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="page-subtitle">Finansal durumunuza genel bakış</p>
                </div>
                <Link to="/transactions" className="btn btn-primary">
                    <Plus size={18} />
                    Yeni İşlem
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid-4 stats-grid">
                <div className="stat-card">
                    <div className="stat-icon green">
                        <TrendingUp size={24} />
                    </div>
                    <span className="stat-label">Toplam Gelir</span>
                    <span className="stat-value green">{formatCurrency(summary?.totalIncome)}</span>
                </div>

                <div className="stat-card">
                    <div className="stat-icon red">
                        <TrendingDown size={24} />
                    </div>
                    <span className="stat-label">Toplam Gider</span>
                    <span className="stat-value red">{formatCurrency(summary?.totalExpense)}</span>
                </div>

                <div className="stat-card">
                    <div className="stat-icon blue">
                        <Wallet size={24} />
                    </div>
                    <span className="stat-label">Bakiye</span>
                    <span className={`stat-value ${parseFloat(summary?.balance) >= 0 ? 'green' : 'red'}`}>
                        {formatCurrency(summary?.balance)}
                    </span>
                </div>

                <div className="stat-card">
                    <div className="stat-icon purple">
                        <AlertTriangle size={24} />
                    </div>
                    <span className="stat-label">Bütçe Uyarıları</span>
                    <span className="stat-value">{alerts.length}</span>
                </div>
            </div>

            <div className="dashboard-content">
                {/* Chart */}
                <div className="card chart-card">
                    <div className="card-header">
                        <h3 className="card-title">Gelir / Gider Dağılımı</h3>
                    </div>
                    {pieData.length > 0 ? (
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                        contentStyle={{
                                            background: '#18181b',
                                            border: '1px solid #27272a',
                                            borderRadius: '8px',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="chart-legend">
                                {pieData.map((entry, index) => (
                                    <div key={index} className="legend-item">
                                        <span className="legend-dot" style={{ background: entry.color }}></span>
                                        <span>{entry.name}: {formatCurrency(entry.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Wallet size={48} />
                            <h3>Henüz işlem yok</h3>
                            <p>İlk işleminizi ekleyerek başlayın</p>
                        </div>
                    )}
                </div>

                {/* Recent Transactions */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Son İşlemler</h3>
                        <Link to="/transactions" className="btn btn-secondary btn-sm">
                            Tümünü Gör <ArrowRight size={16} />
                        </Link>
                    </div>

                    {transactions.length > 0 ? (
                        <div className="transaction-list">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="transaction-item">
                                    <div className="transaction-icon" style={{ background: tx.categoryColor || '#3b82f6' }}>
                                        {tx.categoryIcon || '💰'}
                                    </div>
                                    <div className="transaction-info">
                                        <span className="transaction-desc">{tx.description}</span>
                                        <span className="transaction-category">{tx.categoryName}</span>
                                    </div>
                                    <div className="transaction-amount">
                                        <span className={tx.type === 'INCOME' ? 'amount-income' : 'amount-expense'}>
                                            {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </span>
                                        <span className="transaction-date">{tx.transactionDate}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>Henüz işlem kaydı yok</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Budget Alerts */}
            {alerts.length > 0 && (
                <div className="card alerts-card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <AlertTriangle size={20} className="alert-icon" />
                            Bütçe Uyarıları
                        </h3>
                    </div>
                    <div className="alerts-list">
                        {alerts.map((alert) => (
                            <div key={alert.id} className={`alert-item ${alert.exceeded ? 'exceeded' : 'warning'}`}>
                                <div className="alert-info">
                                    <span className="alert-category">{alert.categoryName}</span>
                                    <span className="alert-message">
                                        {alert.exceeded
                                            ? 'Bütçe aşıldı!'
                                            : `Bütçenin %${alert.usagePercentage?.toFixed(0)}'i kullanıldı`}
                                    </span>
                                </div>
                                <div className="alert-amounts">
                                    <span>{formatCurrency(alert.spentAmount)} / {formatCurrency(alert.amount)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
