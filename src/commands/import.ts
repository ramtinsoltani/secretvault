import app from 'argumental';
import path from 'path';
import fs from 'fs-extra';
import zlib from 'zlib';

app
.command('import')
.alias('i')
.description('imports an exported vault')

.argument('<filename>')
.description('exported vault\'s filename')
.validate(app.FILE_PATH)

.argument('<vault_name>')
.description('new vault name')
.validate(app.STRING)
.validate(value => ! value.trim() ? new Error(`Invalid vault name!`) : value.trim())
.validate(name => app.data<AppData>().vaults.includes(name) ? new Error(`Vault already exists!`) : name)

.action(async (args: ImportArgs) => {

  // Load the exported vault
  const compressed = await fs.readFile(path.resolve(process.cwd(), args.filename));
  const decompressed = zlib.inflateSync(compressed).toString();

  // Ask app finalizer to save vault as raw (no encryption)
  app.data<AppData>().saveVault = {
    name: args.vaultName,
    data: decompressed,
    secret: null,
    raw: true
  };

});
