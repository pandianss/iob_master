import type { ReactNode } from 'react';

interface FormLayoutProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    actions: ReactNode;
    error?: string | null;
}

export const FormLayout = ({ title, subtitle, children, actions, error }: FormLayoutProps) => {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
                </div>

                {/* Form Content */}
                <div className="px-8 py-8 space-y-8">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 font-medium">
                            {error}
                        </div>
                    )}
                    {children}
                </div>

                {/* Sticky Footer */}
                <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-4 sticky bottom-0 z-10">
                    {actions}
                </div>
            </div>
        </div>
    );
};
