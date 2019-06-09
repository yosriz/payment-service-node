export type ApiError = {
    code: number;
    error: string;
    message: string;
};

export type HeaderValue = number | string | string[];

export class ClientError extends Error {
    public readonly title: string;
    public readonly status: number; // http status code
    public readonly code: number; // our own internal codes
    public readonly headers: { [name: string]: HeaderValue };

    constructor(status: number, index: number, title: string, message: string) {
        super(message);
        this.code = Number(status + "" + index);
        this.title = title;
        this.status = status;
        this.headers = {};
    }

    public setHeader(name: string, value: HeaderValue) {
        this.headers[name] = value;
    }

    public toJson(): ApiError {
        return {
            code: this.code,
            error: this.title,
            message: this.message
        };
    }

    public toString(): string {
        return JSON.stringify(this.toJson());
    }
}

export class WalletNotFoundError extends ClientError {
    constructor(walletAddress: string) {
        super(404, 2, "No Such Wallet", `Wallet address: ${walletAddress} cannot be found.`);
    }
}

export class PaymentNotFoundError extends ClientError {
    constructor(paymentId: string) {
        super(404, 1, "No Such Payment", `payment ${paymentId} not found.`);
    }
}

export class PaymentAlreadyExistsError extends ClientError {
    constructor() {
        super(409, 1, "Payment Already Exists", `payment already exists.`);
    }
}

export class NoSuchServiceError extends ClientError {
    constructor(msg: string) {
        super(404, 3, "No Such Service", msg);
    }
}
