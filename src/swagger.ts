// swagger.ts
import swaggerAutogen from "swagger-autogen";
import { API_PORT } from "./config";

const doc = {
  info: {
    title: "Gold Trading API",
    description: "Auto-generated API documentation",
    version: "1.0.0",
  },
  host: `localhost:${API_PORT}`,
  schemes: ["http"],
};


const outputFile = "./swagger_output.json"; // خروجی
const endpointsFiles = ["./src/index.ts"]; // مسیر شروع (می‌تونه فایل اصلی یا مسیرها باشه)

swaggerAutogen()(outputFile, endpointsFiles, doc);
