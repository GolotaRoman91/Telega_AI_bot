import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Message } from './message.model';

@Table({ tableName: 'conversations' })
export class Conversation extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  conversationId: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @HasMany(() => Message)
  messages: Message[];
}
