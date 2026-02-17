import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

export function Debug() {
    return (
        <div style={{ backgroundColor: 'white', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
            <div style={{ textAlign: 'center', border: '2px solid blue', padding: '2rem', borderRadius: '1rem' }}>
                <h1 style={{ color: 'blue' }}>IOBIAN System Debug</h1>
                <p>Environment: Development</p>
                <p>React Version: 19</p>
                <div style={{ marginTop: '2rem' }}>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ padding: '0.5rem 1rem', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
                    >
                        Test Reload
                    </button>
                </div>
            </div>
        </div>
    );
}
