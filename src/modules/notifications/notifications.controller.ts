import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RegisterTokenDto } from './dto/register-token.dto';
import { SendToUserDto } from './dto/send-to-user.dto';
import { SendToAllDto } from './dto/send-to-all.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notif: NotificationsService) {}

  @Post('register-token')
  @HttpCode(HttpStatus.OK)
  async registerToken(@Body() dto: RegisterTokenDto): Promise<boolean> {
    try {
      await this.notif.registerToken(dto.uid, dto.token);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  @Post('unregister-token')
  @HttpCode(HttpStatus.OK)
  async unregisterToken(@Body() dto: RegisterTokenDto): Promise<boolean> {
    try {
      await this.notif.unregisterToken(dto.uid, dto.token);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  @Post('send-to-user')
  async sendToUser(@Body() dto: SendToUserDto) {
    return this.notif.sendToUser(dto.uid, dto.title, dto.body);
  }

  @Post('send-to-all')
  async sendToAll(@Body() dto: SendToAllDto) {
    return this.notif.sendToAll(dto.title, dto.body);
  }
}
