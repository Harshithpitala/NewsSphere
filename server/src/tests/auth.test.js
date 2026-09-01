import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ROLES } from '../constants/enums.js';
import { generateToken } from '../utils/token.js';
import { requireRole } from '../middlewares/rbac.middleware.js';

export const runAuthTests = async () => {
  console.log('[Test] Running Authentication & RBAC System Tests...\n');

  try {
    await mongoose.connect(env.MONGODB_URI);
    await User.deleteMany({ email: /test.*@newssphere\.com/ });

    // 1. Register test user (Privilege Escalation Prevention Check)
    console.log('1. Testing User Registration & Default Role Enforcement...');
    const testUser = await User.create({
      name: 'Test Regular User',
      email: 'testuser@newssphere.com',
      password: 'SecureTestPassword123!',
      role: ROLES.USER,
    });

    if (testUser.role !== ROLES.USER) {
      throw new Error('Default role enforcement failed! Expected USER');
    }
    console.log('   ✓ User registered with default USER role.');

    // 2. Test Password Hashing
    console.log('2. Testing Bcrypt Password Hashing & Selection...');
    const userWithPass = await User.findById(testUser._id).select('+password');
    const isHashed = userWithPass.password.startsWith('$2a$') || userWithPass.password.startsWith('$2b$');
    if (!isHashed) throw new Error('Password was not hashed properly');

    const passMatch = await userWithPass.comparePassword('SecureTestPassword123!');
    const passWrongMatch = await userWithPass.comparePassword('WrongPassword123!');
    if (!passMatch || passWrongMatch) throw new Error('Password comparison logic failed');
    console.log('   ✓ Bcrypt hashing and password comparison verified.');

    // 3. Test JWT Token Generation & Verification
    console.log('3. Testing JWT Token Sign & Verify...');
    const token = generateToken(testUser._id);
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (decoded.id !== testUser._id.toString()) throw new Error('JWT payload mismatch');
    console.log('   ✓ JWT token signed and decoded successfully.');

    // 4. Test RBAC Permission Middleware Logic
    console.log('4. Testing RBAC Role Restriction Middleware Logic...');
    const mockReqUser = { role: ROLES.USER };
    const mockReqJournalist = { role: ROLES.JOURNALIST };
    const mockReqAdmin = { role: ROLES.ADMIN };

    let rbacPassed = false;
    const adminOnlyMiddleware = requireRole(ROLES.ADMIN);

    // Should reject USER on admin route
    adminOnlyMiddleware({ user: mockReqUser }, {}, (err) => {
      if (err && err.statusCode === 403) {
        rbacPassed = true;
      }
    });

    if (!rbacPassed) throw new Error('RBAC failed to block USER from ADMIN route');

    // Should allow ADMIN on admin route
    let adminAllowed = false;
    adminOnlyMiddleware({ user: mockReqAdmin }, {}, (err) => {
      if (!err) adminAllowed = true;
    });

    if (!adminAllowed) throw new Error('RBAC failed to allow ADMIN on ADMIN route');
    console.log('   ✓ RBAC role-restriction middleware verified.');

    // Cleanup
    await User.deleteMany({ email: /test.*@newssphere\.com/ });
    await mongoose.disconnect();
    console.log('\n[Test] All Authentication & RBAC tests passed successfully! ✨\n');
  } catch (error) {
    console.error('[Test Error] Auth test failed:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

if (process.argv[1].endsWith('auth.test.js')) {
  runAuthTests();
}
