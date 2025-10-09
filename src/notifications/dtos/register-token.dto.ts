import { IsString, IsNotEmpty } from 'class-validator';

export class RegisterTokenDto {
  @IsString()
  @IsNotEmpty()
  uid!: string;

  @IsString()
  @IsNotEmpty()
  token!: string;
}
