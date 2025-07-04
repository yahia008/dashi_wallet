import { IsEmail, IsEnum, IsNotEmpty, IsOptional, Length, Matches  } from 'class-validator';


export enum UserRole {
  AGENT = 'agent',
  ADMIN = 'admin',
  USER = 'user',
}
export class signUp {
  
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  phone:string

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be either agent, admin, or user' })
  role?: UserRole;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(6, 20)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'Password too weak',
  })
  password: string;



  @IsNotEmpty()
photo:string
  
}

export class forgotDto{
  @IsNotEmpty()
  @IsEmail()
  email:string
}