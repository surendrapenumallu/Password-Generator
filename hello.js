const crypto = require('crypto');

function generatePassword(length = 12) {
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const number = '0123456789';
  const symbol = '!@#$%^&*()_+~{}[]<>;:?/';

  const allCharacters = lowerCase + upperCase + number + symbol;
  let password = '';

  password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
  password += upperCase[Math.floor(Math.random() * upperCase.length)];
  password += number[Math.floor(Math.random() * number.length)];
  password += symbol[Math.floor(Math.random() * symbol.length)];

  for (let i = password.length; i < length; i++) {
    const randomIndex = crypto.randomInt(0, allCharacters.length);
    password += allCharacters[randomIndex];
  }

  password = password.split('').sort(() => 0.5 - Math.random()).join('');
  return password;
}

const length = parseInt(process.argv[2], 10) || 12;
console.log(`Generated Password: ${generatePassword(length)}`);
