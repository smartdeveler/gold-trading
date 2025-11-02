// models/OrderItem.ts
import { Model, DataTypes } from "sequelize";
import db from "../db";

export default class OrderItem extends Model {
  declare id: number;
  declare orderId: number;
  declare goldId: number;
  declare quantity: number;
  declare unitPrice: number;
  declare totalPrice: number;
}

OrderItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    goldId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    unitPrice: { type: DataTypes.FLOAT, allowNull: false },
    totalPrice: { type: DataTypes.FLOAT, allowNull: false },
  },
  { sequelize: db, tableName: "order_items" }
);


OrderItem.sync(/* { force: true } */); 

