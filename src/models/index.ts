export interface Wallet {
    wallet_address: string;
    kin_balance: number;
    native_balance: number;
    id?: string;
}

export interface CreateWalletRequest {
    wallet_address: string;
    app_id: string;
    id: string;
    callback: string;
}