import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import Student from './src/models/student.model.js';
import Teacher from './src/models/teacher.model.js';
import connectDB from './src/config/db.js';

async function verifyAll() {
  try {
    await connectDB();
    console.log('Connected to DB. Verifying users...');
    
    const studentRes = await Student.updateMany({}, { status: 'Verified' });
    console.log(`Verified ${studentRes.modifiedCount} students.`);
    
    const teacherRes = await Teacher.updateMany({}, { status: 'Verified' });
    console.log(`Verified ${teacherRes.modifiedCount} teachers.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error verifying users:', error);
    process.exit(1);
  }
}

verifyAll();
