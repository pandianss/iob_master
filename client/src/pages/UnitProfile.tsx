import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Shield, BarChart3,
    AlertTriangle, BookOpen, History,
    ChevronLeft, MapPin, Landmark
} from 'lucide-react';

export function UnitProfile() {
    const { id } = useParams();
    const [dept, setDept] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/departments')
            .then(res => res.json())
            .then(depts => {
                const found = depts.find((d: any) => d.id === id);
                setDept(found);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="p-8">Loading Unit Profile...</div>;
    if (!dept) return <div className="p-8">Unit not found</div>;

    const Section = ({ title, icon: Icon, children }: any) => (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-gray-100">
                <Icon className="w-5 h-5 text-[var(--color-brand-primary)]" />
                <h3 className="font-bold text-gray-900 uppercase tracking-wider text-xs">{title}</h3>
            </div>
            {children}
        </div>
    );

    const MetadataRow = ({ label, value }: any) => (
        <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-medium text-gray-900">{value || 'Not Defined'}</span>
        </div>
    );

    const TagCloud = ({ items }: any) => (
        <div className="flex flex-wrap gap-2 mt-2">
            {items && items.length > 0 ? items.map((item: string) => (
                <span key={item} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                    {item}
                </span>
            )) : <span className="text-xs text-gray-400 italic">None assigned</span>}
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <Link to="/departments" className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 group">
                <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                Back to Units Register
            </Link>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded ring-1 ring-inset ring-blue-700/10">
                            {dept.subType}
                        </span>
                        <h1 className="text-3xl font-bold text-gray-900">{dept.name}</h1>
                    </div>
                    <p className="text-gray-500 font-mono text-sm uppercase">{dept.code} • {dept.type}</p>
                </div>
                <div className="flex space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${dept.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {dept.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. Identity & Legal */}
                <Section title="Identity & Legal" icon={Landmark}>
                    <MetadataRow label="Statutory Basis" value={dept.statutoryBasis} />
                    <MetadataRow label="Establishment Ref" value={dept.establishmentOrderRef} />
                    <MetadataRow label="Date of Org" value={dept.dateOfEstablishment && new Date(dept.dateOfEstablishment).toLocaleDateString()} />
                </Section>

                {/* 2. Hierarchy */}
                <Section title="Hierarchy & Lineage" icon={MapPin}>
                    <MetadataRow label="Parent Unit" value={dept.parent?.name} />
                    <MetadataRow label="Governance Tier" value={dept.subType} />
                    <MetadataRow label="Geographical Scope" value={dept.geographicalScope} />
                    <MetadataRow label="Peer Group" value={dept.peerGroupCode} />
                </Section>

                {/* 3. Authority */}
                <Section title="Authority & Mandate" icon={Shield}>
                    <div className="mb-4">
                        <span className="text-sm text-gray-500 block mb-1">Mandate Statement</span>
                        <p className="text-sm text-gray-800 italic leading-relaxed">
                            "{dept.mandateStatement || 'No mandate defined for this unit.'}"
                        </p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500 block mb-1">Decision Powers</span>
                        <TagCloud items={dept.powers} />
                    </div>
                </Section>

                {/* 4. Functional Ownership */}
                <Section title="Functional Ownership" icon={BookOpen}>
                    <div>
                        <span className="text-sm text-gray-500 block mb-1">Policy Owner Of</span>
                        <TagCloud items={dept.policiesOwned} />
                    </div>
                    <div className="mt-4">
                        <span className="text-sm text-gray-500 block mb-1">Process Owner Of</span>
                        <TagCloud items={dept.processesOwned} />
                    </div>
                </Section>

                {/* 5. MIS Governance */}
                <Section title="MIS & Data Governance" icon={BarChart3}>
                    <MetadataRow label="MIS Frequency" value={dept.misFrequency} />
                    <MetadataRow label="Submission SLA" value={dept.misSla} />
                    <MetadataRow label="Data Roles" value="" />
                    <TagCloud items={dept.dataRoles} />
                </Section>

                {/* 6. Control & Risk */}
                <Section title="Control & Compliance" icon={AlertTriangle}>
                    <MetadataRow label="Risk Category" value={dept.riskCategory} />
                    <MetadataRow label="Vigilance Sensitivity" value={dept.vigilanceSensitivity} />
                    <MetadataRow label="Inspection Cycle" value={dept.inspectionCycle} />
                    <MetadataRow label="Last Inspection" value={dept.lastInspectionDate ? new Date(dept.lastInspectionDate).toLocaleDateString() : 'N/A'} />
                    <MetadataRow label="Open Observations" value={dept.openObservationsCount} />
                </Section>

                {/* 10. Audit & Traceability */}
                <Section title="Audit & Traceability" icon={History}>
                    <MetadataRow label="Decision Log Retention" value={`${dept.decisionLogRetentionYears} years`} />
                    <MetadataRow label="Audit Trail" value={dept.auditTrailEnabled ? 'ENABLED' : 'DISABLED'} />
                    <MetadataRow label="Replay Capable" value={dept.inspectionReplayCapable ? 'YES' : 'NO'} />
                </Section>
            </div>
        </div>
    );
}
