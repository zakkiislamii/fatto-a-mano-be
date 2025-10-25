import { IsString, IsNotEmpty } from 'class-validator';

export class SendToAllDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}
