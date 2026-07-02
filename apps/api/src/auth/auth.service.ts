import { Injectable, ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    try {
      // Create User and Investor Profile within a transaction
      const newUser = await this.prisma.$transaction(async (prisma) => {
        const user = await prisma.user.create({
          data: {
            email,
            passwordHash,
            firstName,
            lastName,
            role: 'INVESTOR', // Default role per MVP
            status: 'PENDING',
          },
        });

        await prisma.investorProfile.create({
          data: {
            userId: user.id,
            kycStatus: 'PENDING',
            country: 'Mozambique',
          },
        });

        return user;
      });

      // Remove passwordHash from response
      const { passwordHash: _, ...result } = newUser;
      return result;
    } catch (error) {
      console.error('Registration Error:', error);
      throw new InternalServerErrorException('Error creating user profile');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT tokens
    const payload = { sub: user.id, email: user.email, role: user.role };
    
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m', // Short lived access token
    });
    
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d', // Long lived refresh token
    });

    // Return tokens and user info
    const { passwordHash: _, ...userInfo } = user;
    
    return {
      accessToken,
      refreshToken,
      user: userInfo,
    };
  }
}
