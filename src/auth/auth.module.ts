import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
// Use require() because '@nestjs-modules/mailer' does not provide TypeScript declarations
// @ts-ignore: package does not provide TypeScript declarations
const { MailerModule } = require('@nestjs-modules/mailer');
import { join } from 'path';
// @ts-ignore: package does not provide TypeScript declarations for the adapter path
const { HandlebarsAdapter } = require('@nestjs-modules/mailer/dist/adapters/handlebars.adapter');
import { UserModule } from '../user/user.module'; // Import UserModule

@Module({
  imports: [
    // If ConfigModule is not already global in your AppModule, you can set it here.
    // Otherwise, you can remove this line if it's configured globally in app.module.ts
    ConfigModule.forRoot(),
    UserModule, // Add UserModule to imports
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          service: 'gmail',
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: configService.get<string>('MAIL_FROM'),
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule], // Export JwtModule to be used in other modules for guards
})
export class AuthModule {}
