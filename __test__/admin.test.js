const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app")

require("dotenv").config();

/* Connecting to the database before each test. */
beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_TEST_URI);
});
  
describe("GET /api/admin/get-all-shifts", () => {
    it("should return all products", async () => {
      const res = await request(app).get("/api/admin/get-all-shifts");
      expect(res.statusCode).toBe(200);
    });
});

describe("GET /api/admin/getAll", () => {
    it("should return all ward details", async() => {
        const res = await request(app).get("/api/admin/getAll");
        expect(res.statusCode).toBe(200);
    })
})

describe("POST /api/admin/getDoctorTypes", () => {
    it("should return doctor categories", async() => {
        const res = await request(app).post("/api/admin/getDoctorTypes").send({
            WardID: '6339cfeed189aaa0727ebbf1'
        });
        expect(res.statusCode).toBe(200)
    })
})

describe("GET /api/admin/:id", () => {
    it("should return a consultant", async() => {
        const res = await request(app).get("/api/admin/63340641d5d1332a578a8f8c");
        expect(res.statusCode).toBe(200);
    })
})

  /* Closing database connection after each test. */
afterEach(async () => {
    await mongoose.connection.close();
});