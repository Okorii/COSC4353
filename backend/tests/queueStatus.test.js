const supertest = require("supertest");

describe("Queue Status API", () => {
  let app;
  let request;
  let createdEntryId;

  beforeEach(() => {
    jest.resetModules();
    app = require("../app");
    request = supertest(app);
    createdEntryId = null;
  });

  test("GET /api/queue-entries/1 should return queue entries", async () => {
    const res = await request.get("/api/queue-entries/1");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty("entry_id");
      expect(res.body[0]).toHaveProperty("queue_id");
      expect(res.body[0]).toHaveProperty("user_id");
      expect(res.body[0]).toHaveProperty("position");
      expect(res.body[0]).toHaveProperty("join_time");
      expect(res.body[0]).toHaveProperty("status");
    }
  });

  test("GET /api/queue-entries/999 should return empty array for non-existing queue", async () => {
    const res = await request.get("/api/queue-entries/999");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test("POST /api/queue-entries should create a new queue entry", async () => {
    const res = await request.post("/api/queue-entries").send({
      queue_id: 1,
      user_id: 99
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Joined queue successfully");
    expect(res.body).toHaveProperty("entry_id");
    expect(res.body).toHaveProperty("position");

    createdEntryId = res.body.entry_id;
  });

  test("POST /api/queue-entries should reject missing user_id", async () => {
    const res = await request.post("/api/queue-entries").send({
      queue_id: 1
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("PUT /api/queue-entries/:id should update queue entry status", async () => {
    const createRes = await request.post("/api/queue-entries").send({
      queue_id: 1,
      user_id: 100
    });

    const entryId = createRes.body.entry_id;

    const updateRes = await request.put(`/api/queue-entries/${entryId}`).send({
      status: "served"
    });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.message).toBe("Status updated successfully");

    const getRes = await request.get("/api/queue-entries/1");
    const updatedEntry = getRes.body.find(entry => entry.entry_id === entryId);

    expect(updatedEntry).toBeDefined();
    expect(updatedEntry.status).toBe("served");
  });

  test("PUT /api/queue-entries/:id should reject invalid status", async () => {
    const createRes = await request.post("/api/queue-entries").send({
      queue_id: 1,
      user_id: 101
    });

    const entryId = createRes.body.entry_id;

    const res = await request.put(`/api/queue-entries/${entryId}`).send({
      status: "invalid_status"
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("DELETE /api/queue-entries/:id should remove queue entry", async () => {
    const createRes = await request.post("/api/queue-entries").send({
      queue_id: 1,
      user_id: 102
    });

    const entryId = createRes.body.entry_id;

    const res = await request.delete(`/api/queue-entries/${entryId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Queue entry deleted successfully");
  });

  test("DELETE /api/queue-entries/99999 should return 404", async () => {
    const res = await request.delete("/api/queue-entries/99999");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});