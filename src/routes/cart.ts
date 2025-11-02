import express, { type Request, type Response } from "express";
import Cart from "../models/cart";
import CartItem from "../models/cartItem";
import Gold from "../models/gold";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Transaction } from "sequelize";
import User from "../models/user";
import OrderItem from "../models/orderItem";
import Order from "../models/order";

// Router for cart operations
const cartRouter = express.Router();

// Apply authentication to all routes
cartRouter.use(authMiddleware);

// -----------------------------
// Middleware: owner or admin
// -----------------------------
// This middleware expects that authMiddleware has set req.user = { id, isAdmin }
// It supports two cases:
//  - routes with :userId (e.g. GET /:userId, DELETE /:userId/clear)
//  - routes with /item/:itemId (use itemId -> find cart)
// If cart is not found it returns 404. If the authenticated user is not the
// owner and not admin it returns 403.
const isOwnerOrAdmin = async (req: Request, res: Response, next: any) => {
  const authUser = (req as any).user;
  if (!authUser) return res.status(401).json({ message: "Unauthorized" });

  const paramUserId = req.params.userId ? Number(req.params.userId) : undefined;
  const itemId = req.params.itemId ? Number(req.params.itemId) : undefined;

  try {
    let cart: any = null;

    if (typeof paramUserId === "number" && !Number.isNaN(paramUserId)) {
      cart = await Cart.findOne({ where: { userId: paramUserId } });
    } else if (typeof itemId === "number" && !Number.isNaN(itemId)) {
      const cartItem = await CartItem.findByPk(itemId);
      if (!cartItem)
        return res.status(404).json({ message: "CartItem not found" });
      cart = await Cart.findByPk(cartItem.cartId);
    }

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    if (cart.userId !== authUser.id && !authUser.isAdmin)
      return res.status(403).json({ message: "Forbidden" });

    // attach resolved cart to request for downstream handlers if needed
    (req as any).cart = cart;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// -----------------------------
// Routes
// -----------------------------

/**
 * GET /cart/:userId
 * return cart for a user (owner or admin)
 */
cartRouter.get(
  "/:userId",
  isOwnerOrAdmin,
  async (req: Request, res: Response) => {
    const paramUserId = Number(req.params.userId);

    try {
      const cart = await Cart.findOne({
        where: { userId: paramUserId },
        include: [{ model: User, as: 'user'},  {
          model: CartItem,
          as: "items",
          include: [{ model: Gold, as: "gold" }],
        }]
      });

      if (!cart) return res.status(404).json({ message: "Cart not found" });
      return res.json(cart);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error", error: err });
    }
  }
);

/**
 * POST /cart/:userId/add
 * add gold to a user's cart (owner or admin)
 * body: { goldId: number, quantity: number }
 */
cartRouter.post("/:userId/add", async (req: Request, res: Response) => {
  const paramUserId = Number(req.params.userId);
  const authUser = (req as any).user;
  const goldId = Number(req.body.goldId);
  const quantity = Number(req.body.quantity);

  if (Number.isNaN(paramUserId))
    return res.status(400).json({ message: "Invalid userId param" });
  if (!Number.isInteger(quantity) || quantity <= 0)
    return res.status(400).json({ message: "Invalid quantity" });
  if (Number.isNaN(goldId))
    return res.status(400).json({ message: "Invalid goldId" });

  // ownership check
  if (paramUserId !== authUser.id && !authUser.isAdmin)
    return res.status(403).json({ message: "Forbidden" });

  try {
    const sequelize = Cart.sequelize!;
    let resultCartItem: any = null;

    await sequelize.transaction(async (t: Transaction) => {
      const [cart] = await Cart.findOrCreate({
        where: { userId: paramUserId },
        defaults: { userId: paramUserId },
        transaction: t,
      });

      const gold = await Gold.findByPk(goldId, { transaction: t });
      if (!gold) throw { status: 404, message: "Gold not found" };

      // check stock
      const existingItem = await CartItem.findOne({
        where: { cartId: cart.id, goldId },
        transaction: t,
      });
      const currentQty = existingItem ? Number(existingItem.quantity) : 0;

      if (currentQty + quantity > gold.stock) {
        throw {
          status: 400,
          message: `Not enough stock. Available: ${gold.stock - currentQty}`,
        };
      }

      // find or create cart item
      const [cartItem, created] = await CartItem.findOrCreate({
        where: { cartId: cart.id, goldId },
        defaults: {
          cartId: cart.id,
          goldId,
          quantity,
          unitPriceAtAdd: gold.price_per_gram,
          totalPrice: quantity * gold.price_per_gram * gold.weight,
        },
        transaction: t,
      });

      if (!created) {
        const newQty = currentQty + quantity;
        cartItem.quantity = newQty;
        cartItem.totalPrice = newQty * gold.price_per_gram * gold.weight;
        await cartItem.save({ transaction: t });
      }

      resultCartItem = cartItem;
    });

    return res.json(resultCartItem);
  } catch (err: any) {
    if (err && err.status)
      return res.status(err.status).json({ message: err.message });
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err });
  }
});

