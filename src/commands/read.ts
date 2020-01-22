import app from 'argumental';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { decrypt } from '../crypto';

app
.command('read')
.alias('r')
.description('reads credentials from a vault')

.argument('<vault_name>')
.description('vault name')
.validate(name => ! app.data<AppData>().vaults.includes(name) ? new Error('Vault not found!') : name )

.argument('<credentials_name>')
.description('credentials name')
.validate(app.STRING)
.validate(value => ! value.trim() ? new Error(`Invalid credentials name!`) : value.trim())

// Secret key will be stored on app data after this event is emitted
.on('actions:before', async (data) => ! data.opts.help ? await app.emit('prompt-secret', 'Vault secret:') : null )

.action(async (args: ReadWriteCredentialsArgs) => {

  // Load vault
  let vault: Vault;
  const data = app.data<AppData>();
  const encrypted = await fs.readFile(path.join(app.data<AppData>().vaultsDir, args.vaultName + '.vault'), { encoding: 'utf8' });

  // Decrypt with the provided secret
  try {

    vault = decrypt(encrypted, data.vaultSecret, data.vaultSecretSalt);

  }
  // If invalid secret
  catch (error) {

    return console.log('\n' + chalk.redBright.bold(`Invalid vault secret!`) + '\n');

  }

  if ( ! vault.hasOwnProperty(args.credentialsName) )
    return console.log('\n' + chalk.redBright.bold(`Credentials ${args.credentialsName} does not exist in vault!`) + '\n');

  const creds = vault[args.credentialsName];

  console.log('\n' + chalk.white('Name:'.padEnd(10)), chalk.blueBright.bold(args.credentialsName));
  if ( creds.email ) console.log(chalk.white('Email:'.padEnd(10)), chalk.yellow.bold(creds.email));
  if ( creds.username ) console.log(chalk.white('Username:'.padEnd(10)), chalk.yellow.bold(creds.username));
  if ( creds.password ) console.log(chalk.white('Password:'.padEnd(10)), chalk.yellow.bold(creds.password));
  if ( creds.url ) console.log(chalk.white('URL:'.padEnd(10)), chalk.yellow.bold(creds.url));

  if ( ! creds.other.length ) return console.log('');

  console.log(chalk.white('Other:'.padEnd(10)), creds.other.map(v => chalk.yellow.bold(v)).join(', '), '\n');

});
