# Payout Management System

This project is a Node.js-based simulation of a payout management system for sales affiliates. It includes logic for tracking sales, processing advance payments, reconciling sales statuses, and handling user withdrawals.
This project provides a comprehensive Low-Level Design (LLD) and working implementation for a user payout management system for affiliate sales, as per the assignment requirements.

The system is available in two forms:
1.  A command-line interface (CLI) demo to walk through the system's features.
2.  An Express.js web server that exposes the system's functionality via a REST API.

## Features
## 1. Low-Level Design (LLD)

- **User and Sale Management**: Add users and sales with associated earnings.
- **Advance Payouts**: Automatically process a 10% advance on pending sales.
- **Sale Reconciliation**: Approve or reject sales, adjusting user balances accordingly.
- **Withdrawal System**: Allow users to request withdrawals from their balance, with a 24-hour time lock between requests.
- **Transaction Logging**: Records all financial activities, including advances, reconciliations, and withdrawals.
The system is designed with a clear separation of concerns, broken down into three main layers:

## Prerequisites
1.  **Model Layer (`/src/models`)**: Defines the core data structures (entities) of the system: `User`, `Sale`, and `Transaction`. These classes encapsulate the properties and state of each entity.
2.  **Service Layer (`/src/services`)**: Contains the `PayoutSystem.js` class, which orchestrates all business logic. It acts as a single source of truth for all operations, ensuring that rules are applied consistently. It manages the state of all entities in-memory.
3.  **API/Interface Layer**:
    *   **Web API (`/src/index.js`)**: An Express.js server that exposes the service layer's functionality through a set of RESTful API endpoints. This allows external clients to interact with the system.
    *   **CLI Demo (`/index.js`)**: A command-line script that directly uses the `PayoutSystem` service to demonstrate the core features in a step-by-step, easy-to-follow manner.

- Node.js (v14 or later recommended)
- npm (comes with Node.js)
This layered architecture makes the system modular, easier to test, and maintain.

## Installation
## 2. Database Schema and Relationships

1.  Clone the repository or download the source code.
2.  Navigate to the project's root directory in your terminal.
3.  Install the required dependencies:
    ```bash
    npm install
    ```
For this implementation, the database is simulated in-memory using JavaScript `Map` objects within the `PayoutSystem` class. This approach is chosen for simplicity and to focus on the business logic, as per the LLD focus of the assignment.

## How to Run
### Entities (Schema)

### 1. Command-Line Demo
*   **User**:
    *   `userId` (String, Primary Key): Unique identifier for the user.
    *   `balance` (Number): The user's current withdrawable amount.
    *   `lastWithdrawalTime` (Date): Timestamp of the user's last withdrawal request, used for the 24-hour lock.

To see a step-by-step demonstration of the system's features, run the CLI demo script:
*   **Sale**:
    *   `saleId` (String, Primary Key): Unique identifier for the sale.
    *   `userId` (String, Foreign Key): The user who made the sale.
    *   `brand` (String): The brand associated with the sale.
    *   `earning` (Number): The total commission earned from the sale.
    *   `status` (String): The current status (`pending`, `approved`, `rejected`).
    *   `advancePaid` (Number): The amount paid as an advance for this sale.

```bash
node index.js
```
*   **Transaction**:
    *   `txId` (String, Primary Key): Unique identifier for the transaction.
    *   `userId` (String, Foreign Key): The user involved in the transaction.
    *   `type` (String): The type of transaction (`advance`, `reconciliation`, `withdrawal`).
    *   `amount` (Number): The value of the transaction. Can be negative (e.g., for rejected sales).
    *   `status` (String): The status of the transaction (`pending`, `completed`, `failed`).
    *   `timestamp` (Date): When the transaction was created.

### 2. Web Server (API)
### Relationships

To start the Express web server and interact with the system via API endpoints, run:
*   A `User` can have many `Sales` and many `Transactions`.
*   A `Sale` belongs to one `User`.
*   A `Transaction` belongs to one `User`.

```bash
node src/index.js
```
## 3. Class Design

The server will start on `http://localhost:3000`. You can use tools like Postman or `curl` to interact with the API endpoints defined in `src/index.js`.
The object-oriented approach is implemented through the following classes:

