import { PrismaClient } from '@prisma/client';

async function diagnoseUpdate() {
    const prisma = new PrismaClient();

    // First, find a unit to update
    const unit = await prisma.department.findFirst();
    if (!unit) {
        console.error('No units found to test update.');
        return;
    }

    const id = unit.id;
    const payload = {
        ...unit,
        name: unit.name + ' (Updated)',
        // Simulate frontend behavior: send everything
        parentId: unit.parentId || '',
        dateOfEstablishment: unit.dateOfEstablishment ? unit.dateOfEstablishment.toISOString().split('T')[0] : '',
    };

    try {
        console.log(`Attempting to update unit ${id}...`);

        // This simulates the logic currently in AdminService
        const s = { ...payload };
        const fieldsToStrip = [
            'id', 'createdAt', 'updatedAt', 'parent', 'children',
            'postings', 'availabilities', 'governanceParams', 'offices'
        ];
        fieldsToStrip.forEach(f => delete (s as any)[f]);

        if ((s as any).dateOfEstablishment === '' || !(s as any).dateOfEstablishment) {
            delete (s as any).dateOfEstablishment;
        } else {
            (s as any).dateOfEstablishment = new Date((s as any).dateOfEstablishment);
        }

        if ((s as any).decisionLogRetentionYears !== undefined) {
            (s as any).decisionLogRetentionYears = parseInt((s as any).decisionLogRetentionYears as any) || 10;
        }

        if ((s as any).parentId === '') delete (s as any).parentId;

        const arrayFields = ['powers', 'policiesOwned', 'processesOwned', 'metricsAccountableFor'];
        arrayFields.forEach(field => {
            if (Array.isArray((s as any)[field])) {
                (s as any)[field] = (s as any)[field].filter((item: string) => item && item.trim() !== '');
            }
        });

        if ((s as any).parentId === undefined) (s as any).parentId = null;

        await prisma.department.update({
            where: { id },
            data: s as any
        });
        console.log('UPDATE SUCCESS');
    } catch (error) {
        console.error('UPDATE DIAGNOSTIC FAILURE:');
        console.dir(error, { depth: null });
    } finally {
        await prisma.$disconnect();
    }
}

diagnoseUpdate();
