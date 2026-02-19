import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { envVars } from "./config";
import * as schema from "./schema";

const pool = new Pool({
	connectionString: envVars.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export type Database = typeof db;
