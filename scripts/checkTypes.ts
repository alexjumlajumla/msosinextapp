import { execSync } from 'child_process';

try {
  execSync('tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ No type errors found');
  process.exit(0);
} catch (error) {
  console.error('❌ Type check failed');
  process.exit(1);
}

export {}; // Add this line to make it a module