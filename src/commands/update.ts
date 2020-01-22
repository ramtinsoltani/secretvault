import app from 'argumental';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { decrypt } from '../crypto';

app
.command('update')
.alias('u')
.description('updates a vault\'s secret')

.argument('<vault_name>')
.description('vault name')
.validate(name => ! app.data<AppData>().vaults.includes(name) ? new Error('Vault not found!') : name )

// Secret key will be stored on app data after this event is emitted
.on('actions:before', async (data) => ! data.opts.help ? await app.emit('prompt-secret', 'Vault secret:') : null )

.action(async (args: VaultNameArgs) => {

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

  // Prompt new vault secret
  await app.emit('prompt-secret', 'New vault secret:');

  // Ask app finilizer to create a new vault
  data.saveVault = {
    data: vault,
    name: args.vaultName,
    secret: data.vaultSecret // The new vault secret
  };

});
