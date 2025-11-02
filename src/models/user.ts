import { Model, Sequelize, DataTypes } from "sequelize";
import db from "../db";


export default class User extends Model {
 declare  public id?: number;
 declare public  name: string;
 declare public  birthdate?: Date;
 declare public  username?: string;
 declare public  password?: string;
 declare public  phone?: string;
 declare public  isAdmin?: boolean;
}


 User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
    },
    family: {
      type: DataTypes.STRING(255),
    },
    username: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize: db,
    tableName: "users",
  }
);
User.sync(/* { force: true } */); 
