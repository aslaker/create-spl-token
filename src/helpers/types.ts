import { Connection, Keypair, PublicKey } from "@solana/web3.js";

interface SolanaWeb3Base {
  connection: Connection;
}

interface SolanaTxnBase extends SolanaWeb3Base {
  payer: Keypair;
}

interface SolanaTokenTxnBase extends SolanaTxnBase {
  mint: PublicKey;
}

export interface CreateMintArgs extends SolanaTxnBase {
  mintAuthority: PublicKey;
  freezeAuthority: PublicKey;
  decimals: number;
}

export interface CreateTokenAccountArgs extends SolanaTokenTxnBase {
  mint: PublicKey;
  owner: PublicKey;
}

export interface MintTokenArgs extends SolanaTokenTxnBase {
  destination: PublicKey;
  authority: Keypair;
  amount: number;
}

export interface TransferTokenArgs extends SolanaTokenTxnBase {
  source: PublicKey;
  destination: PublicKey;
  owner: PublicKey;
  amount: number;
}

export interface BurnTokenArgs extends SolanaTokenTxnBase {
  account: PublicKey;
  owner: PublicKey;
  amount: number;
}
