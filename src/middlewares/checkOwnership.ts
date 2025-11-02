import type{ Request, Response, NextFunction } from "express";

// options:
// - model: مدل Sequelize که میخوای مالکیتشو چک کنی (مثلاً Cart یا CartItem)
// - idParam: نام پارامتر route که id آیتم هست (مثلاً "itemId")
// - ownerField: نام فیلدی که userId ذخیره شده (مثلاً "userId")
export const checkOwnership = (options: {
  model: any;
  idParam: string;
  ownerField: string;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user; // JWT بعد از authenticateUser middleware
        console.log("req.user= " + JSON.stringify(user));
      const itemId = req.params[options.idParam];

      const item = await options.model.findByPk(itemId);

      if (!item) return res.status(404).json({ message: "Item not found" });

      // اگر superuser یا admin هست اجازه بده
      if (user.isAdmin) return next();

      // چک مالکیت
      if (item[options.ownerField] !== user.id) {
        return res.status(403).json({ message: "Forbidden: not owner" });
      }

      next();
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
};
