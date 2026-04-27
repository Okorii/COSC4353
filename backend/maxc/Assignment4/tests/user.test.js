const request = require("supertest");
const app = require("../server");
const pool = require("../config/db");

jest.mock("../config/db", () => ({
  query: jest.fn(),
}));

describe("User API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("gets current user data", async () => {
    pool.query.mockResolvedValueOnce([[
      {
        user_id: 1,
        email: "max@example.com",
        role: "user",
        full_name: "Max Camacho",
        phone: "7135550000",
      },
    ]]);

    const res = await request(app)
      .get("/api/users/me")
      .set("x-user-id", "1");

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("max@example.com"); // ✅ FIXED
    expect(res.body.user_id).toBe(1);
    expect(res.body.name).toBe("Max Camacho");
  });

  test("fails when x-user-id header is missing", async () => {
    const res = await request(app).get("/api/users/me");

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Authentication required");
  });

  test("gets notifications", async () => {
    pool.query.mockResolvedValueOnce([[
      {
        user_id: 1,
        email: "max@example.com",
        role: "user",
        full_name: "Max Camacho",
        phone: "7135550000",
      },
    ]]);

    const res = await request(app)
      .get("/api/users/me/notifications")
      .set("x-user-id", "1");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.notifications)).toBe(true);
  });

  test("gets history", async () => {
    pool.query.mockResolvedValueOnce([[
      {
        user_id: 1,
        email: "max@example.com",
        role: "user",
        full_name: "Max Camacho",
        phone: "7135550000",
      },
    ]]);

    const res = await request(app)
      .get("/api/users/me/history")
      .set("x-user-id", "1");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.history)).toBe(true);
  });
});

afterAll(() => {
  jest.clearAllMocks();
});