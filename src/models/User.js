class User {
    constructor(userId) {
        this.userId = userId;
        this.balance = 0;
        this.lastWithdrawalTime = null;
    }
}

module.exports = User;