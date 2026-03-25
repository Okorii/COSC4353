const request = require("supertest");
const app = require("../app");

describe("History Routes", () => {
  test("GET /api/history returns history records", async () => {
    const response = await request(app).get("/api/history");

    // expecting right response
    expect(response.statusCode).toBe(200);
    // expecting array of the history
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
  test("GET /api/history filters by serviceId", async () => {
    const response = await request(app).get("/api/history?serviceId=full");
    expect(response.statusCode).toBe(200);
    // returned items to match filter
    response.body.forEach((item) => {
      expect(item.serviceId).toBe("full");
    });
  });
});