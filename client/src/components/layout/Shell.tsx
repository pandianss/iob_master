import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Users,
    ShieldCheck,
    Menu,
    Bell,
    Search,
    PlusCircle,
    Calendar
} from 'lucide-react';

export function Shell() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    const navigation = [
        { name: 'Inbox', href: '/', icon: LayoutDashboard },
        { name: 'New Proposal', href: '/decisions/new', icon: PlusCircle },
        { name: 'Departments', href: '/departments', icon: FileText },
        { name: 'DoA Rules', href: '/doa', icon: ShieldCheck },
        { name: 'Committees', href: '/committees', icon: Users },
        { name: 'MIS Dashboard', href: '/mis', icon: LayoutDashboard },
        { name: 'Business Snapshot', href: '/snapshot', icon: FileText },
        { name: 'Negative Parameters', href: '/negative-parameters', icon: ShieldCheck },
        { name: 'Parameter Mapping', href: '/parameter-mapping', icon: FileText },
        { name: 'Governance Parameters', href: '/governance/parameters', icon: ShieldCheck },
        { name: 'Calendar & Meetings', href: '/calendar', icon: Calendar },
    ];

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

                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                                style={{ background: 'var(--grad-emphasis)' }}>
                                U
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-gray-900">User Name</p>
                                <p className="text-xs text-gray-500">Admin</p>
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
