import supabase from "./supabase";

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
 * Fetches all records from a specific table.
 * @param {string} tableName 
 */
export const fetchTableData = async (tableName) => {
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
