import { ToolDb } from "mtgatool-db";
import { PORT, SWARM_KEY, SERVER_NAME } from "./constants";

const redis = require("redis");

const chunk = parseInt(process.argv[2] || "0");

const toolDb = new ToolDb({
  ssl: false,
  server: true,
  debug: false,
  topic: SWARM_KEY,
  serverName: SERVER_NAME,
  host: "127.0.0.1",
  port: PORT,
});

/**
 * This script will migrate the entire database from toolDb/leveldb to redis.
 * execute as;
 * npm run build:migrate <chunk>
 * Where each chunk is 100000 keys/records, this is because executing the whole
 * migration at once will cause Js to crash on memory usage.
 * Redis and Level are both relatively fast, so this doesnt take long anyways.
 */

const redisClient = redis.createClient();
redisClient.connect().then(() => {
  console.log("Redis connected");

  toolDb.store.query("").then(async (allKeys) => {
    console.log("All keys: ", allKeys.length);

    let migrated = 0;
    let failed = 0;
    let failedKeys: string[] = [];

    const promises = allKeys
      .slice(chunk * 100000, (chunk + 1) * 100000)
      .map((key, i) => {
        return new Promise((resolve) => {
          toolDb.store.get(key, (err, value) => {
            if (!err && value) {
              redisClient.set(key, value).then(() => {
                if (i % 1000 === 0) {
                  const index = chunk * 100000 + i;
                  console.log(
                    `${index}/${allKeys.length} (${Math.round(
                      (100 / allKeys.length) * index
                    )}%) - Migrated: ${migrated} Failed: ${failed}`
                  );
                }
                migrated++;
                resolve(i);
              });
            } else {
              failed++;
              failedKeys.push(key);
              resolve(i);
            }
          });
        });
      });

    Promise.all(promises).then(() => {
      console.log("Done!");
      if (failedKeys.length > 0) console.log("Failed keys: ", failedKeys);
      process.exit(0);
    });
  });
});
