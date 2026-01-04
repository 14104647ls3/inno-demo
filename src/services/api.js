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
        .select("*");

    if (error) throw error;
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
