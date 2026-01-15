import { useState, useEffect } from 'react';
import {
    Plus,
    Target,
    X,
    AlertTriangle,
    CheckCircle,
    Trash2
} from 'lucide-react';
import { budgetsAPI, categoriesAPI } from '../api/api';
import './Budgets.css';

const Budgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        amount: '',
        categoryId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        period: 'MONTHLY',
        alertThreshold: 80,
        notes: '',
    });

    useEffect(() => {
        fetchBudgets();
        fetchCategories();
    }, []);

    const fetchBudgets = async () => {
        try {
            const response = await budgetsAPI.getAll({});
            setBudgets(response.data.data || []);
        } catch (error) {
            console.error('Error fetching budgets:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getByType('EXPENSE');
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                amount: parseFloat(formData.amount),
                categoryId: parseInt(formData.categoryId),
                alertThreshold: parseInt(formData.alertThreshold),
            };

            await budgetsAPI.create(payload);
            setShowModal(false);
            resetForm();
            fetchBudgets();
        } catch (error) {
            console.error('Error creating budget:', error);
            alert('Bütçe oluşturulurken hata oluştu. Bu kategori için zaten aktif bir bütçe olabilir.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu bütçeyi silmek istediğinize emin misiniz?')) {
            try {
                await budgetsAPI.delete(id);
                fetchBudgets();
            } catch (error) {
                console.error('Error deleting budget:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            amount: '',
            categoryId: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
            period: 'MONTHLY',
            alertThreshold: 80,
            notes: '',
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(amount || 0);
    };

    const getProgressColor = (percentage, exceeded) => {
        if (exceeded) return 'red';
        if (percentage >= 80) return 'yellow';
        return 'green';
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="budgets-page fade-in">
            <div className="page-header">
                <div>
                    <h1>Bütçeler</h1>
                    <p className="page-subtitle">Harcama limitlerini takip edin</p>
                </div>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus size={18} />
                    Yeni Bütçe
                </button>
            </div>

            {budgets.length > 0 ? (
                <div className="budgets-grid">
                    {budgets.map((budget) => {
                        const percentage = parseFloat(budget.usagePercentage) || 0;
                        const progressColor = getProgressColor(percentage, budget.exceeded);

                        return (
                            <div key={budget.id} className={`budget-card ${budget.exceeded ? 'exceeded' : ''}`}>
                                <div className="budget-header">
                                    <div className="budget-category">
                                        <span className="budget-name">{budget.categoryName}</span>
                                        <span className="budget-period">{budget.period}</span>
                                    </div>
                                    <div className="budget-status">
                                        {budget.exceeded ? (
                                            <span className="status-badge exceeded">
                                                <AlertTriangle size={14} /> Aşıldı
                                            </span>
                                        ) : budget.alertThresholdReached ? (
                                            <span className="status-badge warning">
                                                <AlertTriangle size={14} /> Limit Yakın
                                            </span>
                                        ) : (
                                            <span className="status-badge ok">
                                                <CheckCircle size={14} /> Normal
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="budget-amounts">
                                    <div className="amount-row">
                                        <span className="amount-label">Harcanan</span>
                                        <span className="amount-value spent">{formatCurrency(budget.spentAmount)}</span>
                                    </div>
                                    <div className="amount-row">
                                        <span className="amount-label">Bütçe</span>
                                        <span className="amount-value total">{formatCurrency(budget.amount)}</span>
                                    </div>
                                </div>

                                <div className="budget-progress">
                                    <div className="progress-bar">
                                        <div
                                            className={`progress ${progressColor}`}
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="progress-info">
                                        <span>%{percentage.toFixed(0)} kullanıldı</span>
                                        <span>Kalan: {formatCurrency(budget.remainingAmount)}</span>
                                    </div>
                                </div>

                                <div className="budget-dates">
                                    <span>{budget.startDate} - {budget.endDate}</span>
                                </div>

                                <button className="budget-delete" onClick={() => handleDelete(budget.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="card">
                    <div className="empty-state">
                        <Target size={64} />
                        <h3>Henüz bütçe yok</h3>
                        <p>Harcama limitlerini takip etmek için bütçe oluşturun</p>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <Plus size={18} /> İlk Bütçeyi Oluştur
                        </button>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Yeni Bütçe Oluştur</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="form">
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Bütçe Tutarı (₺)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="0.00"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Uyarı Eşiği (%)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        min="1"
                                        max="100"
                                        value={formData.alertThreshold}
                                        onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Kategori</label>
                                <select
                                    className="input"
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    required
                                >
                                    <option value="">Kategori seçin</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-group">
                                <label>Periyot</label>
                                <select
                                    className="input"
                                    value={formData.period}
                                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                >
                                    <option value="DAILY">Günlük</option>
                                    <option value="WEEKLY">Haftalık</option>
                                    <option value="MONTHLY">Aylık</option>
                                    <option value="YEARLY">Yıllık</option>
                                    <option value="CUSTOM">Özel</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="input-group">
                                    <label>Başlangıç Tarihi</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Bitiş Tarihi</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Not (Opsiyonel)</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Bütçe notu"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-success">
                                    Bütçe Oluştur
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Budgets;
