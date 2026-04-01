const express = require("express");
const router = express.Router();

// import in memory history 
const history = require("../data/history");
// GET all history, returns history records
router.get("/", (req, res) => {
  const { serviceId } = req.query;

  let results = [...history];

  // filtering by service
  if (serviceId && serviceId !== "all") {
    const numericServiceId = Number(serviceId);
    results = results.filter((item) => item.serviceId === numericServiceId);
  }
  // sort
  results.sort((a, b) => b.date.localeCompare(a.date));
  res.json(results);
});
module.exports = router;