// Data Access Object (DAO) for users table.
// Used by Passport during login to verify credentials.

import db from "./db.js";
import crypto from "crypto";


// Verify credentials:
// look up user by email, hash the submitted password with
// the stored salt, and compare against the stored hash.
// Returns the user object on success, or false on failure.
export const getUserByCredentials = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM users WHERE email = ?";

    db.get(sql, [email], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve(false); // if user not found
      } else {
        // Build user object for the session — exclude hash and salt.
        const user = { id: row.id, email: row.email, name: row.name };

        // Hash submitted password with stored salt. Compare against stored hash.
        crypto.scrypt(password, row.salt, 32, (err, hashedPassword) => {
          if (err) return reject(err);
          // timingSafeEqual avoids timing-based side-channel attacks.
          if (!crypto.timingSafeEqual(Buffer.from(row.hash, "hex"), hashedPassword)) {
            resolve(false);
          } else {
            resolve(user); // return user object on success (id, email, name)
          }
        });
      }
    });
  });
};
