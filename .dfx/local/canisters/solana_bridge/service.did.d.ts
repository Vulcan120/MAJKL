import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface AchievementMintingRequest {
  'user_wallet' : string,
  'metadata_uri' : string,
  'achievement_id' : string,
}
export interface SolanaResponse {
  'signature' : [] | [string],
  'error' : [] | [string],
  'success' : boolean,
}
export interface SolanaTransaction {
  'recent_blockhash' : string,
  'fee_payer' : string,
  'instruction' : Uint8Array | number[],
}
export interface _SERVICE {
  'get_solana_account_info' : ActorMethod<
    [string],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'get_solana_balance' : ActorMethod<
    [string],
    { 'Ok' : bigint } |
      { 'Err' : string }
  >,
  'mint_achievement_token' : ActorMethod<
    [AchievementMintingRequest],
    SolanaResponse
  >,
  'send_solana_transaction' : ActorMethod<[SolanaTransaction], SolanaResponse>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
