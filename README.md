# Pass Vault

Pass Vault is a credentials manager on the terminal. It allows creating multiple vaults with specific secret keys to store various credentials and retrieve them later using the same key.

## Installation

```bash
npm install passvault -g
vault --help
```

## Usage

- `vault new <vault_name>`  
  `vault n <vault_name>`  
  Creates a new vault.
- `vault list [vault_name]`  
  `vault ls [vault_name]`  
  Lists all vaults or credentials in a vault.
- `vault write <vault_name> <credentials_name> --password <value> --username <value> --email <value> --url <value> --other <value> --overwrite`  
  `vault w <vault_name> <credentials_name> -p <value> -u <value> -e <value> -U <value> -O <value> -o`  
  Adds new credentials to a vault (will overwrite if credential already exists).
- `vault read <vault_name> <credentials_name>`  
  `vault r <vault_name> <credentials_name>`  
  Reads credentials from a vault.
- `vault delete <vault_name> <credentials_name>`  
  `vault d <vault_name> <credentials_name>`  
  Deletes credentials from a vault.
- `vault remove <vault_name>`  
  `vault R <vault_name>`  
  Deletes an entire vault.
- `vault clone <target> <destination>`  
  `vault c <target> <destination>`  
  Clones a vault into a new one.
- `vault update <vault_name>`  
  `vault u <vault_name>`  
  Updates a vault's secret.
- `vault generate [length]`  
  `vault g [length]`  
  Generates a strong password.
- `vault export <vault_name> <dirname>`  
  `vault e <vault_name> <dirname>`  
  Exports a vault into a file.
- `vault import <filename> <vault_name>`  
  `vault i <filename> <vault_name>`  
   Imports an exported vault.
