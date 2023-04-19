import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';
import { Conversation } from '../models/conversation.model';
import { Message } from '../models/message.model';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Conversation) private conversationModel: typeof Conversation,
  ) {}

  async startConversation(telegramId: number): Promise<Conversation> {
    let user = await this.userModel.findOne({ where: { telegramId } });

    if (!user) {
      user = await this.userModel.create({ telegramId });
    }

    return await this.conversationModel.create({ userId: user.id });
  }

  async findUserByTelegramId(telegramId: number): Promise<User | null> {
    return await this.userModel.findOne({ where: { telegramId } });
  }

  //   async endConversation(conversationId: number): Promise<void> {}

  async getConversationHistory(conversationId: number): Promise<Message[]> {
    const conversation = await this.conversationModel.findByPk(conversationId, {
      include: [Message],
    });

    return conversation.messages;
  }
}
