import { ToolDbStore } from "mtgatool-db";

export default function redisStore(dbName = "tooldb"): ToolDbStore {
  const redis = require("redis");
  const redisClient = redis.createClient();
  let connected = false;

  const store = {
    start: () => {},
    put: (
      key: string,
      data: string,
      callback: (err: any | null, data?: string) => void
    ) => {
      //
    },
    get: (key: string, callback: (err: any | null, data?: string) => void) => {
      //
    },
    query: (key: string) => Promise.resolve<string[]>([]),
    quit: () => {
      //
    },
  };

  store.start = function () {
    redisClient.connect().then(() => {
      connected = true;
    });
  };
  store.start();

  store.quit = function () {
    redisClient.quit();
  };

  store.put = function (key, data, cb) {
    if (connected) {
      redisClient.set(key, data).then(cb);
    } else {
      setTimeout(function () {
        store.put(key, data, cb);
      }, 10);
    }
  };

  store.get = function (key, cb) {
    // console.warn("store get", key);
    if (connected) {
      redisClient
        .get(key)
        .then((value: any) => {
          cb(null, value);
        })
        .catch((e: any) => {
          cb(e);
        });
    } else {
      setTimeout(function () {
        store.get(key, cb);
      }, 10);
    }
  };

  store.query = function (key) {
    return redisClient.keys(key + "*");
  };

  return store;
}
