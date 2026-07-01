import { app } from "./app.js";
import { connectDb } from "./config/db.js";
import { assertEnv, env } from "./config/env.js";

async function bootstrap() {
  assertEnv();
  await connectDb();

  app.listen(env.port, () => {
    console.log(`Server listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
