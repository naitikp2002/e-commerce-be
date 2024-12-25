const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const authRouter = require("./routes/authRoutes");
const productRouter = require("./routes/productRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const brandRouter = require("./routes/brandRoutes");
const userRouter = require("./routes/userRoutes");
const errorHandler = require("./middleware/errorHandler");

var corsOptions = {
  origin: "http://localhost:3000",
};
const db = require("./models");
// middlewares
app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/brands", brandRouter);
// testing apis
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 8080;

app.use(errorHandler);


app.listen(PORT, (req, res) => {
  console.log(`Server is running on port ${PORT}`);
  db.sequelize
    .authenticate()
    .then(() => {
      console.log("connected...");
    })
    .catch((err) => {
      console.log(err);
    });

  db.sequelize.sync({ force: false }).then(() => {
    console.log("Database synchronized");
  });
});
