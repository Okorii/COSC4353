const supertest = require("supertest");

describe("Queue Status API", () => {
  let app;
  let request;

  beforeEach(() => {
    jest.resetModules();
    app = require("../app");
    request = supertest(app);
  });

  test("POST /api/queue-status should create a new queue entry", async () => {
    const res = await request.post("/api/queue-status").send({
      queue_id: 1,
      user_id: 99,
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Joined queue successfully");
    expect(res.body).toHaveProperty("entry_id");
    expect(res.body).toHaveProperty("position");
  });

  test("POST /api/queue-status should reject missing user_id", async () => {
    const res = await request.post("/api/queue-status").send({
      queue_id: 1,
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("GET /api/queue-status/:id should return one queue entry", async () => {
    const createRes = await request.post("/api/queue-status").send({
      queue_id: 1,
      user_id: 100,
    });

    const entryId = createRes.body.entry_id;

    const res = await request.get(`/api/queue-status/${entryId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("petName");
    expect(res.body).toHaveProperty("ownerName");
    expect(res.body).toHaveProperty("serviceId");
    expect(res.body).toHaveProperty("joinedAt");
    expect(res.body).toHaveProperty("status");
  });

  test("GET /api/queue-status/:id should return 404 for missing entry", async () => {
    const res = await request.get("/api/queue-status/99999");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  test("PUT /api/queue-status/:id should update queue entry status", async () => {
    const createRes = await request.post("/api/queue-status").send({
      queue_id: 1,
      user_id: 101,
    });

    const entryId = createRes.body.entry_id;

    const updateRes = await request.put(`/api/queue-status/${entryId}`).send({
      status: "served",
    });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.message).toBe("Status updated successfully");

    const getRes = await request.get(`/api/queue-status/${entryId}`);
    expect(getRes.body.status).toBe("SERVED");
  });

  test("PUT /api/queue-status/:id should reject invalid status", async () => {
    const createRes = await request.post("/api/queue-status").send({
      queue_id: 1,
      user_id: 102,
    });

    const entryId = createRes.body.entry_id;

    const res = await request.put(`/api/queue-status/${entryId}`).send({
      status: "invalid_status",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("DELETE /api/queue-status/:id should remove queue entry", async () => {
    const createRes = await request.post("/api/queue-status").send({
      queue_id: 1,
      user_id: 103,
    });

    const entryId = createRes.body.entry_id;

    const res = await request.delete(`/api/queue-status/${entryId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Queue entry deleted successfully");
  });

  test("DELETE /api/queue-status/99999 should return 404", async () => {
    const res = await request.delete("/api/queue-status/99999");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});