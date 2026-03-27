import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class RegisterEmployerDto {
    @ApiProperty({ example: 'hr@techcompany.ru', description: 'Email компании' })
    @IsEmail({}, { message: 'Некорректный формат электронной почты' })
    @IsNotEmpty({ message: 'Email обязателен' })
    email: string;

    @ApiProperty({ example: 'ТехноКомпания', description: 'Название компании' })
    @IsString({ message: 'Название компании должно быть строкой' })
    @IsNotEmpty({ message: 'Название компании обязательно' })
    companyName: string;

    @ApiProperty({ example: 'Password123!', description: 'Пароль (мин. 8 символов, заглавная буква и цифра)' })
    @IsString()
    @MinLength(8, { message: 'Пароль должен содержать не менее 8 символов' })
    @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
        message: 'Пароль должен содержать хотя бы одну заглавную букву и одну цифру',
    })
    password: string;

    @ApiProperty({ example: 'ТехноКомпания', description: 'Отображаемое имя (название компании)' })
    @IsString()
    @IsNotEmpty()
    displayName: string;
}