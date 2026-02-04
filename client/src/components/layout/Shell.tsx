import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Users,
    ShieldCheck,
    Menu,
    Bell,
    Search,
    Calendar,
    User
} from 'lucide-react';

export function Shell() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    const navigation = [
        { name: 'Decisions', href: '/decisions', icon: ShieldCheck },
        { name: 'Units', href: '/departments', icon: FileText },
        { name: 'Staff', href: '/staff', icon: User }, // Added Staff link
        { name: 'Offices', href: '/offices', icon: Users },
        { name: 'DoA Rules', href: '/doa', icon: ShieldCheck },
        { name: 'Committees', href: '/committees', icon: Users },
        { name: 'MIS Dashboard', href: '/mis', icon: LayoutDashboard },
        { name: 'Business Snapshot', href: '/snapshot', icon: FileText },
        { name: 'Negative Parameters', href: '/negative-parameters', icon: ShieldCheck },
        { name: 'Parameter Mapping', href: '/parameter-mapping', icon: FileText },
        { name: 'Governance Parameters', href: '/governance/parameters', icon: ShieldCheck },
        { name: 'Calendar & Meetings', href: '/calendar', icon: Calendar },
    ];

    const [currentOffice, setCurrentOffice] = useState<any>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            // Prefer Office Tenure (Governance View) over Posting
            if (user.user?.tenures && user.user.tenures.length > 0) {
                setCurrentOffice(user.user.tenures[0].office);
            } else if (user.user) {
                // Fallback for visual compatibility if no office assigned yet
                setCurrentOffice({
                    name: user.user.name,
                    code: user.user.postings?.[0]?.designation?.title || 'USER',
                    tier: 'TIER_3_EXECUTION' // Default context
                });
            }
        }
    }, []);

    return (
        <div className="min-h-screen bg-grad-surface flex">
            {/* Sidebar */}
            <aside
                className={`iob-navbar text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'
                    } flex flex-col fixed h-full z-20`}
                style={{ background: 'var(--grad-primary)' }}
            >
                <div className="h-16 flex items-center px-6 font-bold text-xl tracking-tight border-b border-white/20">
                    {sidebarOpen ? 'IOB Governance' : 'IOB'}
                </div>

                <nav className="flex-1 py-6 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-6 py-3 text-sm font-medium transition-all ${isActive
                                    ? 'bg-white/20 border-r-4 border-white shadow-lg text-white'
                                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {sidebarOpen && <span className="ml-3">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-4 hover:bg-white/10 transition-colors border-t border-white/20"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center space-x-4">
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <Search className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <div className="flex items-center space-x-3 border-l pl-4 border-gray-200">
                            <div className="text-right mr-2 hidden md:block">
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Viewing As</p>
                                <p className="text-sm font-bold text-gray-800">{currentOffice ? currentOffice.name : 'Loading...'}</p>
                                {currentOffice && (
                                    <p className={`text-xs font-medium ${currentOffice.tier === 'TIER_0_SYSTEM' ? 'text-red-600' : 'text-blue-600'}`}>
                                        {currentOffice.tier === 'TIER_0_SYSTEM' ? 'System Control' : currentOffice.tier?.replace('TIER_', 'Tier ').replace('_', ' ')}
                                    </p>
                                )}
                            </div>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white"
                                style={{ background: 'var(--grad-emphasis)' }}>
                                {currentOffice ? currentOffice.code.substring(0, 2) : 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
