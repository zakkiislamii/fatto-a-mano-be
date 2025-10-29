import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  uid: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  nama: string;

  @IsString()
  @IsNotEmpty()
  nik: string;

  @IsString()
  @IsNotEmpty()
  nomorHp: string;

  @IsString()
  @IsNotEmpty()
  divisi: string;

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
