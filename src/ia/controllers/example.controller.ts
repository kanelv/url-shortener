import { Controller, Get } from '@nestjs/common';
import { Role } from '../../domain/entities/enums';
import { Public } from '../guards/public.decorator';
import { Roles } from '../guards/role.decorator';

@Controller('examples')
export class ExampleController {
  @Public()
  @Get('guest')
  async guestEndpoint() {
    return 'Accessible by Guest, User, and Admin';
  }

  @Get('user')
  @Roles(Role.User)
  async userEndpoint() {
    return 'Accessible by User, and Admin';
  }

  @Get('admin')
  @Roles(Role.Admin)
  async adminEndpoint() {
    return 'Accessible by Admin only';
  }
}
