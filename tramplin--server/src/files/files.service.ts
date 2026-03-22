import {
    Injectable,
    BadRequestException,

} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import {v4 as uuidv4} from 'uuid';

export type FileCategory = 'avatars' | 'resumes' | 'logos' | 'media' | 'office';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC_TYPES = ['application/pdf'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

@Injectable()
export class FilesService {
    private readonly uploadDir: string;

    constructor(private config: ConfigService) {
        this.uploadDir = config.get<string>('UPLOAD_DIR', './uploads');
        this.ensureDirectories();
    }

    private ensureDirectories() {
        const categories: FileCategory[] = ['avatars', 'resumes', 'logos', 'media', 'office'];
        categories.forEach((cat) => {
            const dir = path.join(this.uploadDir, cat);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, {recursive: true});
            }
        });
    }

    async saveFile(
        file: Express.Multer.File,
        category: FileCategory,
    ): Promise<string> {
        this.validateFile(file, category);

        const ext = path.extname(file.originalname).toLowerCase();
        const filename = `${uuidv4()}${ext}`;
        const dest = path.join(this.uploadDir, category, filename);

        fs.writeFileSync(dest, file.buffer);

        return `/uploads/${category}/${filename}`;
    }

    async saveMultipleFiles(
        files: Express.Multer.File[],
        category: FileCategory,
    ): Promise<string[]> {
        return Promise.all(files.map((f) => this.saveFile(f, category)));
    }

    deleteFile(fileUrl: string): void {
        if (!fileUrl) return;
        const relativePath = fileUrl.replace('/uploads/', '');
        const fullPath = path.join(this.uploadDir, relativePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }

    private validateFile(file: Express.Multer.File, category: FileCategory): void {
        const maxSizeMb = this.config.get<number>('MAX_FILE_SIZE_MB', 10);
        const maxBytes = maxSizeMb * 1024 * 1024;

        if (file.size > maxBytes) {
            throw new BadRequestException(
                `Размер файла превышает допустимый лимит ${maxSizeMb} МБ`,
            );
        }

        let allowedTypes: string[];
        if (category === 'resumes') {
            allowedTypes = [...ALLOWED_DOC_TYPES, ...ALLOWED_IMAGE_TYPES];
        } else if (category === 'media') {
            allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
        } else {
            allowedTypes = ALLOWED_IMAGE_TYPES;
        }

        if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                `Недопустимый тип файла. Разрешены: ${allowedTypes.join(', ')}`,
            );
        }
    }
}
