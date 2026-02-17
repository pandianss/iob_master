import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('Detecting identity...');
    const [isAdmin, setIsAdmin] = useState(false);
    const [password, setPassword] = useState('');
    const [detectedIdentity, setDetectedIdentity] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        checkIdentity();
    }, []);

    const checkIdentity = async () => {
        try {
            const res = await fetch('/api/admin/system-user');
            const data = await res.json();

            if (data.username) {
                setDetectedIdentity(data.username);
                // System Admin Check (Mock Rule)
                if (data.username === 'EMP00000' || data.username.includes('Administrator')) {
                    setIsAdmin(true);
                    setStatus('Administrator');
                } else {
                    setStatus('Domain User');
                }
            } else {
                setStatus('Could not detect system identity.');
            }
        } catch (e) {
            setStatus('Identity detection failed.');
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const identityToUse = isAdmin ? 'EMP00000' : detectedIdentity;

        if (!identityToUse) {
            setError('No identity detected. Please try again.');
            return;
        }

        setStatus('Authenticating...');
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identity: identityToUse, password })
            });

            if (res.ok) {
                const user = await res.json();
                localStorage.setItem('user', JSON.stringify(user));
                navigate('/');
            } else {
                const data = await res.json();
                setError(data.message || 'Access Denied: Invalid Credentials.');
                setStatus('Login failed.');
            }
        } catch (e) {
            setError('Server Error: Connection failed.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 font-['Century_Gothic']">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <div className="flex justify-center mb-6">
                    <div className="text-iob-blue font-bold text-2xl tracking-widest">IOBIAN</div>
                </div>

                <div className="text-center mb-6">
                    <h2 className="text-lg font-bold text-gray-700">Governance Platform</h2>
                    <p className="text-xs text-gray-500 mt-1">Authorized Access Only</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4 text-center">
                        {error}
                    </div>
                )}

                {(detectedIdentity || isAdmin) ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">
                                {isAdmin ? 'System Override' : 'Detected Identity'}
                            </label>
                            <div className="p-3 bg-gray-50 border border-gray-100 rounded text-sm text-gray-800 font-bold flex justify-between items-center shadow-inner">
                                {isAdmin ? 'EMP00000 (ADMIN)' : detectedIdentity}
                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold">Verified</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">Account Password</label>
                            <input
                                type="password"
                                placeholder="Enter Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded text-sm focus:border-iob-blue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="w-full bg-iob-blue text-white py-3 rounded font-bold hover:bg-blue-700 hover:shadow-lg transition-all active:scale-[0.98]">
                            Direct Access
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-iob-blue mx-auto mb-4"></div>
                        <div className="text-sm text-gray-600 mb-2 font-medium">{status}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold opacity-30">Bridging Secure Context...</div>
                    </div>
                )}

                <div className="mt-8 text-center border-t border-gray-100 pt-4">
                    <button
                        onClick={() => {
                            setIsAdmin(!isAdmin);
                            setError('');
                            setPassword('');
                        }}
                        className="text-[10px] font-bold text-gray-400 hover:text-iob-blue transition-colors uppercase tracking-widest"
                    >
                        {isAdmin ? 'Back to Trusted Login' : 'System Admin Override'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
