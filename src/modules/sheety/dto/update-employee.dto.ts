import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  hariKerja: string;

  @IsString()
  @IsNotEmpty()
  jamMasuk: string;

  @IsString()
  @IsNotEmpty()
  jamKeluar: string;

  @IsBoolean()
  isWfh: boolean;
}
