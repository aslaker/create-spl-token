import { initializeKeypair } from "./initializeKeypair";
import * as web3 from "@solana/web3.js";
import {
  bundlrStorage,
  keypairIdentity,
  Metaplex,
} from "@metaplex-foundation/js";
import { buildMintInstructions } from "./helpers";

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
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);

  console.log("PublicKey:", user.publicKey.toBase58());

  const mintInstructions = await buildMintInstructions({
    connection,
    payer: user,
    decimals: 2,
    mintAuthority: user.publicKey,
    freezeAuthority: user.publicKey,
  });

  

  console.log(mintInstructions);

  // const metaplex = Metaplex.make(connection)
  // .use(keypairIdentity(user))
  // .use(
  //   bundlrStorage({
  //     address: "https://devnet.bundlr.network",
  //     providerUrl: "https://api.devnet.solana.com",
  //     timeout: 60000,
  //   })
  // );
}
