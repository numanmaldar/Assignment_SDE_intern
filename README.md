# Payout Management System

This project is a Node.js-based simulation of a payout management system for sales affiliates. It includes logic for tracking sales, processing advance payments, reconciling sales statuses, and handling user withdrawals.

The system is available in two forms:
1.  A command-line interface (CLI) demo to walk through the system's features.
2.  An Express.js web server that exposes the system's functionality via a REST API.

## Features

- **User and Sale Management**: Add users and sales with associated earnings.
- **Advance Payouts**: Automatically process a 10% advance on pending sales.
- **Sale Reconciliation**: Approve or reject sales, adjusting user balances accordingly.
- **Withdrawal System**: Allow users to request withdrawals from their balance, with a 24-hour time lock between requests.
- **Transaction Logging**: Records all financial activities, including advances, reconciliations, and withdrawals.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Installation

1.  Clone the repository or download the source code.
2.  Navigate to the project's root directory in your terminal.
3.  Install the required dependencies:
    ```bash
    npm install
    ```

## How to Run

### 1. Command-Line Demo

To see a step-by-step demonstration of the system's features, run the CLI demo script:

```bash
node index.js
```

### 2. Web Server (API)

To start the Express web server and interact with the system via API endpoints, run:

```bash
node src/index.js
```

The server will start on `http://localhost:3000`. You can use tools like Postman or `curl` to interact with the API endpoints defined in `src/index.js`.