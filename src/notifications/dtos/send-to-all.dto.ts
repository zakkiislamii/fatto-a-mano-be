import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class SendToAllDto {
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
