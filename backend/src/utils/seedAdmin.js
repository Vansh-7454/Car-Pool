import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';

export async function ensureDefaultAdmin() {
  const email = 'vansh@gmail.com';
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
    }
    return;
  }

  const passwordHash = await bcrypt.hash('123456', 10);

  await User.create({
    name: 'Default Admin',
    email,
    passwordHash,
    role: 'admin',
  });

  console.log('Default admin created: vansh@gmail.com / 123456');
}
