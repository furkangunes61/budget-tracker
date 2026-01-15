import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await register(formData);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card fade-in">
                <div className="auth-header">
                    <div className="auth-logo">
                        <Wallet size={40} />
                    </div>
                    <h1>Hesap Oluşturun</h1>
                    <p>Bütçe takibine hemen başlayın</p>
                </div>

                {error && (
                    <div className="alert error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label>Ad Soyad</label>
                        <input
                            type="text"
                            name="fullName"
                            className="input"
                            placeholder="Adınızı ve soyadınızı girin"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Kullanıcı Adı</label>
                        <input
                            type="text"
                            name="username"
                            className="input"
                            placeholder="Kullanıcı adı belirleyin"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>E-posta</label>
                        <input
                            type="email"
                            name="email"
                            className="input"
                            placeholder="E-posta adresinizi girin"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Şifre</label>
                        <div className="password-input">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                className="input"
                                placeholder="En az 6 karakter"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary auth-submit"
                        disabled={loading}
                    >
                        {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Zaten hesabınız var mı? <Link to="/login">Giriş Yapın</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
