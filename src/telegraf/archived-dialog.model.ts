import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table
export class ArchivedDialog extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  history: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  archivedAt: Date;
}
