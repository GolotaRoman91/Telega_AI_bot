import { Injectable } from '@nestjs/common';
import { User } from '../models/user.model';
import { Conversation } from '../models/conversation.model';

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

  async getConversationsByTelegramId(telegramId: number): Promise<string> {
    const conversations = await Conversation.findAll({
      include: [
        {
          model: User,
          where: { telegramId },
          attributes: [],
        },
      ],
    });

    return conversations
      .map((conversation) => conversation.conversationId)
      .join(', ');
  }
}
