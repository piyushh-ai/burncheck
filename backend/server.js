import { config } from "./src/config/config.js";
import { dbConnect } from "./src/config/database.js";
import app from "./src/app.js";
import cors from "cors";

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"] }));

const PORT = config.PORT || 3000;

dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed", err);
  });