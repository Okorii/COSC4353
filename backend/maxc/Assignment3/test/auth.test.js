const request = require("supertest");
const app = require("../server");
const { users } = require("../data/store");

describe("Authentication API", () => {
  beforeEach(() => {
    users.length = 1;
    users[0] = {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
      history: [],
      notifications: [],
      queueStatus: {
        position: 0,
        peopleAhead: 0,
        waitTime: "0 min",
        serviceType: "None"
      }
    };
  });

  test("registers a new user successfully", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Max Camacho",
      email: "max@example.com",
      password: "password123",
      role: "user"
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe("max@example.com");
  });

  test("fails registration when fields are missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "",
      email: "max@example.com",
      password: "password123"
    });

    expect(res.statusCode).toBe(400);
  });

  test("fails registration for duplicate email", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Max Camacho",
      email: "max@example.com",
      password: "password123"
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Another Max",
      email: "max@example.com",
      password: "password123"
    });

    expect(res.statusCode).toBe(409);
  });

  test("logs in successfully", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Max Camacho",
      email: "max@example.com",
      password: "password123"
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "max@example.com",
      password: "password123"
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.name).toBe("Max Camacho");
  });

  test("fails login with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "wrongpassword"
    });

    expect(res.statusCode).toBe(401);
  });
});
