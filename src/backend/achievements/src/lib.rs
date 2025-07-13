use candid::{CandidType, Deserialize, Principal};
use ic_cdk::{caller, query, update};
use ic_stable_structures::{BoundedStorable, DefaultMemoryImpl, StableBTreeMap, Storable};
use ic_stable_structures::storable::Blob;
use serde::{Deserialize as SerdeDeserialize, Serialize as SerdeSerialize};
use std::borrow::Cow;

#[derive(CandidType, Deserialize, Clone, SerdeSerialize)]
pub struct AchievementData {
    pub user_id: String,
    pub achievement_id: String,
    pub achievement_name: String,
    pub required_visits: u32,
    pub current_visits: u32,
    pub timestamp: String,
    pub wallet_address: String,
}

#[derive(CandidType, Deserialize, Clone, SerdeSerialize)]
pub struct AchievementMetadata {
    pub name: String,
    pub symbol: String,
    pub description: String,
    pub image: String,
    pub attributes: Vec<Attribute>,
}

#[derive(CandidType, Deserialize, Clone, SerdeSerialize)]
pub struct Attribute {
    pub trait_type: String,
    pub value: String,
}

#[derive(CandidType, Deserialize, Clone, SerdeSerialize)]
pub struct MintingRequest {
    pub achievement_data: AchievementData,
    pub metadata: AchievementMetadata,
}

#[derive(CandidType, Deserialize, Clone, SerdeSerialize)]
pub struct MintingResponse {
    pub success: bool,
    pub token_mint: Option<String>,
    pub transaction_signature: Option<String>,
    pub error: Option<String>,
}

// Stable storage types
#[derive(CandidType, Deserialize, Clone, SerdeSerialize)]
pub struct StoredAchievement {
    pub achievement_id: String,
    pub user_id: String,
    pub unlocked_at: String,
    pub verified: bool,
}

impl Storable for StoredAchievement {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }
}

impl BoundedStorable for StoredAchievement {
    const MAX_SIZE: u32 = 1024;
    const IS_FIXED_SIZE: bool = false;
}

// Global state
static mut ACHIEVEMENTS: Option<StableBTreeMap<Blob<64>, StoredAchievement, DefaultMemoryImpl>> = None;

fn str_to_blob64(s: &str) -> Blob<64> {
    let mut bytes = [0u8; 64];
    let s_bytes = s.as_bytes();
    let len = s_bytes.len().min(64);
    bytes[..len].copy_from_slice(&s_bytes[..len]);
    Blob::<64>::try_from(&bytes[..]).unwrap()
}

fn get_achievements() -> &'static mut StableBTreeMap<Blob<64>, StoredAchievement, DefaultMemoryImpl> {
    unsafe {
        if ACHIEVEMENTS.is_none() {
            ACHIEVEMENTS = Some(StableBTreeMap::new(DefaultMemoryImpl::default()));
        }
        ACHIEVEMENTS.as_mut().unwrap()
    }
}

#[ic_cdk::init]
fn init() {
    // Initialize canister
}

#[update]
fn validate_achievement(achievement_data: AchievementData) -> bool {
    // Validate achievement criteria
    if achievement_data.current_visits < achievement_data.required_visits {
        return false;
    }

    // Check if achievement already exists for this user
    let achievements = get_achievements();
    let key = str_to_blob64(&format!("{}:{}", achievement_data.user_id, achievement_data.achievement_id));
    
    if achievements.contains_key(&key) {
        return false; // Achievement already unlocked
    }

    // Store the achievement
    let stored_achievement = StoredAchievement {
        achievement_id: achievement_data.achievement_id.clone(),
        user_id: achievement_data.user_id.clone(),
        unlocked_at: achievement_data.timestamp.clone(),
        verified: true,
    };

    achievements.insert(key, stored_achievement);
    true
}

#[update]
fn request_solana_minting(request: MintingRequest) -> MintingResponse {
    // Validate the achievement first
    if !validate_achievement(request.achievement_data.clone()) {
        return MintingResponse {
            success: false,
            token_mint: None,
            transaction_signature: None,
            error: Some("Achievement validation failed".to_string()),
        };
    }

    // Mock Solana minting response
    // In production, this would call the SOL RPC Canister
    let token_mint = format!("achievement_{}_{}", 
        request.achievement_data.achievement_id, 
        ic_cdk::api::time()
    );
    
    let tx_signature = format!("mock_icp_tx_{}", ic_cdk::api::time());

    MintingResponse {
        success: true,
        token_mint: Some(token_mint),
        transaction_signature: Some(tx_signature),
        error: None,
    }
}

#[query]
fn get_user_achievements(user_id: String) -> Vec<StoredAchievement> {
    let achievements = get_achievements();
    let prefix = str_to_blob64(&format!("{}:", user_id));
    achievements
        .iter()
        .filter(|(key, _)| key.as_slice().starts_with(prefix.as_slice()))
        .map(|(_, achievement)| achievement.clone())
        .collect()
}

#[query]
fn get_achievement_history(user_id: String) -> Vec<AchievementData> {
    let achievements = get_achievements();
    let prefix = str_to_blob64(&format!("{}:", user_id));
    achievements
        .iter()
        .filter(|(key, _)| key.as_slice().starts_with(prefix.as_slice()))
        .map(|(_, achievement)| {
            AchievementData {
                user_id: achievement.user_id.clone(),
                achievement_id: achievement.achievement_id.clone(),
                achievement_name: "Achievement".to_string(), // Would be stored in production
                required_visits: 0, // Would be stored in production
                current_visits: 0, // Would be stored in production
                timestamp: achievement.unlocked_at.clone(),
                wallet_address: "".to_string(), // Would be stored in production
            }
        })
        .collect()
} 