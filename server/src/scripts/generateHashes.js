const bcrypt = require('bcryptjs');

const passwords = {
  citizen: 'Citizen@123',
  volunteer: 'Volunteer@123',
  admin: 'Admin@123'
};

const hashes = {};
for (const [key, pwd] of Object.entries(passwords)) {
  const hash = bcrypt.hashSync(pwd, 10);
  hashes[key] = hash;
  console.log(`${key} (${pwd}): ${hash} -> verified: ${bcrypt.compareSync(pwd, hash)}`);
}

console.log('\nJSON output:');
console.log(JSON.stringify(hashes, null, 2));
