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
    User,
    UploadCloud,
    Globe,
    ChevronDown,
    ChevronRight,
    Building2,
    LogOut
} from 'lucide-react';
import { ROLE_VIEWS } from '../../config/roleViews';

export function Shell() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        decision: true,
        governance: true,
        org: true,
        intelligence: true,
        admin: true
    });
    const location = useLocation();

    const [userRole, setUserRole] = useState('RO'); // Default

    const navigationGroups = [
        {
            id: 'decision',
            name: 'Decision Flow',
            items: [
                { name: 'The Ledger', href: '/decisions', icon: ShieldCheck },
                { name: 'Calendar & Meetings', href: '/calendar', icon: Calendar },
            ]
        },
        {
            id: 'governance',
            name: 'Governance',
            items: [
                { name: 'Workspace', href: '/doa', icon: ShieldCheck },
            ]
        },
        {
            id: 'org',
            name: 'Organization',
            items: [
                { name: 'Hierarchy', href: '/departments', icon: FileText },
                { name: 'Region', href: '/regions', icon: Globe },
                { name: 'Offices', href: '/offices', icon: Users },
                { name: 'Units', href: '/departments', icon: Building2 },
                { name: 'Staff Registry', href: '/staff', icon: User },
            ]
        },
        {
            id: 'intelligence',
            name: 'Intelligence',
            items: [
                { name: 'Hub Explorer', href: '/mis', icon: LayoutDashboard },
            ]
        },
        {
            id: 'admin',
            name: 'Administration',
            items: [
                { name: 'Data Ingestion', href: '/data-ingestion', icon: UploadCloud },
            ]
        }
    ];

    const [currentOffice, setCurrentOffice] = useState<any>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const role = user.role || (user.user?.tenures?.[0]?.office?.tier === 'TIER_0_SYSTEM' ? 'ADMIN' : 'RO');
                setUserRole(role);

                if (user.user?.tenures && user.user.tenures.length > 0) {
                    setCurrentOffice(user.user.tenures[0].office);
                } else if (user.user) {
                    setCurrentOffice({
                        name: user.user.name,
                        code: user.user.postings?.[0]?.designation?.title || 'USER',
                        tier: 'TIER_3_EXECUTION'
                    });
                }
            } catch (e) {
                console.error('Shell Initialization Error:', e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const toggleGroup = (id: string) => {
        setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const allowedGroups = ROLE_VIEWS[userRole]?.groups || ["decision"];
    const visibleGroups = navigationGroups.filter(g => allowedGroups.includes(g.id));

    return (
        <div className="min-h-screen bg-grad-surface flex">
            {/* Sidebar */}
            <aside
                className={`iob-navbar text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'
                    } flex flex-col fixed h-full z-20 overflow-hidden shadow-2xl`}
                style={{ background: 'var(--grad-primary)' }}
            >
                <div className="h-16 flex items-center px-6 border-b border-white/10 glass">
                    {sidebarOpen ? (
                        <div className="flex items-center flex-nowrap whitespace-nowrap">
                            <img src="/logo-white.svg" className="w-8 h-8 mr-1 shrink-0" alt="IOB Logo" />
                            <span className="text-[32px] font-black tracking-tighter leading-none">IOB</span>
                            <span className="text-[32px] font-light text-white/30 tracking-tighter leading-none uppercase ml-1">Dindigul</span>
                        </div>
                    ) : (
                        <img src="/logo-white.svg" className="w-8 h-8 mx-auto" alt="IOB Logo" />
                    )}
                </div>

                <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                    {visibleGroups.map((group) => (
                        <div key={group.id} className="mb-2">
                            {sidebarOpen ? (
                                <button
                                    onClick={() => toggleGroup(group.id)}
                                    className="w-full flex items-center justify-between px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                                >
                                    {group.name}
                                    {expandedGroups[group.id] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                </button>
                            ) : (
                                <div className="h-4 border-t border-white/10 my-2 mx-4" />
                            )}

                            {(expandedGroups[group.id] || !sidebarOpen) && (
                                <div className="space-y-0.5">
                                    {group.items.map((item) => {
                                        const isActive = location.pathname === item.href;
                                        return (
                                            <Link
                                                key={item.href}
                                                to={item.href}
                                                className={`flex items-center px-6 py-3 text-sm font-medium transition-all ${isActive
                                                    ? 'bg-white/10 text-white border-l-4 border-white'
                                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/40'}`} />
                                                {sidebarOpen && <span className="ml-3">{item.name}</span>}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="mt-auto border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center px-6 py-4 text-sm font-medium text-white/60 hover:bg-red-500/20 hover:text-red-200 transition-all`}
                    >
                        <LogOut className="w-5 h-5 text-red-400/60" />
                        {sidebarOpen && <span className="ml-3 font-bold">Sign Out</span>}
                    </button>

                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full h-12 flex items-center px-6 hover:bg-white/10 transition-colors border-t border-white/10"
                    >
                        <Menu className="w-5 h-5" />
                        {sidebarOpen && <span className="ml-3 text-xs opacity-50 uppercase tracking-tighter">Collapse Menu</span>}
                    </button>
                </div>
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
                                <p className="text-sm font-bold text-gray-800">{currentOffice?.name || 'Authorized User'}</p>
                                {currentOffice && (
                                    <p className={`text-xs font-medium ${currentOffice.tier === 'TIER_0_SYSTEM' ? 'text-red-600' : 'text-blue-600'}`}>
                                        {currentOffice.tier === 'TIER_0_SYSTEM' ? 'System Control' : currentOffice.tier?.replace('TIER_', 'Tier ').replace('_', ' ')}
                                    </p>
                                )}
                            </div>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white"
                                style={{ background: 'var(--grad-emphasis)' }}>
                                {(currentOffice?.code || 'U').substring(0, 2)}
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
