import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { MONGO_URI, port } from "./backend/src/config/config.js";

import authRoutes from "./backend/src/routes/auth.js";
import protectedRoutes from "./backend/src/routes/protected.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);

if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
      });
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
    });
}

export default app;
