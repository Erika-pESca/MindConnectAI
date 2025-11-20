import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Historial } from './entities/historial.entity';
import { User } from '../user/entities/user.entity';
import { HistorialService } from './historial.service';
import { HistorialController } from './historial.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Historial, User])],
  controllers: [HistorialController],
  providers: [HistorialService],
})
export class HistorialModule {}
