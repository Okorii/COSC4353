const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../server");
const pool = require("../config/db");

jest.mock("../config/db", () => ({
  query: jest.fn(),
}));

describe("Authentication API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("registers a new user successfully", async () => {
    pool.query
      // first query: check if email already exists
      .mockResolvedValueOnce([[]])
      // second query: insert into user_credentials
      .mockResolvedValueOnce([{ insertId: 1 }])
      // third query: insert into customers
      .mockResolvedValueOnce([{}]);

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Max Camacho",
        email: "max@example.com",
        password: "secret123",
        phone: "7135550000",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe("max@example.com");
    expect(res.body.user.user_id).toBe(1);
  });

  test("rejects duplicate email", async () => {
    pool.query.mockResolvedValueOnce([[{ user_id: 1 }]]);

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Max Camacho",
        email: "max@example.com",
        password: "secret123",
        phone: "7135550000",
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe("Email already registered");
  });

  test("logs in successfully", async () => {
    const hashedPassword = await bcrypt.hash("secret123", 10);

    pool.query.mockResolvedValueOnce([[
      {
        user_id: 1,
        email: "max@example.com",
        password_hash: hashedPassword,
        role: "user",
        full_name: "Max Camacho",
        phone: "7135550000",
      },
    ]]);

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "max@example.com",
        password: "secret123",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("max@example.com");
    expect(res.body.user.user_id).toBe(1);
  });

  test("rejects invalid login", async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "max@example.com",
        password: "wrongpassword",
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });
});

afterAll(() => {
  jest.clearAllMocks();
});