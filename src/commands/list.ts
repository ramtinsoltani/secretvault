import app from 'argumental';
import fs from 'fs-extra';
import path from 'path';
import { decrypt } from '../crypto';
import chalk from 'chalk';

app
.command('list')
.alias('ls')
.description('lists all vaults or credentials in a vault')

.argument('[vault_name]')
.description('vault name')
.validate(name => ! app.data<AppData>().vaults.includes(name) ? new Error('Vault not found!') : name )

// Secret key will be stored on app data after this event is emitted
.on('actions:before', async (data) => ! data.opts.help && data.args.vaultName ? await app.emit('prompt-secret', 'Vault secret:') : null )

.action(async (args: VaultNameArgs) => {

  // If listing vaults
  if ( ! args.vaultName ) {

    if ( app.data<AppData>().vaults.length )
      console.log('\n' + app.data<AppData>().vaults.join('\n') + '\n');
    else
      console.log('\n' + chalk.dim('No vaults to display!') + '\n');

  }
  // If listing credentials inside a vault
  else {

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

    if ( Object.keys(vault).length )
      console.log('\n' + Object.keys(vault).join('\n') + '\n');
    else
      console.log('\n' + chalk.dim(`No credentials in ${args.vaultName}!`) + '\n');

  }

});
