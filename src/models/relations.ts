import User from "./user";
import Gold from "./gold";
import Cart from "./cart";
import CartItem from "./cartItem";
import Order from "./order";
import OrderItem from "./orderItem";

// User 1️⃣—1️⃣ Cart
User.hasOne(Cart, { foreignKey: "userId", as: "cart" });
Cart.belongsTo(User, { foreignKey: "userId", as: "user" });

// Cart 1️⃣—🔁 CartItem
Cart.hasMany(CartItem, { foreignKey: "cartId", as: "items" });
CartItem.belongsTo(Cart, { foreignKey: "cartId", as: "cart" });

// Gold 1️⃣—🔁 CartItem
Gold.hasMany(CartItem, { foreignKey: "goldId", as: "cartItems" });
CartItem.belongsTo(Gold, { foreignKey: "goldId", as: "gold" });

// Order
User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });

// OrderItem
Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });
Gold.hasMany(OrderItem, { foreignKey: "goldId", as: "orderItems" });
OrderItem.belongsTo(Gold, { foreignKey: "goldId", as: "gold" });