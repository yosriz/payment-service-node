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

export interface Payment {
    id: string;
    app_id: string;
    transaction_id: string;
    recipient_address: string;
    sender_address: string;
    amount: number;
    timestamp: string;
}

export interface PaymentRequest {
    amount: number;
    app_id: string
    is_external: boolean;
    recipient_address: string;
    sender_address: string;
    id: string;
    callback: string;  //a webhook to call when a payment is complete
}

export interface AppSeeds {
    [appID: string]: { hot: string, warm: string };
}

export interface WhitelistRequest {
    order_id: string;
    source: string;
    destination: string;
    amount: number;
    xdr: string;
    network_id: string;
    app_id: string;
}

export interface WorkerJob {
    readonly type: "CreateWallet" | "SendPayment" | "PaymentCallback" | "WalletCreatedCallback";
    request: any;
}

export interface CreateWalletJob extends WorkerJob {
    readonly type: "CreateWallet";
    request: CreateWalletRequest;
}

export interface SendPaymentJob extends WorkerJob {
    readonly type: "SendPayment";
    request: PaymentRequest;
}

export interface PaymentCallbackJob extends WorkerJob {
    readonly type: "PaymentCallback";
    request: PaymentCallbackRequest;
}

export interface WalletCreatedCallbackJob extends WorkerJob {
    readonly type: "WalletCreatedCallback";
    request: CreateWalletCallbackRequest;
}

export type PaymentCallbackRequest = {
    callback: string,
    appId: string,
    readonly object: "payment";
    state: "success" | "fail";
    action: "send" | "receive";
    value: Payment | CallbackFail;
};

export type CallbackFail = {
    id: string;
    reason: string;
};

export type CreateWalletCallbackRequest = {
    callback: string,
    appId: string,
    readonly object: "wallet";
    state: "success" | "fail";
    readonly action: "create";
    value: Wallet | CallbackFail;
};
