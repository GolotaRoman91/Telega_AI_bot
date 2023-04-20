import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Conversation } from './conversation.model';

@Table({ tableName: 'messages' })
export class Message extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Conversation)
  @Column(DataType.INTEGER)
  conversationId: number;

  @Column(DataType.TEXT)
  content: string;

  @Column(DataType.ENUM('user', 'bot'))
  sender: 'user' | 'bot';

  @Column(DataType.DATE)
  timestamp: Date;

  @BelongsTo(() => Conversation)
  conversation: Conversation;
}
