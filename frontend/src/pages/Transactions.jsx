import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    Trash2,
    Edit,
    X,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import { transactionsAPI, categoriesAPI } from '../api/api';
import './Transactions.css';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [filter, setFilter] = useState({ type: '', search: '' });
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: 'EXPENSE',
        categoryId: '',
        transactionDate: new Date().toISOString().split('T')[0],
        notes: '',
    });

    useEffect(() => {
        fetchTransactions();
        fetchCategories();
    }, [page, filter.type]);

    const fetchTransactions = async () => {
        try {
            const params = { page, size: 10, type: filter.type || undefined };
            const response = await transactionsAPI.getAll(params);
            setTransactions(response.data.data.content || []);
            setTotalPages(response.data.data.totalPages || 0);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
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
            };

            if (editingTransaction) {
                await transactionsAPI.update(editingTransaction.id, payload);
            } else {
                await transactionsAPI.create(payload);
            }

            setShowModal(false);
            resetForm();
            fetchTransactions();
        } catch (error) {
            console.error('Error saving transaction:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
            try {
                await transactionsAPI.delete(id);
                fetchTransactions();
            } catch (error) {
                console.error('Error deleting transaction:', error);
            }
        }
    };

    const openEditModal = (transaction) => {
        setEditingTransaction(transaction);
        setFormData({
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            categoryId: categories.find(c => c.name === transaction.categoryName)?.id || '',
            transactionDate: transaction.transactionDate,
            notes: transaction.notes || '',
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            description: '',
            amount: '',
            type: 'EXPENSE',
            categoryId: '',
            transactionDate: new Date().toISOString().split('T')[0],
            notes: '',
        });
        setEditingTransaction(null);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(amount || 0);
    };

    const filteredCategories = categories.filter(c => c.type === formData.type);

    const filteredTransactions = transactions.filter(tx =>
        tx.description.toLowerCase().includes(filter.search.toLowerCase())
    );

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="transactions-page fade-in">
            <div className="page-header">
                <div>
                    <h1>İşlemler</h1>
                    <p className="page-subtitle">Gelir ve giderlerinizi yönetin</p>
                </div>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus size={18} />
                    Yeni İşlem
                </button>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="İşlem ara..."
                        value={filter.search}
                        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                    />
                </div>
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filter.type === '' ? 'active' : ''}`}
                        onClick={() => setFilter({ ...filter, type: '' })}
                    >
                        Tümü
                    </button>
                    <button
                        className={`filter-btn income ${filter.type === 'INCOME' ? 'active' : ''}`}
                        onClick={() => setFilter({ ...filter, type: 'INCOME' })}
                    >
                        <TrendingUp size={16} /> Gelirler
                    </button>
                    <button
                        className={`filter-btn expense ${filter.type === 'EXPENSE' ? 'active' : ''}`}
                        onClick={() => setFilter({ ...filter, type: 'EXPENSE' })}
                    >
                        <TrendingDown size={16} /> Giderler
                    </button>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="card">
                {filteredTransactions.length > 0 ? (
                    <>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>İşlem</th>
                                        <th>Kategori</th>
                                        <th>Tarih</th>
                                        <th>Tutar</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.map((tx) => (
                                        <tr key={tx.id}>
                                            <td>
                                                <div className="tx-cell">
                                                    <span className="tx-icon">{tx.categoryIcon || '💰'}</span>
                                                    <div>
                                                        <span className="tx-desc">{tx.description}</span>
                                                        {tx.notes && <span className="tx-notes">{tx.notes}</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${tx.type.toLowerCase()}`}>
                                                    {tx.categoryName}
                                                </span>
                                            </td>
                                            <td>{tx.transactionDate}</td>
                                            <td>
                                                <span className={tx.type === 'INCOME' ? 'amount-income' : 'amount-expense'}>
                                                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="actions">
                                                    <button className="btn-icon" onClick={() => openEditModal(tx)}>
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="btn-icon delete" onClick={() => handleDelete(tx.id)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="btn btn-secondary"
                                    disabled={page === 0}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    Önceki
                                </button>
                                <span>Sayfa {page + 1} / {totalPages}</span>
                                <button
                                    className="btn btn-secondary"
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Sonraki
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state">
                        <TrendingUp size={48} />
                        <h3>Henüz işlem yok</h3>
                        <p>İlk işleminizi ekleyerek başlayın</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingTransaction ? 'İşlemi Düzenle' : 'Yeni İşlem Ekle'}
                            </h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="form">
                            <div className="input-group">
                                <label>İşlem Tipi</label>
                                <div className="type-toggle">
                                    <button
                                        type="button"
                                        className={`type-btn expense ${formData.type === 'EXPENSE' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, type: 'EXPENSE', categoryId: '' })}
                                    >
                                        <TrendingDown size={18} /> Gider
                                    </button>
                                    <button
                                        type="button"
                                        className={`type-btn income ${formData.type === 'INCOME' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, type: 'INCOME', categoryId: '' })}
                                    >
                                        <TrendingUp size={18} /> Gelir
                                    </button>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="input-group">
                                    <label>Tutar (₺)</label>
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
                                    <label>Tarih</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={formData.transactionDate}
                                        onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
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
                                    {filteredCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-group">
                                <label>Açıklama</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="İşlem açıklaması"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label>Not (Opsiyonel)</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Ek not"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingTransaction ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;
