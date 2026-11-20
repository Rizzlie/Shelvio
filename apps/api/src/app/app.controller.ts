import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  /** Placeholder route the web app calls to prove the `/api` proxy works. */
  @Get('ping')
  ping(): { message: string } {
    return { message: 'pong' };
  }
}
