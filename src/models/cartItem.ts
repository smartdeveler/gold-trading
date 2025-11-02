// models/CartItem.ts
import { Model, DataTypes, type BelongsToGetAssociationMixin, type BelongsToSetAssociationMixin, type BelongsToCreateAssociationMixin } from "sequelize";
import db from "../db";
import type Gold from "./gold";

export default class CartItem extends Model {
  public declare id: number;
  public declare cartId: number;
  public declare goldId: number;
  public declare quantity: number;
  public declare unitPriceAtAdd: number;
  public declare totalPrice: number;
  // --- اعلام association property برای eager-loaded relation ---
  public gold?: Gold; // این به TS می‌گه که cartItem.gold ممکنه وجود داشته باشه

  // --- mixin ها (اختیاری اما مفید برای typed association methods) ---
  public getGold!: BelongsToGetAssociationMixin<Gold>;
  public setGold!: BelongsToSetAssociationMixin<Gold, number>;
  public createGold!: BelongsToCreateAssociationMixin<Gold>;
}

CartItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    goldId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    unitPriceAtAdd: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: "cart_items",
  }
);

CartItem.sync(/* { force: true } */); 
