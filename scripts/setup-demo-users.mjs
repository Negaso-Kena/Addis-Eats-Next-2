// Generates lib/demo-users.json (bcrypt hashes). Public demo accounts only.
// Run once: node scripts/setup-demo-users.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { hashSync } from "bcryptjs";

const accounts = [
  { id: "usr_customer", name: "Naga", phone: "0911223344", password: "customer123", role: "customer" },
  { id: "usr_customer_test", name: "Test Customer", phone: "0911000000", password: "customer456", role: "customer" },
  { id: "usr_staff", name: "Kitchen Staff", phone: "0999887766", password: "staff123", role: "staff" },
];

const users = accounts.map(({ password, ...account }) => ({
  ...account,
  passwordHash: hashSync(password, 12),
}));

const destination = resolve("lib/demo-users.json");
mkdirSync(dirname(destination), { recursive: true });
writeFileSync(destination, `${JSON.stringify(users, null, 2)}\n`);
console.log("Generated hashed demo users. Do not use these accounts for real customers.");
