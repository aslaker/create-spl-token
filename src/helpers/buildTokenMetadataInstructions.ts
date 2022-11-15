import { Metaplex, toMetaplexFile } from "@metaplex-foundation/js";
import {
  DataV2,
  createCreateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  Keypair,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import * as fs from "fs";

export async function buildTokenMetadataInstructions({
  metaplex,
  mint,
  user,
  name,
  symbol,
  description,
  image,
}: {
  metaplex: Metaplex;
  image: {
    name: string;
    file: Buffer | string;
  };
  mint: PublicKey;
  user: Keypair;
  name: string;
  symbol: string;
  description: string;
}): Promise<TransactionInstruction[]> {
  let file;

  if (Buffer.isBuffer(image.file)) {
    file = toMetaplexFile(image.file, image.name);
  } else {
    const buffer = fs.readFileSync(image.file);
    file = toMetaplexFile(buffer, image.name);
  }

  const imageUri = await metaplex.storage().upload(file);

  console.log("image uri:", imageUri);

  const { uri } = await metaplex.nfts().uploadMetadata({
    name: name,
    description: description,
    image: imageUri,
  });

  console.log("metadata uri:", uri);

  const metadataPDA = await metaplex.nfts().pdas().metadata({ mint });

  const tokenMetadata = {
    name: name,
    symbol: symbol,
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  } as DataV2;

  const tokenMetadataInstructions: TransactionInstruction[] = [
    new TransactionInstruction(
      createCreateMetadataAccountV2Instruction(
        {
          metadata: metadataPDA,
          mint: mint,
          mintAuthority: user.publicKey,
          payer: user.publicKey,
          updateAuthority: user.publicKey,
        },
        {
          createMetadataAccountArgsV2: {
            data: tokenMetadata,
            isMutable: true,
          },
        }
      )
    ),
  ];

  return tokenMetadataInstructions;
}
