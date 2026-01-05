from supabase import create_client, Client
from typing import List, Dict, Any

class QueryService:
    def __init__(self, supabase_url: str, supabase_key: str):
        self.client: Client = create_client(supabase_url, supabase_key)
    
    def get_available_tables(self) -> List[str]:
        """Get list of lead tables"""
        result = self.client.table('master_uploads')\
            .select('table_name')\
            .execute()
        print(result)
        # pad table_name with 'leads_' prefix
        return ['leads_' + row['table_name'] for row in result.data]
    
    def execute_query(self, sql: str) -> List[Dict[str, Any]]:
        """Execute a read-only SQL query"""
        result = self.client.rpc('execute_readonly_query', {
            'query': sql
        }).execute()
        return result.data