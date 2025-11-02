
import express from "express";
import userRouter from "./routes/user";
import { API_PORT } from "./config";
import helmet from "helmet";
import cors from "cors";
import authRouter from "./routes/auth";
import cartRouter from "./routes/cart";
import goldRouter from "./routes/gold";
import "./models"; // register associations
import swaggerUi from "swagger-ui-express";
import swaggerFile from "./swagger_output.json" assert { type: "json" };

const app = express();
// 📘 Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use(express.json());
app.use(helmet());

const corsOptions = {
  origin: "http://localhost:3000", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  // allowedHeaders: [
  //   "Content-Type",
  //   "Authorization",
  //   "X-Requested-With", 
  //   "Accept",
  //   "Origin",
  // ],
  credentials: true, // برای کوکی و Authorization
};
app.use(cors(corsOptions));


// Routes
app.use("/users", userRouter);
app.use("/carts", cartRouter);
app.use("/golds", goldRouter);
app.use("/", authRouter);


const PORT = API_PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);

});
