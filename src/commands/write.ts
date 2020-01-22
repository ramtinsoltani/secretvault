import app from 'argumental';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { decrypt } from '../crypto';

app
.command('write')
.alias('w')
.description('adds new credentials to a vault')

.argument('<vault_name>')
.description('vault name')
.validate(name => ! app.data<AppData>().vaults.includes(name) ? new Error('Vault not found!') : name )

.argument('<credentials_name>')
.description('credentials name')
.validate(app.STRING)
.validate(value => ! value.trim() ? new Error(`Invalid credentials name!`) : value.trim())

.option('-p --password <value>')
.description('password')
.validate(value => ! value.trim() ? new Error(`Invalid password!`) : value.trim())

.option('-e --email <value>')
.description('email')
.validate(app.STRING)
.validate(value => ! value.trim() ? new Error(`Invalid email!`) : value.trim())

.option('-u --username <value>')
.description('username')
.validate(value => ! value.trim() ? new Error(`Invalid username!`) : value.trim())

.option('-U --url <value>')
.description('URL')
.validate(app.STRING)
.validate(value => ! value.trim() ? new Error(`Invalid url!`) : value.trim())

.option('-O --other <value>')
.description('additional credentials')
.multi()
// Validator runs for each value and not the whole array (as opposed to rest arguments)
.validate(value => ! value.trim() ? new Error(`Invalid additional credentials!`) : value.trim())
.default([])

.option('-o --overwrite')
.description('overwrites old credentials with the same name (if any)')

// Secret key will be stored on app data after this event is emitted
.on('actions:before', async (data) => ! data.opts.help ? await app.emit('prompt-secret', 'Vault secret:') : null )

.action(async (args: ReadWriteCredentialsArgs, opts: WriteCredentialsOpts) => {

  // If no credentials provided
  if ( ! opts.p && ! opts.e && ! opts.u && ! opts.U && ! opts.O.length )
    return console.log('\n' + chalk.redBright.bold(`At least one credentials must be provided!`) + '\n');

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

  // If credentials exist and no overwrite
  if ( vault.hasOwnProperty(args.credentialsName) && ! opts.overwrite )
    return console.log('\n' + chalk.redBright.bold(`Credentials ${args.credentialsName} already exists!`) + '\n');

  // Add new credentials to vault
  const creds = vault[args.credentialsName] || {};
  creds.username = opts.username || creds.username;
  creds.password = opts.password || creds.password;
  creds.email = opts.email || creds.email;
  creds.url = opts.url || creds.url;
  creds.other = opts.other || creds.other;

  vault[args.credentialsName] = creds;

  // Ask the app finalizer to save the vault
  data.saveVault = {
    data: vault,
    name: args.vaultName,
    secret: data.vaultSecret
  };

});
