import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error('Usage: npx tsx scripts/hash-password.ts <your-password>');
  process.exit(1);
}

// Immediately invoked async wrapper since top-level await is fine in tsx but good practice
async function main() {
    const hash = await bcrypt.hash(password, 12);
    console.log(hash);
}

main();
