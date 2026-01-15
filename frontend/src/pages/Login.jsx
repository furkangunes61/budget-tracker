import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);

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
                    <h1>Hoş Geldiniz</h1>
                    <p>Bütçe takip sisteminize giriş yapın</p>
                </div>

                {error && (
                    <div className="alert error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label>Kullanıcı Adı</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Kullanıcı adınızı girin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Şifre</label>
                        <div className="password-input">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input"
                                placeholder="Şifrenizi girin"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
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
                        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Hesabınız yok mu? <Link to="/register">Kayıt Olun</Link></p>
                </div>

                <div className="demo-credentials">
                    <p><strong>Demo Hesap:</strong></p>
                    <p>Kullanıcı: <code>admin</code> | Şifre: <code>admin123</code></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
