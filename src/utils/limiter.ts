import rateLimit from "express-rate-limit";
/*
    1. Har user/IP ke liye ek bucket banao.

    2. Bucket ke andar:
        tokens = capacity (start full)
        lastRefillTime = abhi ka time

    3. Jab request aaye:
        Step A: Check karo last time se kitna time beet gaya
        Step B: Utne tokens refill karo (elapsed * refillRate)
        Step C: Agar tokens >= 1 → ek token ghatao, allow request
        Step D: Agar tokens < 1 → reject
*/
export class TokenBucket {
    private capacity: number;
    private tokens: number;
    private refillRate: number; //token per second
    private lastRefill: number;

    constructor(capacity: number, refillRate: number) {
        this.capacity = capacity;
        this.tokens = capacity; // buckets start full
        this.refillRate = refillRate;
        this.lastRefill = Date.now(); //store current timestamps
    }

    private refill() {
        const now = Date.now();
        const elapsedSeconds = (now - this.lastRefill) / 1000;

        const refillToken = elapsedSeconds * this.refillRate;
        this.tokens = Math.min(this.capacity, this.tokens + refillToken);
        this.lastRefill = now;
    }

    public allowRequest() {
        this.refill();

        if (this.tokens >= 1) {
            this.tokens -= 1;
            return true;
        }
        return false;
    }
}