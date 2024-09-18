export interface QueryData {
  name: string;
  criteria_type: string;
  token: string;
  sql_query: string | null;
  contract_address: string | null;
  days_partition: number | null;
  description: string;
  chain: string[];
}
export interface Holding {
  name: string;
  criteria_type: string;
  token: string;
  address: string;
  balance: number | null;
  contract_address: string;
  description: string | null;
}
export interface OnChainActivity {
  name: string;
  token: string | null;
  description: string | null;
  address: string;
  nb_tx: number;
  amount: number;
  token_address: string;
  start_block: number;
  end_block: number;
  start_date: string; // Add startDate to the OnchainActivity interface
  end_date: string; // Add endDate to the OnchainActivity interface
}

export interface Token {
  contract_address: string;
  standard: string;
  supply: number;
  name: string;
  symbol: string;
  decimals: number;
  description: string;
  external_url: string;
  image_url: string;
  verified: boolean;
}
