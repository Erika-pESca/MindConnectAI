import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  // CREATE
  async create(dto: CreateUserDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new UnauthorizedException('Email already exists');

    const user = this.userRepo.create({
      ...dto,
      password: await bcrypt.hash(dto.password, 10),
      last_login: new Date(),
    });

    return this.userRepo.save(user);
  }

  // GET ALL
  findAll() {
    return this.userRepo.find();
  }

  // GET ONE
  async findOne(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['historial'],
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // UPDATE
  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (dto.password) dto.password = await bcrypt.hash(dto.password, 10);

    Object.assign(user, dto);

    return this.userRepo.save(user);
  }

  // DELETE
  async remove(id: number) {
    const user = await this.findOne(id);
    return this.userRepo.remove(user);
  }

  // LOGIN
  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    user.last_login = new Date();
    await this.userRepo.save(user);

    return user;
  }
}

