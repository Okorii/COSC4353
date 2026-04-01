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
    const response = await request(app).get("/api/history?serviceId=1");
    expect(response.statusCode).toBe(200);
    // returned items to match filter
    response.body.forEach((item) => {
      expect(item.serviceId).toBe(1);
    });
  });
});

//additional tests
test("GET /api/history returns sorted by newest date first", async () => {
  const response = await request(app).get("/api/history");

  const dates = response.body.map((item) => item.date);
  const sortedDates = [...dates].sort((a, b) => b.localeCompare(a));

  expect(dates).toEqual(sortedDates);
});

test("GET /api/history with unknown serviceId returns empty array", async () => {
  const response = await request(app).get("/api/history?serviceId=999");

  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual([]);
});