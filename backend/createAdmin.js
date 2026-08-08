import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import Teacher from './src/models/teacher.model.js';
import connectDB from './src/config/db.js';

async function createOrPromoteAdmin() {
  try {
    await connectDB();
    console.log('Connected to DB...');

    const email = process.argv[2] || 'admin@delta.com';
    const password = process.argv[3] || 'admin123';
    const name = process.argv[4] || 'System Admin';

    let teacher = await Teacher.findOne({ email });

    if (teacher) {
      teacher.role = 'admin';
      teacher.status = 'Verified';
      teacher.active = true;
      await teacher.save();
      console.log(`Success! Updated existing teacher (${email}) to role: 'admin'.`);
    } else {
      teacher = await Teacher.create({
        fullName: name,
        email,
        phone: '9999999999',
        password,
        role: 'admin',
        status: 'Verified',
        active: true,
        qualification: 'Master of Science',
        subjects: ['Mathematics', 'Physics'],
      });
      console.log(`Success! Created new Admin account (${email}) with role: 'admin'. Password: ${password}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createOrPromoteAdmin();
