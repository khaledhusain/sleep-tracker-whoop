const request = require("supertest");
const { app, db } = require("../../server");

describe("GET /whoop/connect - invalid cases", () => {
  it("returns 404 for unsupported HTTP method", async () => {
    const response = await request(app).post("/whoop/connect");

    expect(response.statusCode).toBe(404);
  });

  it("returns 404 for unknown route under /whoop", async () => {
    const response = await request(app).get("/whoop/connect/meow");

    expect(response.statusCode).toBe(404);
  });
});

afterAll(async () => {
  await db.close();
});