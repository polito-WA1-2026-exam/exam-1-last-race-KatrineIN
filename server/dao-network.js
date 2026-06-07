// Data Access Object (DAO) for the underground network

import db from "./db.js";


/**
 * Get all stations in the network.
 * @returns {Promise<Array<{id: number, name: string}>>} array of stations, ordered by name
 */
export const getAllStations = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM stations ORDER BY name";
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};


/**
 * Get the full network map for the Setup phase: one object per line,
 * each holding its stations in position order. Grouping is done here so
 * the client receives exactly the shape it needs to draw the map.
 * @returns {Promise<Array<{id: number, name: string, color:string, 
 *          stations: Array<{id: number, name: string, position: number}>}>>}
 */
export const getNetworkMap = () => {
    return new Promise((resolve, reject) => {
        // JOIN lines with lineStations and stations to get one row per line-station pair
        // ordered by pr line and in the order of stations
        const sql = `
            SELECT l.id AS lineId, l.name AS lineName, l.color AS color,
                s.id AS stationId, s.name AS stationName,
                ls.position AS position 
            FROM lines l
            JOIN lineStations ls ON (l.id = ls.lineId)
            JOIN stations s ON (s.id = ls.stationId)
            ORDER BY l.id, ls.position
            `; 
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                // Group flat rows into nested structure: one entry per line, with its stations.
                const linesMap = new Map();

                for (const row of rows) {
                    // add line if not already in map.
                    if (!linesMap.has(row.lineId)) {
                        const line = { id: row.lineId, name: row.lineName, color: row.color, stations: [] };
                        linesMap.set(row.lineId, line);
                    }
                    // add this station to the matching line
                    linesMap.get(row.lineId).stations.push({
                        id: row.stationId,
                        name: row.stationName,
                        position: row.position,
                    });
                }
                resolve(Array.from(linesMap.values()));
            }
        });
    });
};


/**
 * Get all segments (pairs of neighboring stations) in the network.
 * A segment connects two stations that are adjacent on at least one line.
 * Used in the Planning phase. Line information is intentionally not exposed.
 * @returns {Promise<Array<{aId: number, aName: string, bId: number, bName: string}>>}
 */
export const getAllSegments = () => {
    return new Promise((resolve, reject) => {
        // order all lineId pairs from small to large 
        // -> makes segment direction independent, only one segment between two stations
        const sql = `
            SELECT DISTINCT a.id AS aId, a.name AS aName,
                            b.id AS bId, b.name AS bName
            FROM (
                SELECT MIN(ls1.stationId, ls2.stationId) AS aId,
                       MAX(ls1.stationId, ls2.stationId) AS bId
                FROM lineStations ls1
                JOIN lineStations ls2 
                  ON ls1.lineId = ls2.lineId
                 AND ls2.position = ls1.position + 1
            ) AS pairs
            JOIN stations a on (a.id = pairs.aId)
            JOIN stations b on (b.id = pairs.bId)
            ORDER BY aName, bName
            `; // order by name to make sure planning phase do not have line info
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};



