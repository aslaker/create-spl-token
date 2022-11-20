import {
  Account,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

export async function buildTokenAccountTxn({
  connection,
  mintPublickey,
  ownerPublicKey,
}: {
  connection: Connection;
  mintPublickey: PublicKey;
  ownerPublicKey: PublicKey;
}) {
  const tokenATA = await getAssociatedTokenAddress(
    mintPublickey,
    ownerPublicKey
  );

  let tokenInstructionData: {
    associatedTokenAccount: PublicKey;
    instruction: TransactionInstruction | null;
  } = { associatedTokenAccount: tokenATA, instruction: null };

  try {
    await getAccount(connection, tokenATA);
    return tokenInstructionData;
  } catch (error: unknown) {
    if (
      error instanceof TokenAccountNotFoundError ||
      error instanceof TokenInvalidAccountOwnerError
    ) {
      const createTokenAccountInstruction =
        createAssociatedTokenAccountInstruction(
          ownerPublicKey, // payer
          tokenATA, // token address
          ownerPublicKey, // token owner
          mintPublickey // token mint
        );
      tokenInstructionData.instruction = createTokenAccountInstruction;
      return tokenInstructionData;
    } else {
      throw error;
    }
  }
}
