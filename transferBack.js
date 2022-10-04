const {
  Connection,
  PublicKey,
  Keypair
} = require("@solana/web3.js");
const Metaplex = require('@metaplex/js');
const bs58 = require('bs58');
const{ transfer, getMint, TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount } = require("@solana/spl-token");

const transferNft = async () => {

  // Fazer a conexão com a rede Solana. Pra mainet, usar "mainnet-beta".
  const connection = new Metaplex.Connection("devnet");
  const recentBlock = await connection.getEpochInfo();
  //console.log(recentBlock);  //just to test if it is connected to the network
  console.log(" ** Connected to DEVNET.");

  // Aqui é o "mintHash". https://solscan.io/token/CLbFcdkdcWW7VjUoYh8miqWgH7yAwJbD7Tb1GwdvUQwU?cluster=devnet
  // É o token que vai ser transferido
  const mintHash = new PublicKey("CLbFcdkdcWW7VjUoYh8miqWgH7yAwJbD7Tb1GwdvUQwU");  //onde vejo o token
  console.log("NFT mintHash to transfer: ", mintHash.toString(10));

  // wallet que é a dona do token e que vai transferir o token. É a wallet que gastou os 200 solanas pra mintar os 16.800 nfts
  // o Secret é pra poder enviar a tx de transfer. Pegar ela do Secrets Manager, por exemplo, pra não ficar fixo no código
  // esta private key é possível exportar pelo Phantom
  const fromWallet = Keypair.fromSecretKey(
    bs58.decode("4rnMfM8Q4kdQ97JvAQuoaj2nQYkUEbBCUoJzwTNCBM2bkxETt6oEAvx872rcrU98iYFw48Q53ngxDuWzLaiyvJJe")
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

  console.log("fromTokenAccount - ",fromTokenAccount.address.toString(10))

  // Wallet que vai receber o token. É a wallet que acessa o Phantom, por exemplo.
  // private key: 4rnMfM8Q4kdQ97JvAQuoaj2nQYkUEbBCUoJzwTNCBM2bkxETt6oEAvx872rcrU98iYFw48Q53ngxDuWzLaiyvJJe
  // com a private key você consegue instanciar a wallet no Phantom e transferir o token de exemplo pra carteira
  // 8mHijwLLqoZRAHSFiVSpv69ZNuvVH61ybBZxMAgihuhK. Transferindo de volta é só executar o exemplo novamente para
  // transferir o mesmo token.
  const toWallet = new PublicKey("8mHijwLLqoZRAHSFiVSpv69ZNuvVH61ybBZxMAgihuhK");
  console.log("towallet: ",toWallet);

  // Aqui cria a Token Account que vai receber o NFT. O dono desta Token Account é a wallet que vai ser o dono do NFT
  const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mintAccount.address, toWallet);

  console.log("toTokenAccount: ", toTokenAccount.address.toString(10))

  // aqui faz o transfer
  const amount = 1;  // 1 token apenas
  const signature = await transfer(
    connection,
    fromWallet,
    fromTokenAccount.address,
    toTokenAccount.address,
    fromWallet.publicKey,
    amount );

  console.log(" *** FIM");
}

module.exports = {
  transferNft
};

transferNft();
