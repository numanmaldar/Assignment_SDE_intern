const { generateId } = require('../utils/idGenerator');

class Transaction {
    constructor(userId, type, amount, status) {
        this.txId = generateId('tx');
        this.userId = userId;
        this.type = type; // 'advance', 'reconciliation', 'withdrawal'
        this.amount = amount;
        this.status = status; // 'pending', 'completed', 'failed', 'cancelled'
        this.timestamp = new Date();
    }
}

module.exports = Transaction;