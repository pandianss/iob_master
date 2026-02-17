import { Controller, Post, UploadedFile, Body, UseInterceptors, Get, Delete, Param, BadRequestException, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IngestionService, IngestionType } from './ingestion.service';

@Controller('ingestion')
export class IngestionController {
    constructor(private readonly ingestionService: IngestionService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('type') type: string,
        @Body('userId') userId: string,
        @Body('snapshotDate') snapshotDate: string
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        // Validate Type
        if (!Object.values(IngestionType).includes(type as IngestionType)) {
            throw new BadRequestException(`Invalid ingestion type. Allowed: ${Object.values(IngestionType).join(', ')}`);
        }

        // Default userId for demo
        const uId = userId || 'SYSTEM_USER';
        const date = snapshotDate ? new Date(snapshotDate) : new Date();

        return this.ingestionService.ingestFile(file.buffer, file.originalname, type as IngestionType, uId, date);
    }

    @Get('history')
    async getHistory() {
        return this.ingestionService.getHistory();
    }

    @Get('batch/:id')
    async getBatch(@Param('id') id: string) {
        const batch = await this.ingestionService.getBatchDetails(id);
        if (!batch) throw new NotFoundException('Batch not found');
        return batch;
    }

    @Delete('batch/:id')
    async deleteBatch(@Param('id') id: string) {
        return this.ingestionService.deleteBatch(id);
    }
}
