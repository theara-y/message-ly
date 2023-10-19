const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require('../models/message');
const { SECRET_KEY } = require("../config");

let u1, u2, u3;
let m1, m2, m3;
let u1Token;

describe("Messages Routes Test", function () {

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
        u2 = await User.register({
            username: "test2",
            password: "password",
            first_name: "Test2",
            last_name: "Testy2",
            phone: "+14155552222",
        });
        u3 = await User.register({
            username: 'test3',
            password: 'password',
            first_name: 'Test3',
            last_name: 'Testy3',
            phone: '+14155553333'
        })
        m1 = await Message.create({
            from_username: "test1",
            to_username: "test2",
            body: "u1-to-u2"
        });
        m2 = await Message.create({
            from_username: "test2",
            to_username: "test1",
            body: "u2-to-u1"
        });
        m3 = await Message.create({
            from_username: 'test3',
            to_username: 'test2',
            body: 'u3-to-u2'
        })
        u1Token = jwt.sign({ username: u1.username }, SECRET_KEY)
    });

    /** GET /messages/:id */

    describe("GET /messages/:id", function () {
        test("get message from user", async function () {
            let res = await request(app)
                .get(`/messages/${m1.id}`)
                .send({
                    _token: u1Token
                });

            expect(res.status).toBe(200);
            expect(res.body).toEqual(
                expect.objectContaining({
                    id: m1.id,
                    body: 'u1-to-u2',
                    from_user: {
                        first_name: 'Test1',
                        last_name: 'Testy1',
                        phone: '+14155550000',
                        username: 'test1'
                    },
                    to_user: {
                        first_name: 'Test2',
                        last_name: 'Testy2',
                        phone: '+14155552222',
                        username: 'test2'
                    }
                })
            );
        });

        test("get message to user", async function () {
            let res = await request(app)
                .get(`/messages/${m2.id}`)
                .send({
                    _token: u1Token
                });

            expect(res.status).toBe(200);
            expect(res.body).toEqual(
                expect.objectContaining({
                    id: m2.id,
                    body: 'u2-to-u1',
                    from_user: {
                        first_name: 'Test2',
                        last_name: 'Testy2',
                        phone: '+14155552222',
                        username: 'test2'
                    },
                    to_user: {
                        first_name: 'Test1',
                        last_name: 'Testy1',
                        phone: '+14155550000',
                        username: 'test1'
                    }
                })
            );
        });

        test("get message not from or to user", async function () {
            let res = await request(app)
                .get(`/messages/${m3.id}`)
                .send({
                    _token: u1Token
                });

            expect(res.status).toBe(404);
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: 'Not Found'
                })
            );
        });

        test("get message when user not logged in", async function () {
            let res = await request(app)
                .get(`/messages/${m1.id}`)

            expect(res.status).toBe(401);
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: 'Unauthorized'
                })
            );
        });

        test("get message that does not exist", async function() {
            let res = await request(app)
                .get('/messages/-1')
                .send({ _token: u1Token });

            expect(res.status).toBe(404);
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: 'No such message: -1'
                })
            )
        });
    });

    /* POST /messages */
    describe("POST /messages", function () {
        test("post message from user", async function () {
            let res = await request(app)
                .post('/messages')
                .send({
                    to_username: u2.username,
                    body: 'Hello u2! says u1.',
                    _token: u1Token
                })
            expect(res.status).toBe(200);
            expect(res.body).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    from_username: 'test1',
                    to_username: 'test2',
                    body: 'Hello u2! says u1.',
                    sent_at: expect.any(String)
                })
            );
        });

        test("post message from not logged in user", async function () {
            let res = await request(app)
                .post('/messages')
                .send({
                    to_username: u2.username,
                    body: 'Hello u2! says u1.',
                })
            expect(res.status).toBe(401);
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: 'Unauthorized'
                })
            );
        });

        test("post message to not found user", async function () {
            let res = await request(app)
                .post('/messages')
                .send({
                    to_username: 'test4',
                    body: 'Hello u2! says u1.',
                    _token: u1Token
                })
            expect(res.status).toBe(404);
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: 'Not Found'
                })
            );
        });
    });

    /* POST /messages/:id/read */
    describe("POST /messages", function () {
        test("mark message to user", async function () {
            let res = await request(app)
                .post(`/messages/${m2.id}/read`)
                .send({
                    _token: u1Token
                });

                expect(res.status).toBe(200);
        });

        test("mark message not to user", async function () {
            let res = await request(app)
                .post(`/messages/${m1.id}/read`)
                .send({
                    _token: u1Token
                });

                expect(res.status).toBe(401);
        });

        test("mark message to user", async function () {
            let res = await request(app)
                .post(`/messages/${-1}/read`)
                .send({
                    _token: u1Token
                });

                expect(res.status).toBe(404);
        });
    });
});

afterAll(async function () {
    await db.end();
});
