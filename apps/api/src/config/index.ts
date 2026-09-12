export default () => ({
  app: {
    environment: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT ?? 3000),
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    accessTokenTtlSeconds: Number(process.env.JWT_ACCESS_TTL_SECONDS ?? 900),
  },
});
