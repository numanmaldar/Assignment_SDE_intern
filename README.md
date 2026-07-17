# 💰 Payout Management System

A sleek, single-page web application for managing a simple payout system for users, such as influencers or creators. This dashboard provides a complete operational console for adding sales, processing payouts, reconciling accounts, and managing withdrawals, all through a clean and responsive user interface.

The entire application runs locally with an in-memory data store, requiring no external database.

## ✨ Features

- **Modern Ops Dashboard**: A beautiful, responsive UI built with vanilla HTML, CSS, and JavaScript.
- **Sales Management**: Add sales with associated earnings for any user.
- **Advance Payouts**: Automatically process a 10% advance on pending sales to make funds immediately available to users.
- **Sale Reconciliation**: Manually approve or reject sales. Approving releases the remaining funds, while rejecting claws back the advance.
- **Withdrawal System**: Users can request withdrawals from their available balance.
- **Robust Withdrawal Logic**:
  - Includes a 24-hour cooldown period between withdrawals.
  - Allows operators to mark pending withdrawals as `completed` or `failed`.
  - Correctly handles failed withdrawals by refunding the user and clearing the cooldown lock.
- **Full Visibility**: View complete ledgers for all sales and financial transactions in the system.
- **Data Export**: Download the sales and transaction ledgers as `.csv` files for offline analysis or record-keeping.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Data Store**: In-memory `Map` objects (data resets on server restart).
- **Development**: `nodemon` for automatic server restarts.

## 🚀 Getting Started

Follow these instructions to get the project running on your local machine.

### Prerequisites

You need to have Node.js (which includes `npm`) installed on your system.

### Installation & Running

1.  **Clone the repository** (or download the source code).

2.  **Navigate to the project directory**:
    ```sh
    cd path/to/payout-management-system
    ```

3.  **Install dependencies**:
    ```sh
    npm install
    ```

4.  **Start the server**:
    The project is set up to run with `nodemon`, which will automatically restart the server when you make changes to the code.
    ```sh
    npm start
    ```

5.  **Open the application**:
    Open your web browser and go to `http://localhost:3000`. You should see the Payout System dashboard.

## ⚙️ How It Works

The application is built with a clear separation between the frontend UI, the backend API, and the core business logic.

- **`index.html`**: A single HTML file that contains the entire user interface, styling, and client-side JavaScript for making API calls and rendering data.
- **`index.js`**: An Express.js server that defines all the API endpoints. It acts as the controller, receiving requests from the frontend and calling the appropriate business logic.
- **`services/PayoutSystem.js`**: The "brain" of the application. This class contains all the business rules and manages the in-memory data (users, sales, transactions). It knows nothing about the web server, ensuring a clean separation of concerns.

## 📖 API Endpoints

The following API endpoints are defined in `index.js`:

| Method | Endpoint                             | Description                                            |
| :----- | :----------------------------------- | :----------------------------------------------------- |
| `GET`  | `/users/:userId`                     | Get the status and balance of a specific user.         |
| `GET`  | `/sales`                             | Get a list of all sales in the system.                 |
| `GET`  | `/transactions`                      | Get a list of all transactions in the system.          |
| `POST` | `/sales`                             | Add a new sale for a user.                             |
| `POST` | `/payouts/advance`                   | Trigger the job to process all eligible advance payouts. |
| `POST` | `/sales/:saleId/reconcile`           | Reconcile a sale as `approved` or `rejected`.          |
| `POST` | `/users/:userId/withdraw`            | Request a new withdrawal for a user.                   |
| `POST` | `/transactions/:txId/process`        | Mark a pending withdrawal as `completed` or `failed`.  |

---

## ✍️ Author

Made by **Numan Maldar**