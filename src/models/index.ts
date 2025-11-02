// models/index.ts
import User from "./user";
import Cart from "./cart";
import CartItem from "./cartItem";
import Gold from "./gold";

User.hasOne(Cart, { as: "cart", foreignKey: "userId" });
Cart.belongsTo(User, { as: "user", foreignKey: "userId" });
Cart.hasMany(CartItem, { as: "items", foreignKey: "cartId" });
CartItem.belongsTo(Cart, { as: "cart", foreignKey: "cartId" });
Gold.hasMany(CartItem, { as: "cartItems", foreignKey: "goldId" });
CartItem.belongsTo(Gold, { as: "gold", foreignKey: "goldId" });

export { User, Cart, CartItem, Gold };
