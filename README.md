# AI-Enhanced Data Module

This project is a small web app
1. Lets users upload a CSV or JSON file
2. Displays data in an interactive table
3. Provides filtering capabilities
4. Provides data editing capabilities (add new row, edit existing cells)
5. Integrates a simple AI assistant panel that can summarize the data

## Features

-   **Data Grid**: robust table with sorting, filtering, and pagination.
-   **CSV Upload**: specialized route to upload CSV files which are parsed and seeded into the database.
-   **Dynamic Tables**: database support for multiple uploaded tables with a fixed schema.
-   **Editing**: inline editing of table rows with batch updates.
-   **Filtering**: custom filters including date ranges and deal stages.

## Setup Instructions

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16+)
-   [Supabase Account](https://supabase.com/)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Configuration

1.  Create a `.env` file in the root of the project (copy from `.env.sample` if available).
2.  Add your Supabase credentials:

    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

### Database Setup

1.  Go to your Supabase project dashboard.
2.  Navigate to the **SQL Editor**.
3.  Run the contents of [supabase_setup.sql](./supabase_setup.sql).
    -   This script creates the `master_uploads` table.
    -   It defines the `create_leads_table` RPC function used to dynamically create tables for each CSV upload.
4. With the sample data having more than 1000 rows, you will need to increase the API limit in the Supabase dashboard to at least 10000 rows.

### Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deployment

To deploy the application:

1.  Build the project:
    ```bash
    npm run build
    ```
2.  The output files will be in the `dist` directory.
3.  Upload the contents of the `dist` directory to your static hosting provider (e.g., Vercel, Netlify, AWS S3).

## Database Structure

The application uses a dynamic table structure managed by Supabase.

### 1. `master_uploads`
Stores metadata for every CSV file uploaded.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `filename` | text | Name of the uploaded file |
| `created_at` | timestamp | Upload timestamp |
| `table_name` | text | Name of the dynamic table (e.g., `leads_123`) |

### 2. `leads_{id}` (Dynamic Tables)
Each uploaded CSV is stored in its own table with a **FIXED** schema.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `date` | date | Lead date |
| `lead_owner` | text | Owner of the lead |
| `source` | text | Lead source (e.g., Website, Referral) |
| `deal_stage` | text | Current stage (e.g., Interest, Closed Won) |
| `account_id` | text | Associated account ID |
| `first_name` | text | Lead first name |
| `last_name` | text | Lead last name |
| `company` | text | Company name |

## API Reference

The application uses a service layer located in `src/services/api.js` to interact with Supabase.

### Core Functions

-   **`fetchMasterUploads()`**
    -   Fetches all uploaded file records from `master_uploads`.

-   **`fetchTableData(id)`**
    -   Fetches all rows from a dynamic table specified by `id`.
    -   *Note*: If `id` is "1", returns mock data.

-   **`createMasterEntry(filename, tableName)`**
    -   Inserts a new record into `master_uploads`.

-   **`createTableSchema(tableName)`**
    -   Calls the `create_leads_table` RPC function to create a new DB table.

-   **`insertTableData(tableName, data)`**
    -   Bulk inserts parsed CSV data into the specified dynamic table.

-   **`updateTableRow(tableName, rowId, updates)`**
    -   Updates a single row in the specified table.

-   **`batchUpdateTableRows(tableName, updates)`**
    -   Updates multiple rows efficiently using `upsert`.

-   **`addTableRow(tableName, rowData)`**
    -   Inserts a single new row into the specified table.

-   **`deleteTableRows(tableName, rowIds)`**
    -   Deletes multiple rows identified by `rowIds`.
