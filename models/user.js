/** User class for message.ly */
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config');
const jwt = require('jsonwebtoken');

const db = require('../db');



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) { 
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `
      INSERT INTO users
        (username, password, first_name, last_name, phone, join_at, last_login_at)
      VALUES
        ($1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_DATE)
      RETURNING
        username, password, first_name, last_name, phone
      `,
      [username, hashedPassword, first_name, last_name, phone]
    );

    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `
      SELECT password FROM users
      WHERE username = $1
      `,
      [
        username
      ]
    )
    if (result.rows.length === 0)
      return false
    const user = result.rows[0]
    return bcrypt.compare(password, user.password);
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `
      UPDATE users
      SET last_login_at = CURRENT_DATE
      WHERE username = $1
      `,
      [ username ]
    )
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const result = await db.query(
      `
      SELECT username, first_name, last_name, phone FROM users
      `
    );
    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { 
    const result = await db.query(
      `
      SELECT username, first_name, last_name, phone, last_login_at, join_at FROM users
      WHERE username = $1
      `,
      [ username ]
    );
    return result.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
      `
      SELECT 
        body, id, 
        read_at, sent_at, 
        u.username, u.first_name,
        u.last_name, u.phone
      FROM messages m
      JOIN users u ON u.username = m.to_username
      WHERE from_username = $1
      `,
      [ username ]
    );

    const messages = []
    if (result.rows !== 0)
      
    for (let row of result.rows) {
      const { body, id, read_at, sent_at, first_name, last_name, phone, username } = row;
      messages.push(
        {
          body, id, read_at, sent_at,
          to_user: {
            username, first_name, last_name, phone
          }
        }
      )
    }
    return messages;
   }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    const result = await db.query(
      `
      SELECT 
        body, id, 
        read_at, sent_at, 
        u.username, u.first_name,
        u.last_name, u.phone
      FROM messages m
      JOIN users u ON u.username = m.from_username
      WHERE to_username = $1
      `,
      [ username ]
    );

    const messages = []
    if (result.rows !== 0)
      
    for (let row of result.rows) {
      const { body, id, read_at, sent_at, first_name, last_name, phone, username } = row;
      messages.push(
        {
          body, id, read_at, sent_at,
          from_user: {
            username, first_name, last_name, phone
          }
        }
      )
    }
    return messages;
  }
}


module.exports = User;