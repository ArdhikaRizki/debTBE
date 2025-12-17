import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findUnique({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    };
  }

  async register(data: {
    username: string;
    password: string;
    name: string;
    email: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userService.createUser({
      ...data,
      password: hashedPassword,
    });
    const { password, ...result } = user;
    return result;
  }
}
