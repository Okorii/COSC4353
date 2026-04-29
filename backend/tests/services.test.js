const supertest = require("supertest");

describe("Service Management API", () => {
  let app;
  let request;
  let createdServiceId;

  beforeEach(() => {
    jest.resetModules();
    app = require("../app");
    request = supertest(app);
    createdServiceId = null;
  });

  test("GET /api/services should return all services", async () => {
    const res = await request.get("/api/services");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("service_id");
    expect(res.body[0]).toHaveProperty("service_name");
    expect(res.body[0]).toHaveProperty("description");
    expect(res.body[0]).toHaveProperty("expected_duration");
  });

  test("POST /api/services should create a valid service", async () => {
    const newService = {
      service_name: `Teeth Cleaning ${Date.now()}`,
      description: "Basic teeth cleaning service",
      expected_duration: 20
    };

    const res = await request.post("/api/services").send(newService);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Service added successfully");
    expect(res.body).toHaveProperty("service_id");

    createdServiceId = res.body.service_id;
  });

  test("POST /api/services should reject missing service_name", async () => {
    const badService = {
      service_name: "",
      description: "Basic teeth cleaning service",
      expected_duration: 20
    };

    const res = await request.post("/api/services").send(badService);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("POST /api/services should reject missing expected_duration", async () => {
    const badService = {
      service_name: "Teeth Cleaning",
      description: "Basic teeth cleaning service"
    };

    const res = await request.post("/api/services").send(badService);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("POST /api/services should reject invalid duration", async () => {
    const badService = {
      service_name: "Teeth Cleaning",
      description: "Basic teeth cleaning service",
      expected_duration: 0
    };

    const res = await request.post("/api/services").send(badService);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("GET /api/services/:id should return a single service", async () => {
    const res = await request.get("/api/services/1");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("service_id");
    expect(res.body).toHaveProperty("service_name");
    expect(res.body).toHaveProperty("description");
    expect(res.body).toHaveProperty("expected_duration");
  });

 test("PUT /api/services/:id should update an existing service", async () => {
  const tempName = `Temp Service ${Date.now()}`;
  const updatedName = `Updated Haircut ${Date.now()}`;

  const createRes = await request.post("/api/services").send({
    service_name: tempName,
    description: "Temp description",
    expected_duration: 25
  });

  const serviceId = createRes.body.service_id;

  const updatedService = {
    service_name: updatedName,
    description: "Updated haircut description",
    expected_duration: 40
  };

  const res = await request.put(`/api/services/${serviceId}`).send(updatedService);

  expect(res.status).toBe(200);
  expect(res.body.message).toBe("Service updated successfully");

  const getRes = await request.get(`/api/services/${serviceId}`);
  expect(getRes.status).toBe(200);
  expect(getRes.body.service_name).toBe(updatedName);
  expect(getRes.body.description).toBe("Updated haircut description");
  expect(getRes.body.expected_duration).toBe(40);
});
 

  test("DELETE /api/services/:id should remove a service that is not referenced by a queue", async () => {
    const createRes = await request.post("/api/services").send({
      service_name: `Delete Me ${Date.now()}`,
      description: "Temporary service",
      expected_duration: 10
    });

    const serviceId = createRes.body.service_id;

    const res = await request.delete(`/api/services/${serviceId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Service deleted successfully");
  });

  test("DELETE /api/services/:id should fail for a service used by a queue", async () => {
    const res = await request.delete("/api/services/1");

    expect([400, 500]).toContain(res.status);
    expect(res.body).toHaveProperty("error");
  });
});