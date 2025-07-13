export const idlFactory = ({ IDL }) => {
  const AchievementData = IDL.Record({
    'wallet_address' : IDL.Text,
    'required_visits' : IDL.Nat32,
    'user_id' : IDL.Text,
    'achievement_name' : IDL.Text,
    'current_visits' : IDL.Nat32,
    'timestamp' : IDL.Text,
    'achievement_id' : IDL.Text,
  });
  const StoredAchievement = IDL.Record({
    'verified' : IDL.Bool,
    'user_id' : IDL.Text,
    'unlocked_at' : IDL.Text,
    'achievement_id' : IDL.Text,
  });
  const Attribute = IDL.Record({ 'trait_type' : IDL.Text, 'value' : IDL.Text });
  const AchievementMetadata = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Text,
    'attributes' : IDL.Vec(Attribute),
    'image' : IDL.Text,
    'symbol' : IDL.Text,
  });
  const MintingRequest = IDL.Record({
    'metadata' : AchievementMetadata,
    'achievement_data' : AchievementData,
  });
  const MintingResponse = IDL.Record({
    'error' : IDL.Opt(IDL.Text),
    'success' : IDL.Bool,
    'token_mint' : IDL.Opt(IDL.Text),
    'transaction_signature' : IDL.Opt(IDL.Text),
  });
  return IDL.Service({
    'get_achievement_history' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(AchievementData)],
        ['query'],
      ),
    'get_user_achievements' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(StoredAchievement)],
        ['query'],
      ),
    'request_solana_minting' : IDL.Func(
        [MintingRequest],
        [MintingResponse],
        [],
      ),
    'validate_achievement' : IDL.Func([AchievementData], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
