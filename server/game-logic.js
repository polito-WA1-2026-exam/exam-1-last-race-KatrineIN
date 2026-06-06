// Game-logic helpers


/**
 * Build an undirected adjacency list from the segment edges.
 * Ex (a = s1, b = s2), (a = s2, b = s3) 
 * -> (s1 -> [s2]), (s2 -> [s1, s3]), (s3 -> [s2])
 * @param {Array<{id:number, name:string}>} stations
 * @param {Array<{aId:number, bId:number}>} segments
 * @returns {Map<number, number[]>}
 */
export const buildAdjacency = (stations, segments) => {
    const adjacency = new Map();
    stations.forEach((s) => adjacency.set(s.id, []));
    segments.forEach(({ aId, bId }) => {
        adjacency.get(aId).push(bId);
        adjacency.get(bId).push(aId);
    });
    return adjacency;
};


/**
 * Find shortest distance (in segments) from a source station to every reachable
 * station, computed with a standard breadth-first search.
 * @param {Map<number, number[]>} adjacency
 * @param {number} sourceId (start station)
 * @returns {Map<number, number>} stationId -> distance
 */
export const shortestDistances = (adjacency, sourceId) => {
    const distance = new Map([[sourceId, 0]]);
    const toVisit = [sourceId];

    while (toVisit.length > 0) {
        const station = toVisit.shift();
        const neighbours = adjacency.get(station) ?? [];

        for (const neighbour of neighbours) {
            if (!distance.has(neighbour)) {
                distance.set(neighbour, distance.get(station) + 1);
                toVisit.push(neighbour);
            }
        }
    }
    return distance;
};


/**
 * Pick a uniformly random (start, destination) pair whose shortest-path
 * distance is at least `minDistance` segments. The whole set of valid
 * pairs is enumerated first, then one is sampled — this is unbiased and,
 * for our small network (~15 stations), takes microseconds.
 * @param {Array<{id:number, name:string}>} stations
 * @param {Array<{aId:number, bId:number}>} segments
 * @param {number} [minDistance=3]
 * @returns {{start:{id:number,name:string}, destination:{id:number,name:string}}}
 */
export const pickStartAndDestination = (stations, segments, minDistance = 3) => {
    const adjacency = buildAdjacency(stations, segments);

    // Enumerate every (start, destination) pair that satisfies the rule.
    const validPairs = [];
    for (const start of stations) {
        const distance = shortestDistances(adjacency, start.id);
        for (const candidate of stations) {
            if (candidate.id === start.id) continue;
            if ((distance.get(candidate.id) ?? 0) >= minDistance) {
                validPairs.push({ start, destination: candidate });
            }
        }
    }

    if (validPairs.length === 0) {
        throw new Error(
            `No station pair found with distance >= ${minDistance}. ` +
            "Check the network seed data."
        );
    }
    // return random pair with start and end destination
    return validPairs[Math.floor(Math.random() * validPairs.length)];
};


/**
 * Canonical key for an undirected segment {a, b}: always smaller id first.
 * Makes {3,7} and {7,3} both map to "3-7" so direction is irrelevant.
 */
const segmentKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);


/**
 * Validate a player-submitted route against the network rules.
 * Returns true only when ALL of the following hold:
 *   1. The route is non-empty.
 *   2. Its first step starts at startStationId.
 *   3. Its last step ends at destinationStationId.
 *   4. Each consecutive pair of steps is chained (step i ends where i+1 begins).
 *   5. Every step is an existing network segment.
 *   6. No segment is used more than once (compared undirected).
 *
 * The same STATION may appear multiple times; only segment reuse is forbidden.
 * Line-change rules are automatically satisfied because every step is
 * verified against the real segment set.
 *
 * @param {Array<{fromStationId:number, toStationId:number}>} route (user submitted)
 * @param {Array<{aId:number, bId:number}>} segments
 * @param {number} startStationId
 * @param {number} destinationStationId
 * @returns {boolean}
 */
export const validateRoute = (route, segments, startStationId, destinationStationId) => {
    // (1)
    if (!Array.isArray(route) || route.length === 0) return false;

    // (2) and (3): endpoints
    if (route[0].fromStationId !== startStationId) return false;
    if (route[route.length - 1].toStationId !== destinationStationId) return false;

    // use segment key so direction do not matter
    const allowed = new Set(segments.map(({ aId, bId }) => segmentKey(aId, bId)));
    const used = new Set(); // set to validate no segment is used twice

    for (let i = 0; i < route.length; i++) {
        const step = route[i];

        // (4) Continuity with the previous step
        if (i > 0 && step.fromStationId !== route[i - 1].toStationId) return false;

        // (5) Must be a real segment in the network
        const key = segmentKey(step.fromStationId, step.toStationId);
        if (!allowed.has(key)) return false;

        // (6) No segment reused (undirected)
        if (used.has(key)) return false;
        used.add(key); // show that segment is already used
    }

    return true;
};


/**
 * Run the execution phase for a valid route: assign one random event to each
 * step and track the running coin total. No DB access — events are passed in,
 * the caller persists the result. Mirrors pickStartAndDestination, which also
 * lives here and uses randomness.
 * @param {Array<{fromStationId:number, toStationId:number}>} route
 * @param {Array<{id:number, effect:number}>} events
 * @param {number} [startingCoins=20]
 * @returns {Array<{fromStationId:number, toStationId:number, stepNumber:number,
 *                  eventId:number, remainingCoins:number}>}
 */
export const runExecution = (route, events, startingCoins = 20) => {
    let coins = startingCoins;
    return route.map((seg, i) => {
        const event = events[Math.floor(Math.random() * events.length)];
        coins += event.effect; // running total may dip below zero mid-journey
        return {
            fromStationId: seg.fromStationId,
            toStationId: seg.toStationId,
            stepNumber: i + 1,
            eventId: event.id,
            remainingCoins: coins,
        };
    });
};