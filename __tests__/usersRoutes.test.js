const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const { SECRET_KEY } = require("../config");

let u1;
let u1Token;

describe("Users Routes Test", function () {

  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");

    u1 = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+14155550000",
    });
    u1Token = jwt.sign({username: u1.username}, SECRET_KEY)
  });

  /** GET /users */

  describe("GET /users", function () {
    test("get list of users", async function () {
      let response = await request(app)
        .get("/users")
        .send({
          _token: u1Token
        });

      expect(response.status).toBe(200);
    });

    test("get list of users - 401", async function () {
      let response = await request(app)
        .get("/users")

      expect(response.status).toBe(401);
    });
  });

  describe("GET /users/:username", function () {
    test("get user by username", async function () {
      let response = await request(app)
        .get(`/users/${u1.username}`)
        .send({
          _token: u1Token
        });

      expect(response.status).toBe(200);
    });
  });

  describe("GET /users/:username/to", function () {
    test("get messages to user", async function () {
      let response = await request(app)
        .get(`/users/${u1.username}/to`)
        .send({
          _token: u1Token
        });

      expect(response.status).toBe(200);
    });
  });

  describe("GET /users/:username", function () {
    test("get messages from user", async function () {
      let response = await request(app)
        .get(`/users/${u1.username}/from`)
        .send({
          _token: u1Token
        });

      expect(response.status).toBe(200);
    });
  });
});

afterAll(async function () {
  await db.end();
});
