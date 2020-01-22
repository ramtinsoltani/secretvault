import app from 'argumental';

app
.command('new')
.alias('n')
.description('creates a new vault with a secret key')

.argument('<vault_name>')
.description('new vault name')
.validate(app.STRING)
.validate(value => ! value.trim() ? new Error(`Invalid vault name!`) : value.trim())
.validate(name => app.data<AppData>().vaults.includes(name) ? new Error(`Vault already exists!`) : name)

// Secret key will be stored on app data after this event is emitted
.on('actions:before', async (data) => ! data.opts.help ? await app.emit('prompt-secret', 'New vault secret:') : null )

.action(async (args: VaultNameArgs) => {

  const data = app.data<AppData>();

  // Instruct app finalizer (actions:after) to create a new vault
  data.saveVault = {
    name: args.vaultName,
    data: {},
    secret: data.vaultSecret // Provided by 'prompt-secret' event handler
  };

});
