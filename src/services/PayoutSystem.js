const User = require('../models/User');
const Sale = require('../models/Sale');
const Transaction = require('../models/Transaction');

class PayoutSystem {
    constructor() {
        this.users = new Map();
        this.sales = new Map();
        this.transactions = new Map();
    }

    // --- Utility Methods ---

    getUser(userId) {
        if (!this.users.has(userId)) {
            this.users.set(userId, new User(userId));
        }
        return this.users.get(userId);
    }

    // A version of getUser that does not create a new user.
    findUser(userId) {
        if (!this.users.has(userId)) {
            throw new Error(`User '${userId}' not found.`);
        }
        return this.users.get(userId);
    }

    getAllSales() {
        // Return an array of all sale objects
        return Array.from(this.sales.values());
    }

    getAllTransactions() {
        // Return an array of all transaction objects
        return Array.from(this.transactions.values());
    }
    // --- Core Business Logic ---

    addSale(userId, brand, earning) {
        this.getUser(userId); // Ensure user exists
        const sale = new Sale(userId, brand, earning);
        this.sales.set(sale.saleId, sale);
        return sale.saleId;
    }

    processAdvancePayouts() {
        let totalAdvanced = 0;
        let salesProcessed = 0;

        const pendingSales = Array.from(this.sales.values()).filter(s => s.status === 'pending' && s.advancePaid === 0);
        if (pendingSales.length === 0) return 0;

        for (const [saleId, sale] of this.sales.entries()) {
            if (sale.status === 'pending' && sale.advancePaid === 0) {
                const advanceAmount = sale.earning * 0.10; // 10%
                
                sale.advancePaid = advanceAmount;
                
                const user = this.getUser(sale.userId);
                user.balance += advanceAmount;

                const tx = new Transaction(sale.userId, 'advance', advanceAmount, 'completed');
                this.transactions.set(tx.txId, tx);

                totalAdvanced += advanceAmount;
                salesProcessed++;
            }
        }
        return totalAdvanced;
    }

    reconcileSale(saleId, newStatus) {
        const sale = this.sales.get(saleId);
        if (!sale) throw new Error(`Sale '${saleId}' not found.`);
        if (sale.status !== 'pending') throw new Error(`Sale '${saleId}' is already reconciled with status '${sale.status}'.`);

        const user = this.getUser(sale.userId);
        let adjustmentAmount = 0;

        if (newStatus === 'approved') {
            adjustmentAmount = sale.earning - sale.advancePaid;
        } else if (newStatus === 'rejected') {
            adjustmentAmount = 0 - sale.advancePaid;
        } else {
            throw new Error("Invalid reconciliation status.");
        }

        sale.status = newStatus;
        user.balance += adjustmentAmount;

        const tx = new Transaction(sale.userId, 'reconciliation', adjustmentAmount, 'completed');
        this.transactions.set(tx.txId, tx);

        return adjustmentAmount;
    }

    requestWithdrawal(userId, amount) {
        const user = this.findUser(userId); // Use findUser to ensure user exists

        if (user.balance < amount) {
            throw new Error("Insufficient balance.");
        }

        const now = new Date();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        if (user.lastWithdrawalTime && (now - user.lastWithdrawalTime) < TWENTY_FOUR_HOURS) {
            throw new Error("Withdrawal restricted: You can only withdraw once every 24 hours.");
        }

        user.balance -= amount;
        user.lastWithdrawalTime = now;

        const tx = new Transaction(userId, 'withdrawal', amount, 'pending');
        tx.timestamp = now; // Override with exact time of withdrawal
        this.transactions.set(tx.txId, tx);

        return tx.txId;
    }

    handleWithdrawalResult(txId, finalStatus) {
        const tx = this.transactions.get(txId);
        if (!tx || tx.type !== 'withdrawal' || tx.status !== 'pending') throw new Error(`Transaction '${txId}' is not a pending withdrawal.`);

        if (finalStatus === 'failed' || finalStatus === 'cancelled' || finalStatus === 'rejected') {
            const user = this.getUser(tx.userId);
            
            // Credit amount back
            user.balance += tx.amount;
            
            // Clear the 24-hour lock to allow immediate retry
            user.lastWithdrawalTime = null; 
            
            tx.status = 'failed';
            return "Withdrawal failed. Funds refunded and lock cleared.";
        } else if (finalStatus === 'completed') {
            tx.status = 'completed';
            return "Withdrawal successful.";
        }
    }
}

module.exports = PayoutSystem;