import { Column, Model, Table, DataType, HasMany } from 'sequelize-typescript';
import { Conversation } from './conversation.model';

@Table
export class Users extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
  })
  userId: number;

  @Column({
    type: DataType.ARRAY(DataType.INTEGER),
    allowNull: false,
    defaultValue: [],
  })
  history: number[];

  @HasMany(() => Conversation)
  conversations: Conversation[];
}
