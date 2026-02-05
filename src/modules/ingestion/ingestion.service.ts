import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import * as csv from 'fast-csv';
import { Readable } from 'stream';

export enum IngestionType {
    KEY_BUSINESS_PARAM = 'KEY_BUSINESS_PARAM',
    BULK_DEPOSIT = 'BULK_DEPOSIT',
    CORE_AGRI = 'CORE_AGRI',
    ADVANCES_VERTICAL = 'ADVANCES_VERTICAL',
    CASH_MANAGEMENT = 'CASH_MANAGEMENT',
    ACCOUNT_OPENING = 'ACCOUNT_OPENING',
    ACCOUNTS_CLOSED = 'ACCOUNTS_CLOSED',
    PROFIT_LOSS = 'PROFIT_LOSS',
    RECOVERY_FLASH = 'RECOVERY_FLASH',
    DEBIT_CARD_ISSUANCE = 'DEBIT_CARD_ISSUANCE',
    INTERNET_BANKING = 'INTERNET_BANKING',
    MOBILE_BANKING = 'MOBILE_BANKING',
    BHIM_UPI = 'BHIM_UPI',
    IOBPAY = 'IOBPAY',
    POS = 'POS',
    UPI_QR = 'UPI_QR',
    FASTAG = 'FASTAG',
    CREDIT_CARD = 'CREDIT_CARD',
    ATM_PERFORMANCE = 'ATM_PERFORMANCE',
    DCOE_PERFORMANCE = 'DCOE_PERFORMANCE'
}

@Injectable()
export class IngestionService {
    private readonly logger = new Logger(IngestionService.name);

    constructor(private readonly prisma: PrismaService) { }

    private readonly COLUMN_SCHEMAS: Record<string, { name: string, type: 'string' | 'number', scale?: number, absolute?: boolean }[]> = {
        [IngestionType.KEY_BUSINESS_PARAM]: [
            { name: 'Branch Code', type: 'number' },
            { name: 'Savings Bank', type: 'number', scale: 10000000 },
            { name: 'Current Deposits', type: 'number', scale: 10000000 },
            { name: 'Term Deposits', type: 'number', scale: 10000000 },
            { name: 'Advances', type: 'number', scale: 10000000 }
        ],
        [IngestionType.BULK_DEPOSIT]: [
            { name: 'SOL_ID', type: 'number' },
            { name: 'BALANCE', type: 'number' }
        ],
        [IngestionType.CORE_AGRI]: [
            { name: 'SOL_ID', type: 'number' },
            { name: 'TOTAL BALANCE(In Crores)', type: 'number', scale: 10000000, absolute: true },
            { name: 'PRIORITY_TYPE', type: 'string' }
        ],
        [IngestionType.ADVANCES_VERTICAL]: [
            { name: 'Branch Code', type: 'number' },
            { name: 'PRIORITY_TYPE', type: 'string' },
            { name: 'SCHM_CODE', type: 'string' },
            { name: 'GL_SUB_CD', type: 'string' },
            { name: 'OPEN_DT', type: 'string' }, // Keep as string or process in filter
            { name: 'DOC_AMOUNT', type: 'number' },
            { name: 'NET_BALANCE', type: 'number', absolute: true }
        ]
    };

    private parseYYYMMDD(val: string): any {
        if (!val || typeof val !== 'string' || val.length !== 8) return val;
        const y = parseInt(val.substring(0, 4));
        const m = parseInt(val.substring(4, 6)) - 1;
        const d = parseInt(val.substring(6, 8));
        const date = new Date(y, m, d);
        return isNaN(date.getTime()) ? val : date.toISOString();
    }

    private parseNumerical(value: any): number {
        if (value === null || value === undefined || value === '') return 0;
        if (typeof value === 'number') return value;

        // Remove commas and other non-numeric characters except decimal point and minus sign
        const cleanValue = String(value).replace(/[^0-9.-]/g, '').trim();
        const parsed = parseFloat(cleanValue);

        return isNaN(parsed) ? 0 : parsed;
    }

