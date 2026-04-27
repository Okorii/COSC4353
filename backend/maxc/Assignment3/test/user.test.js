const request = require("supertest");
const app = require("../server");
const { users } = require("../data/store");

describe("User API", () => {
  beforeEach(() => {
    users.length = 1;
    users[0] = {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
      history: [
        {
          action: "Logged in",
          date: "3/18/2026, 10:00 AM"
        }
      ],
      notifications: ["Test notification"],
      queueStatus: {
        position: 1,
        peopleAhead: 0,
        waitTime: "0 min",
        serviceType: "Walk In"
      }
    };
  });

  test("gets current user data", async () => {
    const res = await request(app)
      .get("/api/users/me")
      .set("x-user-id", "1");

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("admin@example.com");
  });

  test("fails when x-user-id header is missing", async () => {
    const res = await request(app).get("/api/users/me");

    expect(res.statusCode).toBe(401);
  });

  test("gets notifications", async () => {
    const res = await request(app)
      .get("/api/users/me/notifications")
      .set("x-user-id", "1");

    expect(res.statusCode).toBe(200);
    expect(res.body.notifications.length).toBeGreaterThan(0);
  });

  test("gets history", async () => {
    const res = await request(app)
      .get("/api/users/me/history")
      .set("x-user-id", "1");

    expect(res.statusCode).toBe(200);
    expect(res.body.history.length).toBeGreaterThan(0);
  });
});
