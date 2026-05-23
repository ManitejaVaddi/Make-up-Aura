import 'dotenv/config';
import { connectDatabase } from '../config/db.js';
import User from '../models/userModel.js';

async function run() {
  await connectDatabase();
  const email = 'admin@bridalaura.test';
  const existing = await User.findOne({ email });
  if (existing) {
    existing.name = 'Test Admin';
    existing.role = 'admin';
    existing.password = 'AdminPass123!';
    await existing.save();
    console.log('Updated existing admin user:', existing.email);
    process.exit(0);
  }

  const user = await User.create({
    name: 'Test Admin',
    email,
    password: 'AdminPass123!',
    role: 'admin',
    authProvider: 'email'
  });
  console.log('Created admin user:', user.email);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
