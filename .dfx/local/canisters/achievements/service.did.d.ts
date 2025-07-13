import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface AchievementData {
  'wallet_address' : string,
  'required_visits' : number,
  'user_id' : string,
  'achievement_name' : string,
  'current_visits' : number,
  'timestamp' : string,
  'achievement_id' : string,
}
export interface AchievementMetadata {
  'name' : string,
  'description' : string,
  'attributes' : Array<Attribute>,
  'image' : string,
  'symbol' : string,
}
export interface Attribute { 'trait_type' : string, 'value' : string }
export interface MintingRequest {
  'metadata' : AchievementMetadata,
  'achievement_data' : AchievementData,
}
export interface MintingResponse {
  'error' : [] | [string],
  'success' : boolean,
  'token_mint' : [] | [string],
  'transaction_signature' : [] | [string],
}
export interface StoredAchievement {
  'verified' : boolean,
  'user_id' : string,
  'unlocked_at' : string,
  'achievement_id' : string,
}
export interface _SERVICE {
  'get_achievement_history' : ActorMethod<[string], Array<AchievementData>>,
  'get_user_achievements' : ActorMethod<[string], Array<StoredAchievement>>,
  'request_solana_minting' : ActorMethod<[MintingRequest], MintingResponse>,
  'validate_achievement' : ActorMethod<[AchievementData], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
