import { Model, DataTypes } from "sequelize";
import db from "../db";
import User from "./user";

export default class Order extends Model {
  declare id: number;
  declare userId: number;
  declare totalPrice: number;
  declare status: string;
}

Order.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    totalPrice: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  { sequelize: db, tableName: "orders" }
);



Order.sync(/* { force: true } */); 
