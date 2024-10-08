/**
 * @file redisClient.ts
 * @description Enhanced Redis client using RxJS and Pub/Sub that writes, reads, and outputs messages to/from a Redis database.
 * @version 1.0.0
 * @date 2023-10-05
 * @license MIT
 *
 * @dependencies
 * - redis: Redis client for Node.js
 * - rxjs: Reactive Extensions for JavaScript
 * - uuid: UUID generation for unique keys
 *
 * @usage
 * To run the script, use the following command:
 * ```
 * npx ts-node redisClient.ts
 * ```
 *
 * @notes
 * - Ensure that Redis is running locally before running the script.
 *
 * @maintainer
 * - GitHub Copilot
 */
import { Observable } from 'rxjs';
declare function writeRecords(): Observable<string>;
declare function readRecords(): Observable<string>;
declare function subscribeToChannel(channel: string): Observable<string>;
declare const _default: {
    writeRecords: typeof writeRecords;
    readRecords: typeof readRecords;
    subscribeToChannel: typeof subscribeToChannel;
};
export default _default;
//# sourceMappingURL=redisClient.d.ts.map