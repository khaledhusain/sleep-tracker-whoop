const request = require("supertest");
const { app, db } = require("../../server");

let session_token_sleep = ""; // must not be session_token causes errors in other tests

describe("Initialises user account for sleep create tests", () => {
  beforeAll(async () => {
    const response = await request(app).post("/user/create_account").send({
      first_name: "Jane",
      last_name: "Doe",
      email: "janedoe@doemail.com",
      password: "Password123!",
    });
    session_token_sleep = response.body.session_token;
  });

  it("logs in and stores session token", async () => {
    const user = {
      email: "janedoe@doemail.com",
      password: "Password123!",
    };

    const response = await request(app).post("/user/login").send(user);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("session_token");
    session_token_sleep = response.body.session_token;
  });
});

describe("POST /sleep - add new manual sleep entry", () => {
  it("should add a new sleep entry to database and return status 201", async () => {
    const sleep = {
      date: "2026-03-04T00:00:00Z",
      bedtime: "2026-03-03T22:00:00Z",
      wake_time: "2026-03-04T06:00:00Z",
    };

    const response = await request(app)
      .post("/sleep")
      .send(sleep)
      .set("X-Authorization", session_token_sleep);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("id");
    expect(response.body.message).toBe("Successfully created sleep");
  });
});

describe("POST /sleep - add another manual sleep entry", () => {
  it("should add a second sleep entry to database and return status 201", async () => {
    const sleep = {
      date: "2026-03-05T00:00:00Z",
      bedtime: "2026-03-04T22:00:00Z",
      wake_time: "2026-03-05T06:00:00Z",
    };

    const response = await request(app)
      .post("/sleep")
      .send(sleep)
      .set("X-Authorization", session_token_sleep);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("id");
    expect(response.body.message).toBe("Successfully created sleep");
  });
});

afterAll(async () => {
  await db.close();
});