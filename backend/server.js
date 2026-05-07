import { config } from "./src/config/config.js";
import { dbConnect } from "./src/config/database.js";
import app from "./src/app.js";

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