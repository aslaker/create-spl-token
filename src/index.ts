import { initializeKeypair } from "./initializeKeypair";
import * as web3 from "@solana/web3.js";
import {
  bundlrStorage,
  keypairIdentity,
  Metaplex,
} from "@metaplex-foundation/js";
import {
  buildMintInstructions,
  buildTokenAccountTxn,
  buildTokenMetadataInstructions,
} from "./helpers";
import invariant from "tiny-invariant";
import { createMintToInstruction } from "@solana/spl-token";

const AMOUNT = 1;
const DECIMALS = 2;

main()
  .then(() => {
    console.log("Finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

async function main() {
  invariant(process.env.TOKEN_NAME, "Must set TOKEN_NAME in environment");
  invariant(process.env.TOKEN_SYMBOL, "Must set TOKEN_SYMBOL in environment");
  invariant(
    process.env.TOKEN_DESCRIPTION,
    "Must set TOKEN_DESCRIPTION in environment"
  );
  invariant(
    process.env.TOKEN_IMAGE_FILE_LOCATION,
    "Must set TOKEN_IMAGE_FILE_LOCATION in environment"
  );
  invariant(
    process.env.TOKEN_IMAGE_NAME,
    "Must set TOKEN_IMAGE_NAME in environment"
  );

  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);

  console.log("PublicKey:", user.publicKey.toBase58());

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      })
    );

  const transaction = new web3.Transaction();

  const { mintInstructions, mintKeypair } = await buildMintInstructions({
    connection,
    payer: user,
    decimals: 2,
    mintAuthority: user.publicKey,
    freezeAuthority: user.publicKey,
  });

  mintInstructions.forEach((instruction) => {
    transaction.add(instruction);
  });

  const createTokenDataInstructions = await buildTokenMetadataInstructions({
    metaplex,
    mint: mintKeypair.publicKey,
    user,
    name: process.env.TOKEN_NAME,
    symbol: process.env.TOKEN_SYMBOL,
    description: process.env.TOKEN_DESCRIPTION,
    image: {
      fileLocation: process.env.TOKEN_IMAGE_FILE_LOCATION,
      name: process.env.TOKEN_IMAGE_NAME,
    },
  });

  createTokenDataInstructions.forEach((instruction) => {
    transaction.add(instruction);
  });

  const { associatedTokenAccount, instruction } = await buildTokenAccountTxn({
    connection,
    mintPublickey: mintKeypair.publicKey,
    ownerPublicKey: user.publicKey,
  });

  if (instruction !== null) {
    transaction.add(instruction);
  }

  const mintToInstruction = await createMintToInstruction(
    mintKeypair.publicKey,
    associatedTokenAccount,
    user.publicKey,
    AMOUNT * Math.pow(10, DECIMALS)
  );
  transaction.add(mintToInstruction);

  const signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [user, mintKeypair]
  );

  console.log({
    user: user.publicKey.toBase58(),
    transaction: `SPL Launch Txn: https://explorer.solana.com/tx/${signature}?cluster=devnet`,
  });
}
