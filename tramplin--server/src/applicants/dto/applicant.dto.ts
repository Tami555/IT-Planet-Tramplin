import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {
    IsArray,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';
import {Type} from 'class-transformer';
import {PrivacyLevel} from '@prisma/client';

export class UpdateApplicantProfileDto {
    @ApiPropertyOptional({example: 'Иван', description: 'Имя'})
    @IsOptional()
    @IsString({message: 'Имя должно быть строкой'})
    @MaxLength(50, {message: 'Имя не может превышать 50 символов'})
    firstName?: string;

    @ApiPropertyOptional({example: 'Иванов', description: 'Фамилия'})
    @IsOptional()
    @IsString({message: 'Фамилия должна быть строкой'})
    @MaxLength(50, {message: 'Фамилия не может превышать 50 символов'})
    lastName?: string;

    @ApiPropertyOptional({example: 'Иванович', description: 'Отчество'})
    @IsOptional()
    @IsString()
    @MaxLength(50)
    middleName?: string;

    @ApiPropertyOptional({example: 'МГУ им. Ломоносова', description: 'Учебное заведение'})
    @IsOptional()
    @IsString()
    @MaxLength(200)
    university?: string;

    @ApiPropertyOptional({example: 2026, description: 'Год выпуска'})
    @IsOptional()
    @Type(() => Number)
    @IsInt({message: 'Год выпуска должен быть числом'})
    @Min(2000)
    @Max(2040)
    graduationYear?: number;

    @ApiPropertyOptional({example: 3, description: 'Текущий курс (1-6)'})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(6)
    course?: number;

    @ApiPropertyOptional({example: 'Увлечённый разработчик, ищу первую стажировку...', description: 'О себе'})
    @IsOptional()
    @IsString()
    @MaxLength(1000, {message: 'Описание не может превышать 1000 символов'})
    bio?: string;

    @ApiPropertyOptional({type: [String], example: ['Python', 'Django', 'SQL'], description: 'Навыки'})
    @IsOptional()
    @IsArray({message: 'Навыки должны быть массивом'})
    @IsString({each: true})
    skills?: string[];

    @ApiPropertyOptional({
        type: [String],
        example: ['https://github.com/ivan'],
        description: 'Ссылки на портфолио/репозитории'
    })
    @IsOptional()
    @IsArray()
    @IsString({each: true})
    portfolioLinks?: string[];
}

export class UpdatePrivacyDto {
    @ApiPropertyOptional({
        enum: PrivacyLevel,
        description: 'Видимость резюме: PRIVATE — только я, CONTACTS — контакты, PUBLIC — все',
    })
    @IsOptional()
    @IsEnum(PrivacyLevel, {message: 'Некорректное значение приватности резюме'})
    privacyResume?: PrivacyLevel;

    @ApiPropertyOptional({enum: PrivacyLevel, description: 'Видимость откликов'})
    @IsOptional()
    @IsEnum(PrivacyLevel, {message: 'Некорректное значение приватности откликов'})
    privacyResponses?: PrivacyLevel;

    @ApiPropertyOptional({enum: PrivacyLevel, description: 'Видимость профиля'})
    @IsOptional()
    @IsEnum(PrivacyLevel, {message: 'Некорректное значение приватности профиля'})
    privacyProfile?: PrivacyLevel;
}

export class CreateApplicationDto {
    @ApiProperty({example: 'uuid-opportunity', description: 'UUID вакансии'})
    @IsString({message: 'ID возможности должен быть строкой'})
    opportunityId: string;

    @ApiPropertyOptional({
        example: 'Здравствуйте! Я очень хочу присоединиться...',
        description: 'Сопроводительное письмо'
    })
    @IsOptional()
    @IsString()
    @MaxLength(2000, {message: 'Сопроводительное письмо не может превышать 2000 символов'})
    coverLetter?: string;
}

export class AddToFavoritesDto {
    @ApiProperty({example: 'uuid-opportunity', description: 'UUID вакансии'})
    @IsString({message: 'ID возможности должен быть строкой'})
    opportunityId: string;
}

export class ContactRequestDto {
    @ApiProperty({example: 'uuid-applicant', description: 'UUID соискателя, которому отправляется запрос'})
    @IsString({message: 'ID соискателя должен быть строкой'})
    receiverId: string;
}

export class RecommendDto {
    @ApiProperty({example: 'uuid-contact', description: 'UUID контакта, которому рекомендуем'})
    @IsString()
    contactId: string;

    @ApiProperty({example: 'uuid-opportunity', description: 'UUID вакансии для рекомендации'})
    @IsString()
    opportunityId: string;

    @ApiPropertyOptional({example: 'Отличный кандидат, рекомендую!'})
    @IsOptional()
    @IsString()
    @MaxLength(500)
    message?: string;
}
