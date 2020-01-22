import app from 'argumental';
import fs from 'fs-extra';
import path from 'path';
import { decrypt } from '../crypto';
import chalk from 'chalk';

app
.command('remove')
.alias('R')
.description('deletes an entire vault')

.argument('<vault_name>')
.description('vault name')
.validate(name => ! app.data<AppData>().vaults.includes(name) ? new Error('Vault not found!') : name )

// Secret key will be stored on app data after this event is emitted
.on('actions:before', async (data) => ! data.opts.help ? await app.emit('prompt-secret', 'Vault secret:') : null )

.action(async (args: VaultNameArgs) => {

  const data = app.data<AppData>();
  const vaultPath = path.join(data.vaultsDir, args.vaultName + '.vault');

  // Check vault secret
  const encrypted = await fs.readFile(vaultPath, { encoding: 'utf8' });

  try {

    decrypt(encrypted, data.vaultSecret, data.vaultSecretSalt);

  }
  catch (error) {

    return console.log('\n' + chalk.redBright.bold(`Invalid vault secret!`) + '\n');

  }

  // Delete vault
  await fs.unlink(vaultPath);

  console.log('\n' + chalk.greenBright.bold(`Vault ${args.vaultName} was removed entirely`) + '\n');

});
