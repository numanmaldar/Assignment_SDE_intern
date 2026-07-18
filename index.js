const PayoutSystem = require('./src/services/PayoutSystem');

/**
 * A helper function to log the state of the system.
 * @param {PayoutSystem} system The payout system instance.
 */
function printSystemState(system) {
    console.log('\n--- Current System State ---');
    console.log('Users:', JSON.stringify(Array.from(system.users.values()), null, 2));
    console.log('Sales:', JSON.stringify(Array.from(system.sales.values()), null, 2));
    console.log('Transactions:', JSON.stringify(Array.from(system.transactions.values()), null, 2));
    console.log('--------------------------\n');
}

/**
 * Runs a command-line demo of the PayoutSystem.
 */
function runDemo() {
    console.log('🚀 Starting Payout System Demo 🚀\n');

    const system = new PayoutSystem();

    // --- Step 1: Add Users and Sales ---
    console.log('--- Step 1: Adding sales for two users (user1, user2) ---');
    const saleId1 = system.addSale('user1', 'BrandA', 1000); // user1 makes a sale
    const saleId2 = system.addSale('user2', 'BrandB', 500);  // user2 makes a sale
    const saleId3 = system.addSale('user1', 'BrandC', 2000); // user1 makes another sale
    console.log(`Added Sale 1: ${saleId1} (user1, earning: 1000)`);
    console.log(`Added Sale 2: ${saleId2} (user2, earning: 500)`);
    console.log(`Added Sale 3: ${saleId3} (user1, earning: 2000)`);
    printSystemState(system);

    // --- Step 2: Process Advance Payouts ---
    console.log('--- Step 2: Processing advance payouts for all pending sales ---');
    const totalAdvanced = system.processAdvancePayouts();
    console.log(`Total amount advanced: $${totalAdvanced}`);
    console.log('user1 should have a balance of $300 (10% of 1000 + 10% of 2000).');
    console.log('user2 should have a balance of $50 (10% of 500).');
    printSystemState(system);

    // --- Step 3: Try to process advances again (should do nothing) ---
    console.log('--- Step 3: Trying to process advances again (no change expected) ---');
    const secondAdvance = system.processAdvancePayouts();
    console.log(`Total amount advanced in second run: $${secondAdvance}`);
    printSystemState(system);

    // --- Step 4: Reconcile Sales ---
    console.log('--- Step 4: Reconciling sales ---');
    // Approve user1's first sale
    const adjustment1 = system.reconcileSale(saleId1, 'approved');
    console.log(`Sale ${saleId1} approved. User1 balance adjusted by: $${adjustment1}`);
    console.log('user1 balance should now be $300 + $900 = $1200');

    // Reject user2's sale
    const adjustment2 = system.reconcileSale(saleId2, 'rejected');
    console.log(`Sale ${saleId2} rejected. User2 balance adjusted by: $${adjustment2}`);
    console.log('user2 balance should now be $50 - $50 = $0');
    printSystemState(system);

    // --- Step 5: User1 requests a withdrawal ---
    console.log("--- Step 5: User1 requests to withdraw $1100 ---");
    try {
        const withdrawalTxId = system.requestWithdrawal('user1', 1100);
        console.log(`Withdrawal request for user1 successful. Transaction ID: ${withdrawalTxId}`);
        console.log('user1 balance should now be $1200 - $1100 = $100');
    } catch (error) {
        console.error('Withdrawal failed:', error.message);
    }
    printSystemState(system);

    // --- Step 6: User1 tries to withdraw again immediately (should fail) ---
    console.log("--- Step 6: User1 tries to withdraw again (should fail due to 24-hour lock) ---");
    try {
        system.requestWithdrawal('user1', 50);
    } catch (error) {
        console.error('Withdrawal failed as expected:', error.message);
    }
    printSystemState(system);

    // --- Step 7: User2 tries to withdraw with insufficient balance (should fail) ---
    console.log("--- Step 7: User2 tries to withdraw $10 (should fail due to insufficient balance) ---");
    try {
        system.requestWithdrawal('user2', 10);
    } catch (error) {
        console.error('Withdrawal failed as expected:', error.message);
    }
    printSystemState(system);

    // --- Step 8: Handle a failed withdrawal ---
    console.log("--- Step 8: Simulate a failed withdrawal for user1, refunding the amount ---");
    const pendingTx = Array.from(system.transactions.values()).find(tx => tx.type === 'withdrawal' && tx.status === 'pending');
    if (pendingTx) {
        const message = system.handleWithdrawalResult(pendingTx.txId, 'failed');
        console.log(message);
        console.log('user1 balance should be restored to $100 + $1100 = $1200');
    }
    printSystemState(system);

    // --- Step 9: User1 withdraws again after failure (should succeed) ---
    console.log("--- Step 9: User1 tries to withdraw again after the lock is cleared ---");
    try {
        const newWithdrawalTxId = system.requestWithdrawal('user1', 1200);
        console.log(`Withdrawal request for user1 successful. Transaction ID: ${newWithdrawalTxId}`);
        console.log('user1 balance should now be $1200 - $1200 = $0');
        // Let's complete this one
        system.handleWithdrawalResult(newWithdrawalTxId, 'completed');
        console.log('Withdrawal transaction marked as completed.');
    } catch (error) {
        console.error('Withdrawal failed:', error.message);
    }
    printSystemState(system);

    console.log('Demo Finished!');
}

// Run the demo
runDemo();