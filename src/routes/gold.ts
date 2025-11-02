import express, { type Request, type Response } from "express";
import Gold from "../models/gold";
import { checkIsAdmin } from "../middlewares/authAdmin";

const goldRouter = express.Router();

goldRouter.get("/", async (req: Request, res: Response) => {
  try {
    const golds = await Gold.findAll({});
    if (!golds.length)
      return res.status(404).json({ message: "Golds not found" });
    res.json(golds);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});
goldRouter.get("/:goldId", async (req: Request, res: Response) => {
  const { goldId } = req.params;
  try {
    const gold = await Gold.findOne({
      where: { id:goldId },
    });
    if (!gold) return res.status(404).json({ message: "Gold not found" });
    res.json(gold);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

goldRouter.post("/",checkIsAdmin, async (req: Request, res: Response) => {
    try {
        const { title, weight, price_per_gram, desc, stock, img_url } = req.body;

        const gold = await Gold.create(req.body);
        res.status(201).json({ message: "Gold created successfully", gold });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});


export default goldRouter;