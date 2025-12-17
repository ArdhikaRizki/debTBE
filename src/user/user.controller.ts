import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.userService.findUnique({ id: req.user.userId });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers() {
    return this.userService.findMany({});
  }
}
