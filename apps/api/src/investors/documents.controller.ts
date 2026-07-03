import { Controller, Post, Get, Param, UseGuards, UseInterceptors, UploadedFile, Request, BadRequestException, NotFoundException, StreamableFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync, createReadStream } from 'fs';
import { InvestorsService } from './investors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { Response } from 'express';

const UPLOADS_DIR = join(process.cwd(), 'uploads');

if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('investors/documents')
export class DocumentsController {
  constructor(private readonly investorsService: InvestorsService) {}

  @Roles('INVESTOR')
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const userId = (req.user as any).id;
        const userDir = join(UPLOADS_DIR, userId);
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
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
      }
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB
    },
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Invalid file type. Only PDF, JPEG, and PNG are allowed.'), false);
      }
    }
  }))
  async uploadDocument(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.investorsService.uploadDocument(req.user.id, file);
  }

  @Roles('INVESTOR', 'BROKER', 'ADMIN')
  @Get()
  async getDocuments(@Request() req) {
    return this.investorsService.getDocuments(req.user.id);
  }

  @Roles('INVESTOR', 'BROKER', 'ADMIN')
  @Get(':id')
  async downloadDocument(@Request() req, @Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const document = await this.investorsService.getDocumentById(id, req.user);
    
    if (!existsSync(document.filePath)) {
      throw new NotFoundException('Document file not found on server');
    }

    const fileStream = createReadStream(document.filePath);
    
    // Sanitize the original filename to prevent HTTP Response Splitting
    const safeFilename = (document.fileName || 'document').replace(/[^a-zA-Z0-9.\-_]/g, '_');
    
    res.set({
      'Content-Type': document.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${safeFilename}"`,
    });
    
    return new StreamableFile(fileStream);
  }
}
