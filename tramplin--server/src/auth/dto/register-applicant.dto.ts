import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class RegisterApplicantDto {
    @ApiProperty({ example: 'ivan@example.com', description: 'Email соискателя' })
    @IsEmail({}, { message: 'Некорректный формат электронной почты' })
    @IsNotEmpty({ message: 'Email обязателен' })
    email: string;

    @ApiProperty({ example: 'Иван', description: 'Имя' })
    @IsString({ message: 'Имя должно быть строкой' })
    @IsNotEmpty({ message: 'Имя обязательно' })
    firstName: string;

    @ApiProperty({ example: 'Иванов', description: 'Фамилия' })
    @IsString({ message: 'Фамилия должна быть строкой' })
    @IsNotEmpty({ message: 'Фамилия обязательна' })
    lastName: string;

    @ApiProperty({ example: 'Password123!', description: 'Пароль (мин. 8 символов, заглавная буква и цифра)' })
    @IsString()
    @MinLength(8, { message: 'Пароль должен содержать не менее 8 символов' })
    @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
        message: 'Пароль должен содержать хотя бы одну заглавную букву и одну цифру',
    })
    password: string;

    @ApiProperty({ example: 'Иван Иванов', description: 'Отображаемое имя (формируется автоматически)' })
    @IsString()
    @IsNotEmpty()
    displayName: string;
}