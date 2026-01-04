import supabase from "./supabase";

const MOCK_LEADS = [
    {
        date: "2024-01-01",
        lead_owner: "John Doe",
        source: "Referral",
        deal_stage: "Interest",
        account_id: "ACC-001",
        first_name: "Alice",
        last_name: "Smith",
        company: "Acme Corp"
    },
    {
        date: "2024-01-02",
        lead_owner: "Jane Roe",
        source: "Website",
        deal_stage: "Closed Won",
        account_id: "ACC-002",
        first_name: "Bob",
        last_name: "Jones",
        company: "Global Tech"
    }
];

/**
 * Fetches all records from the master_uploads table, ordered by creation time.
 */
export const fetchMasterUploads = async () => {
    const { data, error } = await supabase
        .from('master_uploads')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

/**
 * Fetches all records from a specific table by its ID.
 * Example: if id is "123", it fetches from "leads_123".
 * Legacy support: if id starts with "leads_", it uses it as is.
 * IF ID IS "1", RETURNS MOCK DATA.
 * @param {string} id 
 */
export const fetchTableData = async (id) => {
    if (id === "1") {
        return MOCK_LEADS;
    }

    // Determine the actual table name
    const tableName = id.startsWith("leads_") ? id : `leads_${id}`;

    const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .order('id', { ascending: true })

    if (error) throw error;
    // log the total number of rows
    console.log("Total rows:", data.length);
    return data;
};

/**
 * Creates a metadata entry in the master_uploads table.
 * @param {string} filename 
 * @param {string} tableName 
 */
export const createMasterEntry = async (filename, tableName) => {
    const { error } = await supabase
        .from("master_uploads")
        .insert([
            {
                filename,
                table_name: tableName
            }
        ]);

    if (error) throw error;
};

/**
 * Calls the RPC function to create a new table with the leads schema.
 * @param {string} tableName 
 */
export const createTableSchema = async (tableName) => {
    const { error } = await supabase.rpc("create_leads_table", {
        table_name: tableName
    });

    if (error) throw error;
};

/**
 * Inserts data into a specific table.
 * @param {string} tableName 
 * @param {Array} data 
 */
export const insertTableData = async (tableName, data) => {
    const { error } = await supabase
        .from(tableName)
        .insert(data);

    if (error) throw error;
};

/**
 * Updates a specific row in a table.
 * @param {string} tableName 
 * @param {string} rowId 
 * @param {Object} updates 
 */
export const updateTableRow = async (tableName, rowId, updates) => {
    // Determine the actual table name
    const actualTableName = tableName.startsWith("leads_") ? tableName : `leads_${tableName}`;

    const { error } = await supabase
        .from(actualTableName)
        .update(updates)
        .eq('id', rowId);

    if (error) throw error;
};

/**
 * Updates multiple rows in a table in a single batch.
 * @param {string} tableName 
 * @param {Array} updates Array of objects, each must contain 'id'
 */
export const batchUpdateTableRows = async (tableName, updates) => {
    if (!updates || updates.length === 0) return;

    // Determine the actual table name
    const actualTableName = tableName.startsWith("leads_") ? tableName : `leads_${tableName}`;

    const { error } = await supabase
        .from(actualTableName)
        .upsert(updates);

    if (error) throw error;
};

/**
 * Adds a new row to the table.
 * @param {string} tableName 
 * @param {Object} rowData 
 */
export const addTableRow = async (tableName, rowData) => {
    // Determine the actual table name
    const actualTableName = tableName.startsWith("leads_") ? tableName : `leads_${tableName}`;

    const { data, error } = await supabase
        .from(actualTableName)
        .insert([rowData])
        .select();

    if (error) throw error;
    return data;
};

/**
 * Deletes multiple rows from the table.
 * @param {string} tableName 
 * @param {Array<string>} rowIds 
 */
export const deleteTableRows = async (tableName, rowIds) => {
    if (!rowIds || rowIds.length === 0) return;

    // Determine the actual table name
    const actualTableName = tableName.startsWith("leads_") ? tableName : `leads_${tableName}`;

    const { error } = await supabase
        .from(actualTableName)
        .delete()
        .in('id', rowIds);

    if (error) throw error;

    return rowIds;
};
