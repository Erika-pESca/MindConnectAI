import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  private getFrontendPath(): string {
    const rootPath = process.cwd(); // En Docker esto será /app
    return join(rootPath, 'frontend');
  }

  @Get()
  getFrontend(@Res() res: Response) {
    const frontendPath = this.getFrontendPath();
    const indexPath = join(frontendPath, 'index.html');
    
    if (existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({
        message: 'Frontend no encontrado',
        path: indexPath,
        __dirname: __dirname,
        frontendPath: frontendPath,
      });
    }
  }

  @Get('index.html')
  getIndex(@Res() res: Response) {
    const frontendPath = this.getFrontendPath();
    const indexPath = join(frontendPath, 'index.html');
    res.sendFile(indexPath);
  }

  @Get('chat.html')
  getChat(@Res() res: Response) {
    const rootPath = process.cwd();
    const chatPath = join(rootPath, 'chat-frontend', 'chat.html');
    if (existsSync(chatPath)) {
      res.sendFile(chatPath);
    } else {
      res.status(404).json({
        message: 'chat.html no encontrado',
        path: chatPath,
      });
    }
  }

  @Get('chat-frontend/chat.html')
  getChatFrontend(@Res() res: Response) {
    const rootPath = process.cwd();
    const chatPath = join(rootPath, 'chat-frontend', 'chat.html');
    if (existsSync(chatPath)) {
      res.sendFile(chatPath);
    } else {
      res.status(404).json({
        message: 'chat.html no encontrado en chat-frontend',
        path: chatPath,
      });
    }
  }

  @Get('salas.html')
  getSalas(@Res() res: Response) {
    const frontendPath = this.getFrontendPath();
    const salasPath = join(frontendPath, 'salas.html');
    if (existsSync(salasPath)) {
      res.sendFile(salasPath);
    } else {
      res.status(404).json({
        message: 'salas.html no encontrado',
        path: salasPath,
      });
    }
  }

  @Get('welcome.html')
  getWelcome(@Res() res: Response) {
    const frontendPath = this.getFrontendPath();
    const welcomePath = join(frontendPath, 'welcome.html');
    if (existsSync(welcomePath)) {
      res.sendFile(welcomePath);
    } else {
      res.status(404).json({
        message: 'welcome.html no encontrado',
        path: welcomePath,
      });
    }
  }

  @Get('reset-password.html')
  getResetPassword(@Res() res: Response) {
    const frontendPath = this.getFrontendPath();
    const resetPath = join(frontendPath, 'reset-password.html');
    if (existsSync(resetPath)) {
      res.sendFile(resetPath);
    } else {
      res.status(404).json({
        message: 'reset-password.html no encontrado',
        path: resetPath,
      });
    }
  }
}
