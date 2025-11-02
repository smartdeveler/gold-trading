// models/Cart.ts
import { Model, DataTypes } from "sequelize";
import db from "../db";

export default class Cart extends Model {
  declare public id: number;
  declare public userId: number;
}

 Cart.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: "carts",
  }
);

Cart.sync(/* { force: true } */); 
