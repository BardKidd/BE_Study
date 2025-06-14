import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Alice', description: '使用者名稱' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({ example: 'alice@example.com', description: '電子信箱' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;
}
