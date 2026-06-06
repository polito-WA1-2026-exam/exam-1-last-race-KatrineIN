// Data Access Object (DAO) for game related queries

import db from "./db.js";


/**
 * Create a new game in 'planning' status.
 * @param {number} userId
 * @param {number} startStationId
 * @param {number} destinationStationId
 * @returns {Promise<number>} id of the newly created game
 */
export const createGame = (userId, startStationId, destinationStationId) => {
    return new Promise((resolve, reject) => {
        const sql = `
        INSERT INTO games (userId, startStationId, destinationStationId, status, createdAt) 
        VALUES (?, ?, ?, 'planning', ?)`;

        const createdAt = new Date().toISOString();
        
        db.run(sql, [userId, startStationId, destinationStationId, createdAt], function (err) { // use function (not =>) so this refers to the statement context with lastID
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID); // id of the newly inserted row
            }
        });
    });
};

/**
 * Fetch a single game row, scoped to the owning user. The userId predicate
 * means the DAO itself refuses to return another user's game, even if a
 * route handler forgets to check ownership.
 * @param {number} gameId
 * @param {number} userId
 * @returns {Promise<object|false>} the game row, or false if not found
 */
export const getGameById = (gameId, userId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM games 
                     WHERE id = ? AND userId = ?
        `;
        db.get(sql, [gameId, userId], (err, row) => {
            if (err) {
                reject(err);
            } else if (row === undefined) {
                resolve(false) // game not found or not owned by this user
            } else {
                resolve(row);
            }
        });
    });
};


/**
 * Store the per-step result of an execution: each step gets its assigned
 * event and the running coin total recorded. Steps are inserted in order;
 * if any insert fails the function rejects, leaving the caller to handle it.
 * @param {number} gameId
 * @param {Array<{fromStationId:number, toStationId:number, stepNumber:number,
 *                eventId:number, remainingCoins:number}>} steps
 * @returns {Promise<void>}
 */
export const saveGameSteps = async (gameId, steps) => {
    for (const step of steps) {
        // waits until last insert is done before starting next
        await new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO gameSteps 
                (gameId, fromStationId, toStationId, stepNumber, eventId, remainingCoins)
                VALUES (?, ?, ?, ?, ?, ?)
                `;
            db.run(sql, [gameId, 
                step.fromStationId, 
                step.toStationId,
                step.stepNumber, 
                step.eventId, 
                step.remainingCoins], 
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }
};


/**
 * Mark a game as completed. The caller is responsible for clamping a
 * negative final score to 0 before passing it in (spec: negative scores
 * are stored as zero).
 * @param {number} gameId
 * @param {number} finalScore - already clamped to >= 0
 * @param {boolean} isValid
 * @returns {Promise<number>} number of rows updated (1 on success, 0 if no game matched)
 */
export const completeGame = (gameId, finalScore, isValid) => {
    return new Promise((resolve, reject) => {
        const sql = `
                    UPDATE games 
                    SET status = 'completed',
                        finalScore = ?, 
                        isValid = ?
                    WHERE id = ?
                    `;
        db.run(sql, [finalScore, isValid ? 1 : 0, gameId], function (err) {
            if (err) {
                reject(err);
            } else {
                // this.changes = 0 if game does not exist, 1 if updated
                resolve(this.changes);
            }
        })
    });
};


/**
 * Retrieve all steps of a game, in order, joined with station names and
 * the assigned event. Used by the client to animate the execution phase.
 * @param {number} gameId
 * @returns {Promise<Array<object>>}
 */
export const getGameSteps = (gameId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT gs.stepNumber,
                   gs.fromStationId, sf.name AS fromStationName,
                   gs.toStationId,   st.name AS toStationName,
                   gs.eventId,
                   e.description AS eventDescription,
                   e.effect      AS eventEffect,
                   gs.remainingCoins                    
            FROM gameSteps gs 
            JOIN stations sf ON (gs.fromStationId = sf.id)
            JOIN stations st ON (gs.toStationId = st.id)
            LEFT JOIN events e ON (gs.eventId = e.id)
            WHERE gs.gameId = ?
            ORDER BY gs.stepNumber
                    `;
        db.all(sql, [gameId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows)
        });
    });
};


/**
 * Return every event. Used by the execution logic in the route handler
 * to pick a random event per step.
 * @returns {Promise<Array<{id:number, description:string, effect:number}>>}
 */
export const getAllEvents = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id, description, effect FROM events`;

        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};


/**
 * Public ranking: for every user who has finished at least one game,
 * return their best (highest) final score.
 * @returns {Promise<Array<{userId:number, name:string, bestScore:number}>>}
 */
export const getRanking = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT u.id AS userId, 
                   u.name AS name, 
                   MAX(g.finalScore) AS bestScore
            FROM games g
            JOIN users u ON (u.id = g.userId)
            WHERE g.status = 'completed'
            GROUP BY u.id, u.name
            ORDER BY bestScore DESC, u.name ASC
            `;

        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};