const express = require('express');
const path = require('path');
const PayoutSystem = require('./services/PayoutSystem');

// --- Application Setup ---
const app = express();
const port = 3000;

// --- Middleware ---
// Serve static files (like index.html) from the current directory ('src')
app.use(express.static(__dirname));

// Parse JSON bodies for API requests
app.use(express.json());

// Create a single, shared instance of the PayoutSystem
const system = new PayoutSystem();

// --- API Endpoints ---

// A simple endpoint to get a user's status
app.get('/users/:userId', (req, res) => {
    const { userId } = req.params;
    try {
        // Use findUser to prevent creating a new user on a simple GET request
        const user = system.findUser(userId);
        res.json(user);
    } catch (error) {
        // This might happen if findUser was used and the user doesn't exist.
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'An unexpected error occurred while fetching user data.' });
    }
});

// Endpoint to get a list of all sales
app.get('/sales', (req, res) => {
    const sales = system.getAllSales();
    res.json(sales);
});

// Endpoint to get a list of all transactions
app.get('/transactions', (req, res) => {
    const transactions = system.getAllTransactions();
    res.json(transactions);
});

// Endpoint to add a sale manually
app.post('/sales', (req, res) => {
    try {
        const { userId, brand, earning } = req.body;
        if (!userId || !brand || typeof earning !== 'number') {
            return res.status(400).json({ error: 'Missing or invalid fields: userId, brand, and earning (as a number) are required.' });
        }
        const saleId = system.addSale(userId, brand, earning);
        res.status(201).json({ message: 'Sale added successfully', saleId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint to trigger the advance payout job
app.post('/payouts/advance', (req, res) => {
    try {
        const totalAdvanced = system.processAdvancePayouts();
        res.json({ message: 'Advance payout job completed.', totalAdvanced });
    } catch (error) {
        res.status(500).json({ error: `An unexpected error occurred: ${error.message}` });
    }
});

// Endpoint to reconcile a sale
app.post('/sales/:saleId/reconcile', (req, res) => {
    try {
        const { saleId } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: "Field 'status' must be 'approved' or 'rejected'." });
        }

        const adjustment = system.reconcileSale(saleId, status);
        res.json({ message: `Sale ${saleId} reconciled as ${status}.`, adjustment });
    } catch (error) {
        // Handle specific errors from the service layer with appropriate status codes
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('already reconciled')) {
            return res.status(409).json({ error: error.message }); // 409 Conflict
        }
        res.status(400).json({ error: error.message });
    }
});

// Endpoint to request a withdrawal
app.post('/users/:userId/withdraw', (req, res) => {
    try {
        const { userId } = req.params;
        const { amount } = req.body;

        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: 'A valid withdrawal amount is required.' });
        }
        const txId = system.requestWithdrawal(userId, amount);
        res.status(202).json({ message: 'Withdrawal request accepted.', transactionId: txId });
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(400).json({ error: error.message });
    }
});

// Endpoint to process a withdrawal (the missing piece)
app.post('/transactions/:txId/process', (req, res) => {
    try {
        const { txId } = req.params;
        const { finalStatus } = req.body; // 'completed' or 'failed'

        if (!finalStatus || !['completed', 'failed'].includes(finalStatus)) {
            return res.status(400).json({ error: "Field 'finalStatus' must be 'completed' or 'failed'." });
        }

        const message = system.handleWithdrawalResult(txId, finalStatus);
        res.json({ message });
    } catch (error) {
        if (error.message.includes('not a pending withdrawal')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(400).json({ error: error.message });
    }
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`Payout system server listening at http://localhost:${port}`);
});