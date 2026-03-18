const supertest = require("supertest");

describe("Service Management API", () => {
  let app;
  let request;

  beforeEach(() => {
    jest.resetModules();
    app = require("../app");
    request = supertest(app);
  });

  test("GET /api/services should return all services", async () => {
    const res = await request.get("/api/services");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("name");
    expect(res.body[0]).toHaveProperty("description");
    expect(res.body[0]).toHaveProperty("durationMinutes");
    expect(res.body[0]).toHaveProperty("priority");
  });

  test("POST /api/services should create a valid service", async () => {
    const newService = {
      name: "Teeth Cleaning",
      description: "Basic teeth cleaning service",
      durationMinutes: 20,
      priority: "low",
      active: true,
    };

    const res = await request.post("/api/services").send(newService);

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Teeth Cleaning");
    expect(res.body.description).toBe("Basic teeth cleaning service");
    expect(res.body.durationMinutes).toBe(20);
    expect(res.body.priority).toBe("low");
    expect(res.body.active).toBe(true);
  });

  test("POST /api/services should reject missing name", async () => {
    const badService = {
      name: "",
      description: "Basic teeth cleaning service",
      durationMinutes: 20,
      priority: "low",
      active: true,
    };

    const res = await request.post("/api/services").send(badService);

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty("name");
  });

  test("POST /api/services should reject missing description", async () => {
    const badService = {
      name: "Teeth Cleaning",
      description: "",
      durationMinutes: 20,
      priority: "low",
      active: true,
    };

    const res = await request.post("/api/services").send(badService);

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty("description");
  });

  test("POST /api/services should reject invalid duration", async () => {
    const badService = {
      name: "Teeth Cleaning",
      description: "Basic teeth cleaning service",
      durationMinutes: 0,
      priority: "low",
      active: true,
    };

    const res = await request.post("/api/services").send(badService);

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty("durationMinutes");
  });

  test("POST /api/services should reject invalid priority", async () => {
    const badService = {
      name: "Teeth Cleaning",
      description: "Basic teeth cleaning service",
      durationMinutes: 20,
      priority: "urgent",
      active: true,
    };

    const res = await request.post("/api/services").send(badService);

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty("priority");
  });

  test("PUT /api/services/:id should update an existing service", async () => {
    const updatedService = {
      name: "Updated Haircut",
      description: "Updated haircut description",
      durationMinutes: 40,
      priority: "high",
      active: true,
    };

    const res = await request.put("/api/services/2").send(updatedService);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(2);
    expect(res.body.name).toBe("Updated Haircut");
    expect(res.body.description).toBe("Updated haircut description");
    expect(res.body.durationMinutes).toBe(40);
    expect(res.body.priority).toBe("high");
  });

  test("PATCH /api/services/:id/toggle-active should toggle service status", async () => {
    const res = await request.patch("/api/services/1/toggle-active");

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(typeof res.body.active).toBe("boolean");
  });

  test("DELETE /api/services/:id should remove a service", async () => {
    const res = await request.delete("/api/services/1");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Service removed.");
    expect(res.body.service.id).toBe(1);
  });
});