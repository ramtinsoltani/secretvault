import app from 'argumental';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { decrypt } from '../crypto';
import zlib from 'zlib';

app
.command('export')
.alias('e')
.description('exports a vault into a file')

.argument('<vault_name>')
.description('vault name')
.validate(name => ! app.data<AppData>().vaults.includes(name) ? new Error('Vault not found!') : name )

.argument('<dirname>')
.description('destination directory')
.validate(async dirname => {

  dirname = path.resolve(process.cwd(), dirname);

  // If directory doesn't exist
  if ( ! fs.existsSync(dirname) )
    throw new Error(`Path "${dirname}" doesn't exist!`);

  // If path is not a directory
  if ( ! (await fs.promises.lstat(dirname)).isDirectory() )
    throw new Error(`Path "${dirname}" is not a directory!`);

  return dirname;

})

.on('validators:after', async data => {

  if ( data.opts.help ) return;

  // If export filename is not free
  if ( fs.existsSync(path.join(data.args.dirname, data.args.vaultName + '.vault.gz')) ) {

    console.log('\n' + chalk.redBright.bold(`Path "${path.join(data.args.dirname, data.args.vaultName + '.vault.gz')}" is not free!`) + '\n');
    process.exit(1);

  }

})

// Secret key will be stored on app data after this event is emitted
.on('actions:before', async (data) => ! data.opts.help ? await app.emit('prompt-secret', 'Vault secret:') : null )

.action(async (args: ExportArgs) => {

  // Load vault
  const data = app.data<AppData>();
  const encrypted = await fs.readFile(path.join(app.data<AppData>().vaultsDir, args.vaultName + '.vault'), { encoding: 'utf8' });

  // Decrypt with the provided secret
  try {

    decrypt(encrypted, data.vaultSecret, data.vaultSecretSalt);

  }
  // If invalid secret
  catch (error) {

    return console.log('\n' + chalk.redBright.bold(`Invalid vault secret!`) + '\n');

  }

  await fs.writeFile(path.join(args.dirname, args.vaultName + '.vault.gz'), zlib.deflateSync(encrypted));

});
