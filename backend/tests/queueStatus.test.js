const supertest = require("supertest");

describe("Queue Status API", () => {
  let app;
  let request;

  beforeEach(() => {
    jest.resetModules();
    app = require("../app");
    request = supertest(app);
  });

  test("GET /api/queue-status/q1 should return queue status", async () => {
    const res = await request.get("/api/queue-status/q1");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("queueInfo");
    expect(res.body.queueInfo).toHaveProperty("petName");
    expect(res.body.queueInfo).toHaveProperty("serviceName");
    expect(res.body.queueInfo).toHaveProperty("position");
    expect(res.body.queueInfo).toHaveProperty("etaMinutes");
    expect(res.body.queueInfo).toHaveProperty("status");
  });

  test("GET /api/queue-status/bad-id should return 404", async () => {
    const res = await request.get("/api/queue-status/bad-id");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Queue entry not found.");
  });

  test("POST /api/queue-status/q1/refresh should move queue forward", async () => {
    const before = await request.get("/api/queue-status/q1");
    const after = await request.post("/api/queue-status/q1/refresh");

    expect(after.status).toBe(200);
    expect(after.body).toHaveProperty("queueInfo");
    expect(after.body.queueInfo.position).toBeLessThanOrEqual(before.body.queueInfo.position);
  });

  test("POST /api/queue-status/q1/refresh should eventually reach valid statuses", async () => {
    const validStatuses = ["WAITING", "ALMOST_READY", "SERVED", "READY_FOR_PICKUP"];

    const res1 = await request.post("/api/queue-status/q1/refresh");
    expect(validStatuses).toContain(res1.body.queueInfo.status);

    const res2 = await request.post("/api/queue-status/q1/refresh");
    expect(validStatuses).toContain(res2.body.queueInfo.status);

    const res3 = await request.post("/api/queue-status/q1/refresh");
    expect(validStatuses).toContain(res3.body.queueInfo.status);
  });

  test("POST /api/queue-status/q1/refresh should add notifications over time", async () => {
    await request.post("/api/queue-status/q1/refresh");
    const res = await request.post("/api/queue-status/q1/refresh");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.notifications)).toBe(true);
    expect(res.body.notifications.length).toBeGreaterThan(0);
  });

  test("DELETE /api/queue-status/q1 should remove queue entry", async () => {
    const res = await request.delete("/api/queue-status/q1");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Left queue successfully.");
  });

  test("DELETE /api/queue-status/bad-id should return 404", async () => {
    const res = await request.delete("/api/queue-status/bad-id");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Queue entry not found.");
  });
});