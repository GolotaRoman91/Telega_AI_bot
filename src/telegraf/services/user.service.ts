import { Injectable } from '@nestjs/common';
import { User } from '../models/user.model';

@Injectable()
export class UserService {
  async findOrCreateUser(telegramId: number): Promise<User> {
    const [user, created] = await User.findOrCreate({
      where: { telegramId },
      defaults: { telegramId },
    });

    if (created) {
      console.log(`New user created with telegramId: ${telegramId}`);
    } else {
      console.log(`User with telegramId: ${telegramId} already exists`);
    }

    return user;
  }

  async findUserByTelegramId(telegramId: number): Promise<User | null> {
    return await User.findOne({ where: { telegramId } });
  }
}
