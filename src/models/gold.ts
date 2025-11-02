import { Model, Sequelize, DataTypes } from "sequelize";
import db from "../db";

export default class Gold extends Model {
  declare public id?: number;
  declare public title: string;
  declare public weight: number;
  declare public price_per_gram: number;
  declare public desc?: number;
  declare public stock: number;
  declare public img_url: number;
}
 Gold.init(
   {
     id: {
       type: DataTypes.INTEGER,
       autoIncrement: true,
       primaryKey: true,
     },
     title: {
       type: DataTypes.STRING(255),
     },
     weight: {
       type: DataTypes.FLOAT,
     },
     price_per_gram: {
       type: DataTypes.FLOAT,
     },
     desc: {
       type: DataTypes.STRING(255),
     },
     stock: {
       type: DataTypes.INTEGER,
     },
     img_url: {
       type: DataTypes.STRING(10000),
     },
   },
   {
     sequelize: db,
     tableName: "golds",
   }
 );
Gold.sync(/* {force:true} */);

