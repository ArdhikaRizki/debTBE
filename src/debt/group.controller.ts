import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GroupService } from './group.service';
import { CreateGroupDto, UpdateGroupDto, AddGroupMemberDto } from './dto/group.dto';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateGroupDto) {
    return this.groupService.create(req.user.userId, dto);
  }

  @Get()
  async findAll(@Request() req) {
    return this.groupService.findAll(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.groupService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.groupService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    await this.groupService.delete(id, req.user.userId);
    return { ok: true };
  }

  @Get(':id/members')
  async getMembers(@Request() req, @Param('id') id: string) {
    return this.groupService.getMembers(id, req.user.userId);
  }

  @Post(':id/members')
  async addMember(@Request() req, @Param('id') id: string, @Body() dto: AddGroupMemberDto) {
    return this.groupService.addMember(id, req.user.userId, dto);
  }

  @Delete(':id/members/:userId')
  async removeMember(@Request() req, @Param('id') id: string, @Param('userId') memberUserId: string) {
    await this.groupService.removeMember(id, req.user.userId, memberUserId);
    return { ok: true };
  }
}
