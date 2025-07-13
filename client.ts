import * as anchor from '@project-serum/anchor';
import { Connection, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { Token, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import idl from './target/idl/phantomfog.json';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

// Devnet RPC endpoint
const SOLANA_RPC_ENDPOINT = 'https://api.devnet.solana.com';

/**
 * Clears a station by ID, logs the visit on-chain, and mints chips to the user.
 * @param stationId   Numeric station identifier
 * @param programId   Deployed PhantomFog program ID
 * @param chipMint    PublicKey of the SPL token mint for chips
 * @param configPDA   PDA for global config (holds chips_per_station)
 */
export async function clearStation(
  stationId: number,
  programId: PublicKey,
  chipMint: PublicKey,
  configPDA: PublicKey,
) {
  // 1. Establish connection
  const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');

  // 2. Connect Phantom Wallet
  const wallet = new PhantomWalletAdapter();
  await wallet.connect();

  // 3. Create Anchor provider
  const provider = new anchor.AnchorProvider(
    connection,
    wallet as unknown as anchor.Wallet,
    anchor.AnchorProvider.defaultOptions(),
  );
  anchor.setProvider(provider);

  // 4. Instantiate the program
  const program = new anchor.Program(idl as anchor.Idl, programId, provider);

  // 5. Derive the mint authority PDA
  const [mintAuthorityPDA] = await PublicKey.findProgramAddress(
    [Buffer.from('mint-authority'), program.programId.toBuffer()],
    program.programId
  );

  // 6. Derive the station log PDA
  const stationSeed = Buffer.from(new Uint8Array(new Uint16Array([stationId]).buffer));
  const [stationLogPDA] = await PublicKey.findProgramAddress(
    [Buffer.from('station-log'), provider.wallet.publicKey.toBuffer(), stationSeed],
    program.programId
  );

  // 7. Get or create the user's associated token account for chips
  const userChipAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    chipMint,
    provider.wallet.publicKey,
  );

  // 8. Send the transaction
  const txSignature = await program.rpc.clearStation(stationId, {
    accounts: {
      stationLog: stationLogPDA,
      user: provider.wallet.publicKey,
      mintAuthority: mintAuthorityPDA,
      chipMint,
      userChipAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
      config: configPDA,
    },
  });

  console.log('Transaction successful with signature:', txSignature);
  return txSignature;
}

// ------- Example Invocation -------
(async () => {
  // Read from environment or config
  const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);
  const chipMint = new PublicKey(process.env.NEXT_PUBLIC_CHIP_MINT!);

  // Derive the config PDA
  const [configPDA] = await PublicKey.findProgramAddress(
    [Buffer.from('config')],
    programId
  );

  // Clear station 5
  try {
    const signature = await clearStation(5, programId, chipMint, configPDA);
    console.log('✅ Cleared station 5, signature:', signature);
  } catch (err) {
    console.error('❌ Error clearing station:', err);
  }
})();
