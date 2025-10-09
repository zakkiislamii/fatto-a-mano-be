import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RegisterTokenDto } from './dtos/register-token.dto';
import { SendToUserDto } from './dtos/send-to-user.dto';
import { SendToAllDto } from './dtos/send-to-all.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notif: NotificationsService) {}

  /** Mobile memanggil saat login/launch untuk daftar token */
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

  /** Opsional: dipanggil saat logout/uninstall */
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

  /** 1) Kirim ke salah satu karyawan (berdasarkan UID) */
  @Post('send-to-user')
  async sendToUser(@Body() dto: SendToUserDto) {
    return this.notif.sendToUser(dto.uid, dto.title, dto.body, dto.data);
  }

  /** 2) Kirim ke seluruh karyawan (topic global) */
  @Post('send-to-all')
  async sendToAll(@Body() dto: SendToAllDto) {
    return this.notif.sendToAll(dto.title, dto.body, dto.data);
  }
}
