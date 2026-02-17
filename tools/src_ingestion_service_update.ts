    async getHistory() {
    return this.prisma.ingestionBatch.findMany({
        orderBy: { uploadedAt: 'desc' },
        take: 50
    });
}

    async getBatchDetails(id: string) {
    return this.prisma.ingestionBatch.findUnique({
        where: { id },
        include: {
            records: {
                take: 50,
                orderBy: { rowNumber: 'asc' }
            }
        }
    });
}

    async deleteBatch(id: string) {
    return this.prisma.ingestionBatch.delete({
        where: { id }
    });
}
}
