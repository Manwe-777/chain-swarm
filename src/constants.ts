export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8765;

export const USE_HTTP = process.env.USE_HTTP === "true";

export const USE_DHT = process.env.USE_DHT === "true";
