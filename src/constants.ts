export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8765;

export const USE_HTTP = process.env.USE_HTTP || false;

export const DEBUG = Boolean(process.env.DEBUG || false);

export const USE_DHT = process.env.USE_DHT || false;

export const SWARM_KEY = process.env.SWARM_KEY || "mtgatool-db-swarm-v4";

export const SERVER_NAME = process.env.SERVER_NAME || "mtgatool-default-server";

export const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || undefined;
