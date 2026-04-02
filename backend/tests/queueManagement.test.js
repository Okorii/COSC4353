const request = require("supertest");
const app = require("../app");
//importing helper functions
const {
  validateQueueEntry,
  sortQueue,
  estimateWaitTime,
} = require("../utils/queueManagementHelpers");

//tests helper logic
describe("Queue Management Helpers", () => {
  test("validateQueueEntry returns errors for missing fields", () => {
    //passing empty object to seem like invalid input
    const errors = validateQueueEntry({});
    //expecting atleast one error
    expect(errors.length).toBeGreaterThan(0);
  });

  test("validateQueueEntry accepts valid input", () => {
    //all fields must be correct format
    const errors = validateQueueEntry({
      petName: "Buddy",
      ownerName: "Ana Lopez",
      serviceId: 1,
    });
    //expecting no errors
    expect(errors).toEqual([]);
  });

  //creates entries diff arrivals
  test("sortQueue sorts by joinedAt", () => {
    const entries = [
      { id: "q1", joinedAt: "2026-03-24T12:10:00.000Z" },
      { id: "q2", joinedAt: "2026-03-24T12:00:00.000Z" },
    ];
    //sorts based on time arrived
    const sorted = sortQueue(entries);
    expect(sorted[0].id).toBe("q2");
    expect(sorted[1].id).toBe("q1");
  });

  test("estimateWaitTime adds durations of earlier queue entries", () => {
    //testing q1 arrived first
    const sortedQueue = [
      { id: "q1", serviceId: 1 },
      { id: "q2", serviceId: 2 },
    ];
    //q2 waiting on q1
    const wait = estimateWaitTime(sortedQueue[1], sortedQueue);
    expect(wait).toBe(20);
  });
});

//tests backend API routes
describe("Queue Management Routes", () => {
  test("GET /api/queue-management returns queue", async () => {
    //calling queue endpoint
    const response = await request(app).get("/api/queue-management");

    //expecting right response, array queue entries
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("POST /api/queue-management/join rejects invalid input", async () => {
    const response = await request(app)
      .post("/api/queue-management/join")
      .send({ petName: "", ownerName: "", serviceId: null });
    //expecting backend validation to reject request
    expect(response.statusCode).toBe(400);
  });

  //test joining the queue
  test("POST /api/queue-management/join adds a new queue entry", async () => {
    const response = await request(app)
      .post("/api/queue-management/join")
      .send({petName: "Luna", ownerName: "amy@email.com", serviceId: 1 });

    expect(response.statusCode).toBe(201);
    expect(response.body.petName).toBe("Luna");
    expect(response.body.ownerName).toBe("amy@email.com");
    expect(response.body.status).toBe("WAITING");
  });

  //test leaving the queue
  test("DELETE /api/queue-management/:id removes an entry", async () => {
    //first join it
    const joinRes = await request(app)
      .post("/api/queue-management/join")
      .send({ petName: "Lucy", ownerName: "amy@gmail.com", serviceId: 1,});

    expect(joinRes.statusCode).toBe(201);
    const id = joinRes.body.id;

    //now try to leave it
    const deleteRes = await request(app)
      .delete(`/api/queue-management/${id}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.message).toBe("Removed from queue");
    expect(deleteRes.body.removed.id).toBe(id);
  });

  //testing id with no entry
  test("DELETE /api/queue-management/:id returns 404 if not found", async () => {
    const res = await request(app)
      .delete("/api/queue-management/invalid-id");

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Not found.");
  });

  test("POST /api/queue-management/serve-next serves the next entry", async () => {
    const response = await request(app).post("/api/queue-management/serve-next");

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Serving next user");
    expect(response.body.served).toBeDefined();
    expect(response.body.served.status).toBe("SERVING");
  });

});