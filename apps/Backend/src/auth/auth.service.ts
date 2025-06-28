import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.findUserForAuth(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(data: { email: string; name: string; password: string }) {
    const existingUser = await this.userService.findByEmail(data.email);
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const newUser = await this.userService.create(data);
    const { password: _, ...result } = newUser;
    return result;
  }
}
