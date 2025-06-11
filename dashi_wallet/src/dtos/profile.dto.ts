// src/users/dto/create-profile.dto.ts

import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProfileDto {
  @IsEnum(['bvn', 'national id', 'passport', 'others'], {
    message:
      'Identification must be one of: bvn, national id, passport, others',
  })
  identification: 'bvn' | 'national id' | 'passport' | 'others';

  @IsString()
  @IsNotEmpty({ message: 'ID number is required' })
  idnumber: string;

  @IsString()
  @IsNotEmpty({ message: 'Country is required' })
  country: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @IsString()
  @IsNotEmpty({ message: 'Photo is required' })
  photo: string;
}
