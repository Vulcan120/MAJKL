export const idlFactory = ({ IDL }) => {
  const AchievementMintingRequest = IDL.Record({
    'user_wallet' : IDL.Text,
    'metadata_uri' : IDL.Text,
    'achievement_id' : IDL.Text,
  });
  const SolanaResponse = IDL.Record({
    'signature' : IDL.Opt(IDL.Text),
    'error' : IDL.Opt(IDL.Text),
    'success' : IDL.Bool,
  });
  const SolanaTransaction = IDL.Record({
    'recent_blockhash' : IDL.Text,
    'fee_payer' : IDL.Text,
    'instruction' : IDL.Vec(IDL.Nat8),
  });
  return IDL.Service({
    'get_solana_account_info' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        ['query'],
      ),
    'get_solana_balance' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text })],
        ['query'],
      ),
    'mint_achievement_token' : IDL.Func(
        [AchievementMintingRequest],
        [SolanaResponse],
        [],
      ),
    'send_solana_transaction' : IDL.Func(
        [SolanaTransaction],
        [SolanaResponse],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