cartRouter.get(
  "/:userId/checkout",
  isOwnerOrAdmin,
  async (req: Request, res: Response) => {
    const paramUserId = Number(req.params.userId);

    try {
      const orders = await Order.findAll({
        where: { userId: paramUserId },
        include: [
          // {
          //   model: OrderItem,
          //   as: "items",
          // },
        ],
        order: [["createdAt", "DESC"]],
      });

      if (!orders || orders.length === 0)
        return res.status(404).json({ message: "No orders found" });

      return res.json({ orders });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error", error: err });
    }
  }
);
cartRouter.post(
  "/:userId/checkout",
  isOwnerOrAdmin,
  async (req: Request, res: Response) => {
    const paramUserId = Number(req.params.userId);

    try {
      const cart = await Cart.findOne({
        where: { userId: paramUserId },
        include: [
          {
            model: CartItem,
            as: "items",
            include: [{ model: Gold, as: "gold" }],
          },
        ],
      });
      const items = (cart as any).items;
      if (!cart || items.length === 0)
        return res.status(400).json({ message: "Cart is empty" });

      const sequelize = Cart.sequelize!;
      let newOrder: any = null;

      await sequelize.transaction(async (t) => {
        // بررسی موجودی
        for (const item of items) {
          if (item.quantity > item.get('gold')!.stock) {
            throw {
              status: 400,
              message: `Not enough stock for ${item.gold!.title}`,
            };
          }
        }

        // ایجاد سفارش
        newOrder = await Order.create(
          { userId: paramUserId, totalPrice: 0, status: "completed" },
          { transaction: t }
        );

        let totalPrice = 0;

        for (const item of items) {
          // کم کردن موجودی واقعی
          item.get("gold")!.stock -= item.quantity;
          await item.get("gold")!.save({ transaction: t });

          const itemTotal =
            item.quantity *
            item.get("gold")!.price_per_gram *
            item.get("gold")!.weight;
          totalPrice += itemTotal;

          // اضافه کردن آیتم‌ها به OrderItem
          await OrderItem.create(
            {
              orderId: newOrder.id,
              goldId: item.goldId,
              quantity: item.quantity,
              unitPrice: item.get("gold")!.price_per_gram,
              totalPrice: itemTotal,
            },
            { transaction: t }
          );
        }

        // بروزرسانی totalPrice سفارش
        newOrder.totalPrice = totalPrice;
        await newOrder.save({ transaction: t });

        // خالی کردن سبد خرید
        await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });
      });

      return res.json({ message: "Checkout successful", order: newOrder });
    } catch (err: any) {
      if (err?.status)
        return res.status(err.status).json({ message: err.message });
      console.error(err);
      return res.status(500).json({ message: "Server error", error: err });
    }
  }
);


/**
 * PUT /cart/item/:itemId
 * update quantity of a cart item
 * body: { quantity: number }
 */
cartRouter.put(
  "/item/:itemId",
  isOwnerOrAdmin,
  async (req: Request, res: Response) => {
    const itemId = Number(req.params.itemId);
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(quantity) || quantity <= 0)
      return res.status(400).json({ message: "Invalid quantity" });

    try {
      const cartItem = await CartItem.findByPk(itemId, {
        include: [{ model: Gold, as: "gold" }],
      });
      console.log(cartItem?.toJSON());
      console.log(cartItem?.goldId);
      console.log(typeof cartItem);
      console.log(cartItem?.gold?.toJSON());
      const gold = cartItem?.get("gold");
      if (!cartItem)
        return res.status(404).json({ message: "CartItem not found" });

      cartItem.quantity = quantity;
      cartItem.totalPrice =
        quantity * gold!.price_per_gram * gold!.weight;
      await cartItem.save();

      return res.json(cartItem);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Server error", error: JSON.stringify(err) });
    }
  }
);

/**
 * DELETE /cart/item/:itemId
 * remove one item from cart
 */
cartRouter.delete(
  "/item/:itemId",
  isOwnerOrAdmin,
  async (req: Request, res: Response) => {
    const itemId = Number(req.params.itemId);

    try {
      const cartItem = await CartItem.findByPk(itemId);
      if (!cartItem)
        return res.status(404).json({ message: "CartItem not found" });

      await cartItem.destroy();
      return res.json({ message: "Item removed from cart" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error", error: err });
    }
  }
);

/**
 * DELETE /cart/:userId/clear
 * clear all items from a user's cart
 */
cartRouter.delete(
  "/:userId/clear",
  isOwnerOrAdmin,
  async (req: Request, res: Response) => {
    const paramUserId = Number(req.params.userId);

    try {
      const cart = await Cart.findOne({ where: { userId: paramUserId } });
      if (!cart) return res.status(404).json({ message: "Cart not found" });

      await CartItem.destroy({ where: { cartId: cart.id } });
      return res.json({ message: "Cart cleared" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error", error: err });
    }
  }
);

export default cartRouter;
