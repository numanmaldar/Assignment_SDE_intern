const { generateId } = require('../utils/idGenerator');

class Sale {
    constructor(userId, brand, earning) {
        this.saleId = generateId('sale');
        this.userId = userId;
        this.brand = brand;
        this.status = 'pending';
        this.earning = earning;
        this.advancePaid = 0;
    }
}

module.exports = Sale;