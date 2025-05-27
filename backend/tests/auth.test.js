const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../server");
const User = require("../src/models/User");

let mongoServer;

jest.setTimeout(30000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany();
});

describe("Authentication Tests", () => {
  it("should register a user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "testuser",
      password: "securepass123",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User registered");
  });

  it("should not register duplicate users", async () => {
    await request(app).post("/api/auth/register").send({
      username: "testuser",
      password: "securepass123",
    });
    const res = await request(app).post("/api/auth/register").send({
      username: "testuser",
      password: "anotherpass",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("User already exists");
  });

  it("should reject access to /protected without token", async () => {
    const res = await request(app).get("/api/protected");
    expect(res.statusCode).toBe(403);
  });
});
