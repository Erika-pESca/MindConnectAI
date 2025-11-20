import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Historial } from './entities/historial.entity';
import { User } from '../user/entities/user.entity';
import { CreateHistorialDto } from './dto/create-historial.dto';
import { UpdateHistorialDto } from './dto/update-historial.dto';

@Injectable()
export class HistorialService {
  constructor(
    @InjectRepository(Historial)
    private readonly historialRepository: Repository<Historial>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createHistorialDto: CreateHistorialDto): Promise<Historial> {
    const user = await this.userRepository.findOneBy({
      id: createHistorialDto.userId,
    });
    if (!user) {
      throw new NotFoundException(
        `User with ID ${createHistorialDto.userId} not found`,
      );
    }

    const newHistorial = this.historialRepository.create({ user });
    return this.historialRepository.save(newHistorial);
  }

  findAll(): Promise<Historial[]> {
    return this.historialRepository.find({ relations: ['user', 'wiseChats'] });
  }

  async findOne(id: number): Promise<Historial> {
    const historial = await this.historialRepository.findOne({
      where: { id },
      relations: ['user', 'wiseChats'],
    });
    if (!historial) {
      throw new NotFoundException(`Historial with ID ${id} not found`);
    }
    return historial;
  }

  async update(
    id: number,
    updateHistorialDto: UpdateHistorialDto,
  ): Promise<Historial> {
    // Since UpdateHistorialDto is currently empty, this method won't change anything.
    // It's structured to be easily expandable later.
    const historial = await this.findOne(id);
    // const updated = Object.assign(historial, updateHistorialDto); // Example of how to merge
    // return this.historialRepository.save(updated);
    return historial; // Returning the found entity without changes
  }

  async remove(id: number): Promise<void> {
    const result = await this.historialRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Historial with ID ${id} not found`);
    }
  }
}