    // Helper to sanitize row data
    private filterRowData(row: any, fileType: IngestionType) {
        const schema = this.COLUMN_SCHEMAS[fileType];
        if (!schema) return row; // No filter for other types yet

        const filtered: any = {};
        schema.forEach(col => {
            let val = row[col.name];

            // Special handling for Advances Vertical date
            if (fileType === IngestionType.ADVANCES_VERTICAL && col.name === 'OPEN_DT') {
                val = this.parseYYYMMDD(String(val).trim());
            }

            if (val !== undefined) {
                if (col.type === 'number') {
                    let num = this.parseNumerical(val);
                    if (col.absolute) {
                        num = Math.abs(num);
                    }
                    if (col.scale) {
                        num = num * col.scale;
                    }
                    filtered[col.name] = num;
                } else {
                    filtered[col.name] = typeof val === 'string' ? val.trim() : val;
                }
            }
        });
        return filtered;
    }

    async ingestFile(fileBuffer: Buffer, fileName: string, fileType: IngestionType, userId: string, snapshotDate?: Date) {
        this.logger.log(`[INGEST] Starting ${fileName} (${fileType}) by ${userId}`);


        // 1. Create Batch
        const batch = await this.prisma.ingestionBatch.create({
            data: {
                fileType: fileType.toString(),
                fileName,
                uploadedBy: userId,
                snapshotDate: snapshotDate || new Date(),
                status: 'PROCESSING'
            }
        });

        const rows: any[] = [];

        // 2. Parse CSV
        const content = fileBuffer.toString();
        const stream = Readable.from(content);

        return new Promise((resolve, reject) => {
            const seenHeaders = new Map<string, number>();
            stream
                .pipe(csv.parse({
                    headers: (headers) => headers.map(h => {
                        if (!h) return h;
                        const count = seenHeaders.get(h) || 0;
                        seenHeaders.set(h, count + 1);
                        return count > 0 ? `${h}_${count}` : h;
                    }),
                    trim: true
                }))
                .on('error', async (error) => {
                    this.logger.error(`[INGEST-ERROR] CSV Parse Error: ${error.message}`);
                    await this.prisma.ingestionBatch.update({
                        where: { id: batch.id },
                        data: { status: 'FAILED', errorLog: { message: error.message, phase: 'PARSE' } as any }
                    });
                    reject(error);
                })
                .on('data', (row) => rows.push(row))
                .on('end', async (rowCount: number) => {
                    try {
                        this.logger.log(`[INGEST] Parsed ${rowCount} rows for ${fileType}. Batch: ${batch.id}`);

                        // 3. Bulk Insert
                        const records = rows.map((row, index) => {
                            try {
                                const filtered = this.filterRowData(row, fileType);
                                return {
                                    batchId: batch.id,
                                    rowNumber: index + 1,
                                    data: filtered,
                                    status: 'NEW' as const
                                };
                            } catch (e) {
                                this.logger.error(`Error filtering row ${index + 1}: ${e.message}`);
                                throw e;
                            }
                        });

                        // Insert in chunks of 500
                        const chunkSize = 500;
                        for (let i = 0; i < records.length; i += chunkSize) {
                            const chunk = records.slice(i, i + chunkSize);
                            await this.prisma.ingestionRecord.createMany({
                                data: chunk
                            });
                        }

                        // 4. Update Batch Status
                        await this.prisma.ingestionBatch.update({
                            where: { id: batch.id },
                            data: {
                                status: 'COMPLETED',
                                rowCount: rowCount
                            }
                        });

                        this.logger.log(`[INGEST] Successfully completed batch ${batch.id}`);
                        resolve({ batchId: batch.id, rowCount });

                    } catch (error) {
                        this.logger.error(`[INGEST-ERROR] Processing failed: ${error.message}`);

                        try {
                            await this.prisma.ingestionBatch.update({
                                where: { id: batch.id },
                                data: {
                                    status: 'FAILED',
                                    errorLog: {
                                        message: error.message,
                                        stack: error.stack,
                                        phase: 'DB_INSERT'
                                    } as any
                                }
                            });
                        } catch (updateError) {
                            this.logger.error(`[INGEST-ERROR] Failed to update batch status to FAILED: ${updateError.message}`);
                        }

                        reject(error);
                    }
                });
        });
    }

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
