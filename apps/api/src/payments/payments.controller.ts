import { Controller, Post, Get, Patch, Param, UseGuards, UseInterceptors, UploadedFile, Request, BadRequestException, NotFoundException, StreamableFile, Res, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync, createReadStream } from 'fs';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { Response } from 'express';

const UPLOADS_DIR = join(process.cwd(), 'uploads');

if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Roles('INVESTOR')
  @Post(':orderId/receipt')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const userId = (req.user as any).id;
        const userDir = join(UPLOADS_DIR, userId, 'payments');
        if (!existsSync(userDir)) {
          mkdirSync(userDir, { recursive: true });
        }
        cb(null, userDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const mimeToExt: Record<string, string> = {
          'application/pdf': '.pdf',
          'image/jpeg': '.jpeg',
          'image/png': '.png',
        };
        const extension = mimeToExt[file.mimetype] || '.bin';
        cb(null, `receipt-${req.params.orderId}-${uniqueSuffix}${extension}`);
      }
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Invalid file type. Only PDF, JPEG, and PNG are allowed.'), false);
      }
    }
  }))
  async uploadReceipt(
    @Request() req,
    @Param('orderId') orderId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Receipt file is required');
    }
    return this.paymentsService.uploadReceipt(req.user.id, orderId, file);
  }

  @Roles('INVESTOR')
  @Get('my-payments')
  async getMyPayments(@Request() req) {
    return this.paymentsService.getMyPayments(req.user.id);
  }

  @Roles('BROKER', 'ADMIN')
  @Get()
  async getAllPayments() {
    return this.paymentsService.getAllPayments();
  }

  @Roles('INVESTOR', 'BROKER', 'ADMIN')
  @Get(':id/download')
  async downloadReceipt(@Request() req, @Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const payment = await this.paymentsService.getPaymentFile(id, req.user);
    
    if (!payment.receiptFilePath || !existsSync(payment.receiptFilePath)) {
      throw new NotFoundException('Receipt file not found on server');
    }

    const fileStream = createReadStream(payment.receiptFilePath);
    const safeFilename = (payment.receiptFileName || 'receipt').replace(/[^a-zA-Z0-9.\-_]/g, '_');
    
    let mimeType = 'application/octet-stream';
    if (safeFilename.endsWith('.pdf')) mimeType = 'application/pdf';
    else if (safeFilename.endsWith('.png')) mimeType = 'image/png';
    else if (safeFilename.endsWith('.jpeg') || safeFilename.endsWith('.jpg')) mimeType = 'image/jpeg';

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${safeFilename}"`,
    });
    
    return new StreamableFile(fileStream);
  }

  @Roles('BROKER', 'ADMIN')
  @Patch(':id/verify')
  async verifyPayment(@Request() req, @Param('id') id: string) {
    return this.paymentsService.verifyPayment(req.user.id, id);
  }

  @Roles('BROKER', 'ADMIN')
  @Patch(':id/reject')
  async rejectPayment(
    @Request() req,
    @Param('id') id: string,
    @Body('reason') reason: string
  ) {
    return this.paymentsService.rejectPayment(req.user.id, id, reason);
  }
}
