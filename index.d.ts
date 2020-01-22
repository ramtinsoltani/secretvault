declare interface VaultNameArgs {

  vaultName: string;

}

declare interface ReadWriteCredentialsArgs extends VaultNameArgs {

  credentialsName: string;

}

declare interface WriteCredentialsOpts {

  email?: string;
  e?: string;
  username?: string;
  u?: string;
  url?: string;
  U?: string;
  password?: string;
  p?: string;
  other: string[];
  O: string[];
  overwrite: boolean;
  o: boolean;

}

declare interface CloneVaultArgs {

  target: string;
  destination: string;

}

declare interface OverwriteOpts {

  o: boolean;
  overwrite: boolean;

}

declare interface GenerateArgs {

  length: number;

}

declare interface ExportArgs extends VaultNameArgs {

  dirname: string;

}

declare interface ImportArgs extends VaultNameArgs {

  filename: string;

}

declare interface AppData {

  vaultsDir: string;
  vaults: string[];
  vaultSecretSalt: string;
  /** Result of secret prompt if event 'prompt-secret' was emitted. */
  vaultSecret?: string;
  /** Automatically create/update vault after all actions. */
  saveVault?: {
    name: string;
    data: any;
    secret: string;
    raw?: boolean;
  };

}

declare interface Vault {

  [credentialsName: string]: {
    email?: string;
    password?: string;
    username?: string;
    url?: string;
    other?: string[];
  };

}