*   **`User(userId)`**: Represents an affiliate. It is created automatically when a new `userId` is encountered.
*   **`Sale(userId, brand, earning)`**: Represents a single sale event. It is initialized with a `pending` status and `advancePaid` as 0.
*   **`Transaction(userId, type, amount, status)`**: A record of any financial event that modifies a user's balance.
*   **`PayoutSystem`**: The main service class.
    *   **Properties**: `users`, `sales`, `transactions` (Maps to store data).
    *   **Methods**:
        *   `addSale()`: Creates a new sale.
        *   `processAdvancePayouts()`: Implements **Business Rule 1**. It calculates and pays a 10% advance for all eligible sales. It ensures idempotency by checking if `advancePaid` is zero.
        *   `reconcileSale()`: Implements **Business Rule 2**. It adjusts the user's balance based on whether a sale is `approved` or `rejected`.
        *   `requestWithdrawal()`: Implements **Business Rule 3**. It handles withdrawal requests, checking for sufficient balance and the 24-hour lock.
        *   `handleWithdrawalResult()`: Implements the **Failed Payout Recovery** logic. It refunds the user's balance and clears the withdrawal lock if a payout fails.

## 4. APIs / Endpoints

The following RESTful endpoints are defined in `src/index.js` to interact with the system.

| Method | Endpoint                             | Description                                                              |
| :----- | :----------------------------------- | :----------------------------------------------------------------------- |
| `POST` | `/sales`                             | Adds a new sale for a user.                                              |
| `GET`  | `/sales`                             | Retrieves a list of all sales in the system.                             |
| `POST` | `/payouts/advance`                   | Triggers the advance payout process for all pending sales.               |
| `POST` | `/sales/:saleId/reconcile`           | Reconciles a specific sale to `approved` or `rejected`.                  |
| `POST` | `/users/:userId/withdraw`            | Allows a user to request a withdrawal from their balance.                |
| `POST` | `/transactions/:txId/process`        | Simulates the result of a withdrawal (`completed` or `failed`).          |
| `GET`  | `/users/:userId`                     | Retrieves the status and balance of a specific user.                     |
| `GET`  | `/transactions`                      | Retrieves a list of all transactions.                                    |

## 5. Handling of Edge Cases and Failure Scenarios

The system is designed to be robust by handling various edge cases:

*   **Duplicate Advance Payouts**: The `processAdvancePayouts` method checks `if (sale.advancePaid === 0)`, preventing a sale from receiving an advance more than once.
*   **Reconciling a Non-Pending Sale**: The `reconcileSale` method throws an error if the sale's status is not `pending`, preventing invalid state transitions.
*   **Insufficient Balance for Withdrawal**: `requestWithdrawal` throws an error if `user.balance < amount`.
*   **Withdrawal Too Soon**: `requestWithdrawal` checks the `lastWithdrawalTime` and throws an error if a request is made within 24 hours of a previous one.
*   **Invalid Inputs**: API endpoints validate incoming request bodies and parameters to ensure all required fields are present and have the correct type.
*   **Non-Existent Entities**: Methods like `findUser` and `reconcileSale` throw errors if they are asked to operate on a `userId` or `saleId` that does not exist.
*   **Failed Payouts**: The `handleWithdrawalResult` method correctly handles the "failed payout" scenario by refunding the user's balance and resetting the 24-hour withdrawal lock, allowing them to retry immediately.

## 6. Working Implementation

The complete, working implementation is provided in the source code of this repository.

### How to Run

**Prerequisites**
*   Node.js (v14 or later)
*   npm (comes with Node.js)

**Installation**
```bash
npm install
```

**1. Run the Command-Line Demo**

To see a step-by-step demonstration of all business rules and features, run the CLI demo:
```bash
node index.js
```

**2. Run the Web Server (API)**

To start the Express server and interact with the system via API endpoints:
```bash
node src/index.js
```
The server will start on `http://localhost:3000`.

## 7. Key Design Decisions and Trade-offs

*   **In-Memory Storage vs. a Real Database**:
    *   **Decision**: I used in-memory `Map` objects to store data.
    *   **Trade-off**: This simplifies the setup immensely and keeps the focus on the application logic, which is ideal for an LLD assignment. The major trade-off is that all data is volatile and will be lost when the application restarts. For a production system, these Maps would be replaced with a persistent database (like PostgreSQL, MongoDB, etc.) without changing the core business logic in the `PayoutSystem` service.

*   **Centralized Service Logic**:
    *   **Decision**: All business rules are consolidated within the `PayoutSystem` class.
    *   **Trade-off**: This makes the system highly consistent and predictable. It's easy to understand the entire workflow by reading this one class. A potential downside is that this class could grow very large in a more complex system, but for this scope, it provides clarity and control.

*   **Idempotency in Advance Payouts**:
    *   **Decision**: The `processAdvancePayouts` function can be run multiple times without causing duplicate payments.
    *   **Trade-off**: This makes the system resilient. If a job fails midway, it can be safely re-run. This is achieved by explicitly checking `sale.advancePaid === 0` and updating it immediately, which is a standard pattern for idempotent operations.
