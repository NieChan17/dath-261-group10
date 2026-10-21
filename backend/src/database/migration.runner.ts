import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://edupulse_user:secure_staging_password@localhost:5432/edupulse_staging';

async function runMigrations() {
  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  console.log('===> Starting PostgreSQL Migrations for EduPulse...');
  console.log(`===> Target database: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);

  try {
    // 1. Create schema_migrations table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(100) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2. Read already applied migrations
    const appliedResult = await client.query('SELECT version FROM schema_migrations ORDER BY version');
    const appliedVersions = new Set(appliedResult.rows.map((r) => r.version));

    // 3. Find migration files
    const migrationsDir = path.resolve(__dirname, '../../migrations');
    if (!fs.existsSync(migrationsDir)) {
      throw new Error(`Migrations directory not found at: ${migrationsDir}`);
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    console.log(`===> Found ${files.length} migration files in ${migrationsDir}`);

    let appliedCount = 0;

    for (const file of files) {
      if (appliedVersions.has(file)) {
        console.log(`  [SKIP] ${file} (already applied)`);
        continue;
      }

      console.log(`  [RUNNING] ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf-8');

      await client.query('BEGIN');
      try {
        await client.query(sqlContent);
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`  [SUCCESS] ${file}`);
        appliedCount++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  [FAILED] ${file}:`, err.message);
        throw err;
      }
    }

    console.log(`===> Migration completed successfully! Applied ${appliedCount} new migrations.`);
  } catch (error) {
    console.error('===> Migration process aborted with error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations();
}

export { runMigrations };
