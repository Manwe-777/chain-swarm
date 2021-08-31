const env = process.argv[2] || "dev";

export default env as "prod" | "dev";
