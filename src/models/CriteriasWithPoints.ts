// src/models/CriteriasWithPoints.ts

export interface CriteriasWithPoints {
  unique_key: string;
  credential_name: string;
  address: string;
  chain_value: string;
  category: string;
  description: string;
  onchain_usd_amount_score: number | null;
  wallet_holding_score: number | null;
  account_score: number | null;
}
