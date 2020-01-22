import app from 'argumental';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { decrypt } from '../crypto';

app
.command('delete')
.alias('d')
.description('deletes credentials from a vault')

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

  // If credentials not found
  if ( ! vault.hasOwnProperty(args.credentialsName) )
    return console.log('\n' + chalk.redBright.bold(`Credentials ${args.credentialsName} does not exist in vault!`) + '\n');

  // Delete credentials from vault
  delete vault[args.credentialsName];

  // Ask the app finalizer to save the vault
  data.saveVault = {
    data: vault,
    name: args.vaultName,
    secret: data.vaultSecret
  };

});
