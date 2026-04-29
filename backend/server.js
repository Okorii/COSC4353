const app = require("./app");

const PORT = Number(process.env.PORT || "3001");

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
