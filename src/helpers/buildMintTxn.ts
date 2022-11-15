import {
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
} from "@solana/spl-token";
import {
  Keypair,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { CreateMintArgs } from "./types";

export async function buildMintInstructions({
  connection,
  payer,
  decimals,
  mintAuthority,
  freezeAuthority,
}: CreateMintArgs) {
  const mintKeypair = Keypair.generate();
  const lamports = await getMinimumBalanceForRentExemptMint(connection);

  const mintInstructions: TransactionInstruction[] = [
    new TransactionInstruction(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      })
    ),
    new TransactionInstruction(
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        decimals,
        mintAuthority,
        freezeAuthority,
        TOKEN_PROGRAM_ID
      )
    ),
  ];
  return mintInstructions;
}
