import express from "express";
import bodyParser from "body-parser";
import apiRoutes from "./routes/api.route";

const app = express();
app.use(bodyParser.json());

app.use("/", apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
