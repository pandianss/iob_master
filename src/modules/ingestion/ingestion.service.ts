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

    private readonly COLUMN_SCHEMAS: Record<string, { name: string, type: 'string' | 'number' | 'date', scale?: number, absolute?: boolean }[]> = {
        [IngestionType.KEY_BUSINESS_PARAM]: [
            { name: 'Branch Code', type: 'number' },
            { name: 'Savings Bank', type: 'number', scale: 10000000 },
            { name: 'Current Deposits', type: 'number', scale: 10000000 },
            { name: 'Term Deposits', type: 'number', scale: 10000000 },
            { name: 'Advances', type: 'number', scale: 10000000 },
            { name: 'Region Code', type: 'string' }
        ],
        [IngestionType.BULK_DEPOSIT]: [
            { name: 'SOL_ID', type: 'number' },
            { name: 'BALANCE', type: 'number' },
            { name: 'Region Code', type: 'string' }
        ],
        [IngestionType.CORE_AGRI]: [
            { name: 'SOL_ID', type: 'number' },
            { name: 'TOTAL BALANCE(In Crores)', type: 'number', scale: 10000000, absolute: true },
            { name: 'PRIORITY_TYPE', type: 'string' },
            { name: 'SCHM_CODE', type: 'string' },
            { name: 'PURPOSE_OF_LOAN', type: 'string' },
            { name: 'Region Code', type: 'string' }
        ],
        [IngestionType.ADVANCES_VERTICAL]: [
            { name: 'Branch Code', type: 'number' },
            { name: 'PRIORITY_TYPE', type: 'string' },
            { name: 'SCHM_CODE', type: 'string' },
            { name: 'GL_SUB_CD', type: 'string' },
            { name: 'OPEN_DT', type: 'date' },
            { name: 'DOC_AMOUNT', type: 'number' },
            { name: 'NET_BALANCE', type: 'number', absolute: true },
            { name: 'Region Code', type: 'string' }
        ],
        [IngestionType.CASH_MANAGEMENT]: [
            { name: 'Branch Code', type: 'number' },
            { name: 'Cash on Hand', type: 'number' },
            { name: 'ATM Cash', type: 'number' },
            { name: 'Cash with BC', type: 'number' },
            { name: 'Bulk Note Acceptance', type: 'number' },
            { name: 'Total Cash', type: 'number' },
            { name: 'Cash Retention Limit', type: 'number' },
            { name: 'Excess Cash', type: 'number' },
            { name: 'Region Code', type: 'string' }
        ],
        [IngestionType.ACCOUNT_OPENING]: [
            { name: 'SOL_ID', type: 'number' },
            { name: 'SOL ID (Branch Code)', type: 'number' },
            { name: 'SCHM_TYPE', type: 'string' },
            { name: 'SCHM_CODE', type: 'string' },
            { name: 'ACCT_OPN_DATE', type: 'date' },
            { name: 'CLR_BAL_AMT', type: 'number' },
            { name: 'AVERAGE BALANCE', type: 'number' },
            { name: 'PHONE NO', type: 'string' },
            { name: 'Region Code', type: 'string' }
        ],
        [IngestionType.ACCOUNTS_CLOSED]: [
            { name: 'SOL_ID', type: 'number' },
            { name: 'ACCT_OPN_DATE', type: 'date' },
            { name: 'ACCT_CLS_DATE', type: 'date' },
            { name: 'SCHM_CODE', type: 'string' },
            { name: 'SCHM_TYPE', type: 'string' },
            { name: 'Balance Prior to Closure', type: 'number' },
            { name: 'Region Code', type: 'string' }
        ],
        [IngestionType.PROFIT_LOSS]: [
            { name: 'cbr_cd', type: 'number' },
            { name: 'P & L', type: 'number', scale: 100000 },
            { name: 'P & L (Amount is in Lakhs)', type: 'number', scale: 100000 },
            { name: 'Region Code', type: 'string' }
        ],
        [IngestionType.RECOVERY_FLASH]: [
            { name: 'Branch code', type: 'number' },
            { name: 'Opening NPA', type: 'number' },
            { name: 'Slippage', type: 'number' },
            { name: 'Adjustment Debits', type: 'number' },
            { name: 'Cash Recovery', type: 'number' },
            { name: 'Reduction', type: 'number' },
            { name: 'P&L', type: 'number' },
            { name: 'Upgradation', type: 'number' },
            { name: 'ARC', type: 'number' },
            { name: 'Adjustment Credits', type: 'number' },
            { name: 'Write Off', type: 'number' },
            { name: 'Closing NPA', type: 'number' },
            { name: 'Region Code', type: 'string' }
        ]
    };

    private normalizeHeader(header: string): string {
        if (!header) return header;
        // Trim whitespace and collapse multiple spaces into one
        return header.trim().replace(/\s+/g, ' ');
    }

    private parseDateString(val: string): any {
        if (!val || typeof val !== 'string') return val;
        const trimmed = val.trim();

        // Match YYYYMMDD (8 digits)
        if (/^\d{8}$/.test(trimmed)) {
            const y = parseInt(trimmed.substring(0, 4));
            const m = parseInt(trimmed.substring(4, 6)) - 1;
            const d = parseInt(trimmed.substring(6, 8));
            const date = new Date(y, m, d);
            return isNaN(date.getTime()) ? val : date.toISOString();
        }

        // Match DD/MM/YYYY or DD-MM-YYYY
        const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (dmyMatch) {
            const d = parseInt(dmyMatch[1]);
            const m = parseInt(dmyMatch[2]) - 1;
            const y = parseInt(dmyMatch[3]);
            const date = new Date(y, m, d);
            return isNaN(date.getTime()) ? val : date.toISOString();
        }

        return val;
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

            if (val !== undefined) {
                // Auto-detect date columns by name pattern
                const isDateCol = col.name.endsWith('_DT') || col.name.endsWith('_DATE') || col.name.toLowerCase().includes('date');

                if (isDateCol) {
                    val = this.parseDateString(String(val).trim());
                }

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

        // 2. Parse CSV and Stream to DB
        const content = fileBuffer.toString();
        const stream = Readable.from(content);
        const chunkSize = 500;
        let rowBuffer: any[] = [];
        let totalProcessed = 0;

        return new Promise((resolve, reject) => {
            const seenHeaders = new Map<string, number>();

            const csvStream = csv.parse({
                headers: (headers) => headers.map(h => {
                    if (!h) return h;
                    const normalized = this.normalizeHeader(h);
                    const count = seenHeaders.get(normalized) || 0;
                    seenHeaders.set(normalized, count + 1);
                    return count > 0 ? `${normalized}_${count}` : normalized;
                }),
                trim: true
            })
                .on('error', async (error) => {
                    this.logger.error(`[INGEST-ERROR] CSV Parse Error: ${error.message}`);
                    await this.prisma.ingestionBatch.update({
                        where: { id: batch.id },
                        data: { status: 'FAILED', errorLog: { message: error.message, phase: 'PARSE' } as any }
                    });
                    reject(error);
                })
                .on('data', async (row) => {
                    totalProcessed++;
                    const filtered = this.filterRowData(row, fileType);
                    rowBuffer.push({
                        batchId: batch.id,
                        rowNumber: totalProcessed,
                        data: filtered,
                        status: 'NEW' as const
                    });

                    if (rowBuffer.length >= chunkSize) {
                        const toInsert = [...rowBuffer];
                        rowBuffer = [];
                        try {
                            await this.prisma.ingestionRecord.createMany({ data: toInsert });
                        } catch (e) {
                            this.logger.error(`[INGEST-ERROR] Chunk Insert Error: ${e.message}`);
                            reject(e);
                            return; // Stop processing on error
                        }
                    }
                    csvStream.resume(); // Resume after processing the row and potentially inserting a chunk
                })
                .on('end', async () => {
                    try {
                        // Insert remaining rows
                        if (rowBuffer.length > 0) {
                            await this.prisma.ingestionRecord.createMany({ data: rowBuffer });
                        }

                        // 4. Update Batch Status
                        await this.prisma.ingestionBatch.update({
                            where: { id: batch.id },
                            data: {
                                status: 'COMPLETED',
                                rowCount: totalProcessed
                            }
                        });

                        this.logger.log(`[INGEST] Successfully completed batch ${batch.id}. Total rows: ${totalProcessed}`);
                        resolve({ batchId: batch.id, rowCount: totalProcessed });
                    } catch (error) {
                        this.logger.error(`[INGEST-ERROR] Finalization failed: ${error.message}`);
                        await this.prisma.ingestionBatch.update({
                            where: { id: batch.id },
                            data: {
                                status: 'FAILED',
                                errorLog: {
                                    message: error.message,
                                    stack: error.stack,
                                    phase: 'FINALIZATION'
                                } as any
                            }
                        });
                        reject(error);
                    }
                });

            stream.pipe(csvStream);
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
