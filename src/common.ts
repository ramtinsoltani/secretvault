import app from 'argumental';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import inquirer from 'inquirer';
import { encrypt } from './crypto';
import chalk from 'chalk';

app
.shared
// Initialize app
.on('validators:before', async () => {

  // Create .vaults directory if it doesn't exist
  await fs.ensureDir(path.resolve(os.homedir(), '.vaults'));

  // Set salt string
  app.data<AppData>().vaultSecretSalt = '15e07aac6afd2acc92d37e94cf3c54d0';
  // Set vaults directory path
  app.data<AppData>().vaultsDir = path.resolve(os.homedir(), '.vaults');
  // Set existing vault names
  app.data<AppData>().vaults = fs.readdirSync(app.data<AppData>().vaultsDir, { withFileTypes: true })
  .filter(file => file.isFile() && file.name.match(/^.+\.vault$/))
  .map(file => file.name.match(/^(.+)\.vault$/)[1]);

})
// Prompt for secret key with the provided message and attach to app data
.on('prompt-secret', async (msg: string) => {

  const input = await inquirer.prompt([{
    name: 'secret',
    type: 'password',
    message: msg,
    mask: '●',
    validate: input => {

      if ( input.length < 8 ) return 'Secret key must be at least 8 characters long!';
      if ( input.length > 32 ) return 'Secret key cannot contain more than 32 characters!';
      if ( ! input.match(/(?=.*[A-Z])(?=.*\d)(?=.*[a-z]).*/g) ) return 'Secret key must contain one digit, one lowercase, and one uppercase character!';

      return true;

    }
  }]);

  app.data<AppData>().vaultSecret = input.secret;

})
// Finalize app
.on('actions:after', async () => {

  const data = app.data<AppData>();

  // Save vault if asked
  if ( data.saveVault ) {

    const newVault = ! fs.existsSync(path.join(data.vaultsDir, data.saveVault.name + '.vault'));

    await fs.writeFile(
      path.join(data.vaultsDir, data.saveVault.name + '.vault'),
      data.saveVault.raw ? data.saveVault.data : encrypt(data.saveVault.data, data.saveVault.secret, data.vaultSecretSalt)
    );

    console.log('\n' + chalk.greenBright.bold(`Vault ${data.saveVault.name} ${newVault ? 'created' : 'updated'}`) + '\n');

  }

});
