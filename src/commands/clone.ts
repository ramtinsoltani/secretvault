import app from 'argumental';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { decrypt } from '../crypto';

app
.command('clone')
.alias('c')
.description('clones a vault into a new one')

.argument('<target>')
.description('target vault name')
.validate(name => ! app.data<AppData>().vaults.includes(name) ? new Error('Vault not found!') : name )

.argument('<destination>')
.description('new vault name')
.validate(app.STRING)
.validate(value => ! value.trim() ? new Error(`Invalid vault name!`) : value.trim())
.validate(name => app.data<AppData>().vaults.includes(name) ? new Error(`Vault already exists!`) : name)

// Secret key will be stored on app data after this event is emitted
.on('actions:before', async (data) => ! data.opts.help ? await app.emit('prompt-secret', 'Vault secret:') : null )

.action(async (args: CloneVaultArgs) => {

  // Load vault
  let vault: Vault;
  const data = app.data<AppData>();
  const encrypted = await fs.readFile(path.join(app.data<AppData>().vaultsDir, args.target + '.vault'), { encoding: 'utf8' });

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
    name: args.destination,
    secret: data.vaultSecret // The new vault secret
  };

});
