/** Database connection for messagely. */

const { Client } = require("pg");

const db = new Client({
    connectionString: "postgres://tya:password@localhost:5432/messagely"
});

db.connect();

module.exports = db;
