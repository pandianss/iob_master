
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('Detecting identity...');
    const [isAdmin, setIsAdmin] = useState(false);
    const [password, setPassword] = useState('');
    const [identity, setIdentity] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        checkIdentity();
    }, []);

    const checkIdentity = async () => {
        try {
            const res = await fetch('/api/admin/system-user');
            const data = await res.json();

            if (data.username) {
                setIdentity(data.username);
                // System Admin Check (Mock Rule)
                if (data.username === 'EMP00000' || data.username.includes('Administrator')) {
                    setIsAdmin(true);
                    setStatus('Admin identity detected. Please enter credentials.');
                } else {
                    attemptAutoLogin(data.username);
                }
            } else {
                setStatus('Could not detect system identity.');
            }
        } catch (e) {
            setStatus('Identity detection failed.');
        }
    };

    const attemptAutoLogin = async (userId: string) => {
        setStatus(`Attempting auto-login for ${userId}...`);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identity: userId })
            });

            if (res.ok) {
                const user = await res.json();
                localStorage.setItem('user', JSON.stringify(user));
                navigate('/');
            } else {
                setError('Access Denied: Your ID is not authorized.');
                setStatus('Login failed.');
            }
        } catch (e) {
            setError('Login service unavailable.');
        }
    };

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identity: 'EMP00000', password })
            });

            if (res.ok) {
                const user = await res.json();
                localStorage.setItem('user', JSON.stringify(user));
                navigate('/');
            } else {
                setError('Invalid Credentials');
            }
        } catch (e) {
            setError('Service Error');
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

                {!isAdmin ? (
                    <div className="text-center py-4">
                        <div className="animate-pulse text-sm text-gray-600 mb-2">{status}</div>
                        <div className="text-xs text-gray-400">Verifying domain trust...</div>
                    </div>
                ) : (
                    <form onSubmit={handleAdminLogin}>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">System Admin</label>
                            <input type="text" value="EMP00000" disabled className="w-full p-2 bg-gray-50 border rounded text-sm text-gray-500" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:border-iob-blue outline-none"
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="w-full bg-iob-blue text-white py-2 rounded font-bold hover:bg-blue-700 transition-colors">
                            Secure Login
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <button onClick={() => setIsAdmin(!isAdmin)} className="text-[10px] text-gray-400 hover:text-gray-600 underline">
                        {isAdmin ? 'Back to Auto-Login' : 'Admin Access'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
