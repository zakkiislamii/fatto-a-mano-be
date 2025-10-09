import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class SendToUserDto {
  @IsString()
  @IsNotEmpty()
  uid!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, string>;
}
