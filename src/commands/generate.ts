import app from 'argumental';
import chalk from 'chalk';

app
.command('generate')
.alias('g')
.description('generates a strong password')

.argument('[length]')
.description('password length (defaults to 16)')
.validate(app.NUMBER)
.validate(length => length < 6 ? new Error('Length cannot be less than 6!') : length)
.validate(length => length > 64 ? new Error('Length cannot be greater than 64!') : length)
.default(16)

.action((args: GenerateArgs) => {

  const numset = '1234567890';
  const numRatio = Math.max(Math.floor(args.length / 8), 1);
  const charset = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
  const specialset = '~!@#$%^&*()_+=-`{}[]\\|/?.,><';
  const specialRatio = Math.floor(args.length / 6);
  let generated: string = '';

  // Add characters
  for ( let i = 0; i < (args.length - numRatio - specialRatio); i++ ) {

    generated += charset[Math.floor(Math.random() * charset.length)];

  }

  // If not one uppercase, make one random character uppercase
  if ( generated.match(/^[a-z]+$/) ) {

    const index = Math.floor(Math.random() * generated.length);

    generated = generated.substr(0, index) + generated[index].toUpperCase() + generated.substr(index + 1);

  }

  // If not one lowercase, make one random character lowercase
  if ( generated.match(/^[A-Z]+$/) ) {

    const index = Math.floor(Math.random() * generated.length);

    generated = generated.substr(0, index) + generated[index].toLowerCase() + generated.substr(index + 1);

  }

  // Insert numbers randomly
  for ( let i = 0; i < numRatio; i++ ) {

    const index = Math.floor(Math.random() * generated.length);

    generated = generated.substr(0, index) + numset[Math.floor(Math.random() * numset.length)] + generated.substr(index);

  }

  // Insert special characters randomly
  for ( let i = 0; i < specialRatio; i++ ) {

    const index = Math.floor(Math.random() * generated.length);

    generated = generated.substr(0, index) + specialset[Math.floor(Math.random() * specialset.length)] + generated.substr(index);

  }

  console.log('\n' + chalk.magenta.bold(generated) + '\n');

});
