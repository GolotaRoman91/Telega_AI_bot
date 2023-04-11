import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ConversationHistory } from './conversation-history.model';

@Table
export class Conversation extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => ConversationHistory)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @BelongsTo(() => ConversationHistory)
  user: ConversationHistory;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  history: string;

  @ForeignKey(() => ConversationHistory)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  conversationHistoryId: number;

  @BelongsTo(() => ConversationHistory)
  conversationHistory: ConversationHistory;
}
