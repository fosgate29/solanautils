const {
  Connection,
  PublicKey,
  Keypair
} = require("@solana/web3.js");
const Metaplex = require('@metaplex/js');
const bs58 = require('bs58');
const{ burn, getMint, TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount } = require("@solana/spl-token");

const burnNft = async () => {

  // Fazer a conexão com a rede Solana. Pra mainet, usar "mainnet-beta".
	const network = "devnet";
  const connection = new Metaplex.Connection(network);
  const recentBlock = await connection.getEpochInfo();
  //console.log(recentBlock);  //just to test if it is connected to the network
  console.log(" ** Connected to " + network);

  // Aqui é o "mintHash". https://solscan.io/token/CLbFcdkdcWW7VjUoYh8miqWgH7yAwJbD7Tb1GwdvUQwU?cluster=devnet
  // É o token que vai ser "burned"
	// pra fazer o burn, é só atualizar este valor (mintHash). Ah, que seja da "fromWallet"
  const mintHash = new PublicKey("G18tt9MARbbg5UXCBhNqK7GhzXACjDhY3fn9Jmq48bTY");  //onde vejo o token
  console.log("NFT mintHash to burn: ", mintHash.toString(10));

  // wallet que é a dona do token e que vai fazer o burn do NFT. É a wallet que gastou os 200 solanas pra mintar os 16.800 nfts
  // o Secret é pra poder enviar a tx de burn. Pegar ela do Secrets Manager, por exemplo, pra não ficar fixo no código
  // esta private key é possível exportar pelo Phantom
  const fromWallet = Keypair.fromSecretKey(
    bs58.decode("5M9dGvE6uMETcK2nPBw1YtemVb9dypuZUt3kEDXbHxErk9Ca3pqm9FcKdYNjKNLQMyvrYwrHDvSvpgtJbGfTb4bV")
  );
  console.log("fromWallet publicKey: ", fromWallet.publicKey);
  //console.log("fromWallet: ", bs58.encode(fromWallet.Keypair.publicKey));

  // Objeto que tem detalhes do NFT
  const mintAccount = await getMint(connection, mintHash, TOKEN_PROGRAM_ID);
  console.log("mintAccount: ", mintAccount);

  // Get the token account of the fromWallet address, and if it does not exist, create it. 
  // É a "token account" que é a dona do token. É estranho, mas é assim.
  // A wallet dona do NFT é a dona (owner) desta Token Account. Wallet -> Token Account -> NFT
  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    fromWallet,
    mintAccount.address,
    fromWallet.publicKey
  );

	// Realiza o burn
	// comentado a parte do burn porque é perigoso. se por acaso usar a wallet de prod,
	// faz o burn e não tem volta. Já era.
	/*const signature = await burn(
    connection,
    fromWallet,  //fee payer - tem que ter SOL pra conseguir executar o burn
    fromTokenAccount.address,
    mintHash,
    fromWallet.publicKey,
		1);*/

   console.log(" *** BURNED");
}

module.exports = {
  burnNft
};

burnNft();
