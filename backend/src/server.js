import dotenv from "dotenv";
import app from "./app.js";
import { testConnection } from "./config/db.js";

dotenv.config();

const port = Number(process.env.PORT || 5000);

const bootstrap = async () => {
  try {
    await testConnection();
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

bootstrap();