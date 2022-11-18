const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");

require("dotenv").config();

/* Connecting to the database before each test. */
beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

/* Closing database connection after each test. */
afterEach(async () => {
    await mongoose.connection.close();
});

describe("POST /api/doctor/getShifts", () => {
    jest.setTimeout(30000);
    it("should create a product", async () => {
        const res = await request(app).post("/api/doctor/getShifts").send({
            id: "633ab0f123be88c950fb8a89",
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });
});
describe("POST /api/doctor/changeClendar", () => {
    jest.setTimeout(30000);
    it("should create a product", async () => {
        const res = await request(app).post("/api/doctor/changeClendar").send({
            "id": "633ab0f123be88c950fb8a89",
            "allawAllDoctors":false,
        });
        expect(res.statusCode).toBe(200);
        expect(res.body[0].length).toBeGreaterThan(0);
        expect(res.body[1].length).toBeGreaterThan(0);
        expect(res.body[0][0].title).toBe('morning');
        expect(typeof res.body[1][0].text).toBe('string');

    });
});
describe("POST /api/doctor/changeClendar", () => {
    jest.setTimeout(30000);
    it("should create a product", async () => {
        const res = await request(app).post("/api/doctor/changeClendar").send({
            "id": "633ab0f123be88c950fb8a89",
            "allawAllDoctors":true
        });
        expect(res.statusCode).toBe(200);
        expect(res.body[0].length).toBeGreaterThan(0);
        expect(res.body[1].length).toBeGreaterThan(0);
        expect(res.body[0][0].title).toBe('morning');
        expect(typeof res.body[1][0].text).toBe('string');

    });
});
describe("POST /api/doctor/changePassword", () => {
    jest.setTimeout(30000);
    it("should create a product", async () => {
        const res = await request(app).post("/api/doctor/changePassword").send({
            "id" : "633ab0f123be88c950fb8a89",
            "email": "abcd@gmail.com",
            "password":"Abcd@1234",
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe("vinojith");
        expect(res.body.type).toBe( "DOCTOR");
    });
});
// describe("POST /api/doctor/defineRequirements", () => {
//     jest.setTimeout(100000);
//     it("Should create a requirement", async () => {
//         const res = await request(app).post("/api/doctor/defineRequirements").send({
//             "id":"633ab0f123be88c950fb8a89",
//             "date":"2022-10-14",
//             "morning": true,
//             "evening": false,
//             "night":true
//         });
//         if(res.statusCode == 200){
//             expect(res.body.doctor).toBe('633ab0f123be88c950fb8a89');
//         }else{
//             expect(res.statusCode).toBe(400);
//             expect(res.body.error).toBe("Leave already requested")
//         }
//     });
// });
describe("POST /api/doctor/setSwappingShifts", () => {
    jest.setTimeout(30000);
    it("should create a product", async () => {
        const res = await request(app).post("/api/doctor/setSwappingShifts").send({
            "id": "633ab0f123be88c950fb8a89",
            "fromShiftofSchedule": "63351516df919f17849a6d85",
            "toShiftofSchedule": "633518fe88caa1f4cc6d3107",
            "doctor": "633ab54a9fd528b9532b8d59"
        });
        if(res.statusCode == 200){
            expect(res.body).toBe('Successfull');
        }else{
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe("swapping requiest is exists")
        }
    });
});
describe("POST /api/doctor/getDoctorShifts", () => {
    jest.setTimeout(30000);
    it("should create a product", async () => {
        const res = await request(app).post("/api/doctor/getDoctorShifts").send({
            "id": "633ab54a9fd528b9532b8d59",
            "fromDate": "2022-11-12T06:59:48.000Z",
            "toDate": "2022-11-15T06:59:48.000Z"
        });
        if(res.statusCode == 200){
            expect(res.body[0].length).toBeGreaterThan(0);
            expect(res.body[1].length).toBeGreaterThan(0);
        }else{
            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe("no shift Of Schedule")
        }
    });
});
describe("POST /api/doctor/getRequests", () => {
    jest.setTimeout(30000);
    it("should create a product", async () => {
        const res = await request(app).post("/api/doctor/getRequests").send({
            id: "633ab0f123be88c950fb8a89",
        });
        expect(res.statusCode).toBe(200);
        expect(res.body[0][0].name).toBe("Hasini Vijerathna");
            expect(res.body[0].length).toBeGreaterThan(0);
            expect(res.body[1][0].name).toBe("Hasini Vijerathna");
            expect(res.body[1].length).toBeGreaterThan(0);
    });
});
describe("POST /api/doctor/setRequestResponse", () => {
    jest.setTimeout(30000);
    it("should create a product", async () => {
        const res = await request(app).post("/api/doctor/setRequestResponse").send({
            "requestId": "63659d816e7741c49acb48fd",
            "Agree": true
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.fromDoctor).toBe("633ab54a9fd528b9532b8d59");
        expect(res.body.toDoctor).toBe("633ab0f123be88c950fb8a89");
        expect(res.body.status).toBe(2);
    });
});