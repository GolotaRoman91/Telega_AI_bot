import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConversationHistory } from './conversation-history.model';
import { ArchivedDialog } from './archived-dialog.model';

@Injectable()
export class ConversationHistoryService {
  constructor(
    @InjectModel(ConversationHistory)
    private conversationHistoryModel: typeof ConversationHistory,
    @InjectModel(ArchivedDialog)
    private archivedDialogModel: typeof ArchivedDialog,
  ) {}

  async archiveConversationHistory(
    userId: number,
    conversationHistory: Array<{ role: string; content: string }>,
  ) {
    try {
      await this.archivedDialogModel.create({
        userId,
        history: this.serializeHistory(conversationHistory),
        archivedAt: new Date(),
      });

      // Optionally, clear the conversation history after archiving
      await this.conversationHistoryModel.update(
        { history: this.serializeHistory([]) },
        { where: { userId } },
      );
    } catch (error) {
      console.error('Error in archiveConversationHistory:', error);
      throw error;
    }
  }

  async getOrCreateConversationHistory(userId: number) {
    try {
      const [conversationHistory, created] =
        await this.conversationHistoryModel.findOrCreate({
          where: { userId },
          defaults: {
            userId,
            history: this.serializeHistory([
              { role: 'system', content: 'You are a helpful assistant.' },
            ]),
          },
        });

      return created
        ? this.deserializeHistory(conversationHistory.history)
        : this.deserializeHistory(conversationHistory.history);
    } catch (error) {
      console.error('Error in getOrCreateConversationHistory:', error);
      throw error;
    }
  }

  async updateConversationHistory(
    userId: number,
    updatedHistory: Array<{ role: string; content: string }>,
  ) {
    await this.conversationHistoryModel.update(
      { history: this.serializeHistory(updatedHistory) },
      { where: { userId } },
    );
  }

  private serializeHistory(history: Array<{ role: string; content: string }>) {
    return JSON.stringify(history);
  }

  private deserializeHistory(serializedHistory: string) {
    return JSON.parse(serializedHistory);
  }
}
