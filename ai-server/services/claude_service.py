import anthropic
import json
from typing import List, Dict, Any

class ClaudeService:
    def __init__(self, api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)
        self.system_prompt = """You are a data analyst for a lead generation system.

            Database Schema:
            - Dynamic lead tables with columns: id, date, lead_owner, source, deal_stage, 
            account_id, first_name, last_name, company

            RULES:
            1. Return SPECIFIC NUMBERS only, never vague descriptions
            2. Generate PostgreSQL-compatible SELECT queries
            3. Use COUNT, SUM, AVG, GROUP BY for statistics
            4. Always return valid JSON
            5. No destructive operations (INSERT/UPDATE/DELETE)
        """
    
    async def generate_queries(self, question: str, table_name: str) -> List[Dict]:
        """Generate SQL queries to answer the question"""
        
        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            system=self.system_prompt,
            messages=[{
                "role": "user",
                "content": f"""Table name: {table_name}
                Question: {question}

                Generate SQL queries to answer with SPECIFIC NUMBERS.
                Return JSON array format:
                [
                {{
                    "sql": "SELECT ...",
                    "description": "What this calculates",
                    "metric_name": "Total Leads"
                }}
                ]"""
            }]
        )
        
        # Parse response
        content = response.content[0].text
        # Handle markdown code blocks if present
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        
        return json.loads(content)
    
    async def generate_analysis(
        self, 
        query_results: List[Dict], 
        graph_type: str = "auto",
        include_graph: bool = False
    ) -> Dict[str, Any]:
        """Generate statistics and optionally graph data from query results"""
        
        # Build the prompt based on whether graph is needed
        if include_graph:
            prompt_content = f"""Query results: {json.dumps(query_results, indent=2)}

            Generate:
            1. A natural language summary presenting the key insights (2-3 sentences)
            2. Specific numeric statistics
            3. Graph data for {graph_type} chart

            IMPORTANT: Write the summary as if you're a data analyst presenting findings to a colleague.
            Use actual numbers and be specific. Sound natural and conversational.

            Return JSON:
            {{
            "summary": "Based on the data, you have 1,010 qualified deals in your pipeline. This represents a strong conversion funnel with qualified leads making up about 18.6% of your total leads. The majority of your leads are currently in the qualification stage.",
            "statistics": [
                {{
                "metric_name": "Qualified Deals",
                "value": 1010,
                "unit": "leads",
                "breakdown": {{"qualified": 1010}}
                }}
            ],
            "graph_data": {{
                "type": "bar",
                "labels": ["Qualified"],
                "datasets": [{{
                "label": "Deal Count",
                "data": [1010]
                }}]
            }}
            }}"""                
            
        else:
            # Simpler prompt when no graph needed
            prompt_content = f"""Query results: {json.dumps(query_results, indent=2)}

            Generate:
            1. A natural language summary presenting the key insights (2-3 sentences)
            2. Specific numeric statistics

            IMPORTANT: Write the summary as if you're a data analyst presenting findings to a colleague.
            Use actual numbers and be specific. Sound natural and conversational.

            Return JSON:
            {{
            "summary": "Based on the data, you have 1,010 qualified deals in your pipeline. This represents a strong conversion funnel with qualified leads making up about 18.6% of your total leads.",
            "statistics": [
                {{
                "metric_name": "Qualified Deals",
                "value": 1010,
                "unit": "leads",
                "breakdown": {{"qualified": 1010}}
                }}
            ]
            }}"""
        
        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000 if not include_graph else 3000,  # Less tokens needed without graph
            system=self.system_prompt,
            messages=[{
                "role": "user",
                "content": prompt_content
            }]
        )
        
        content = response.content[0].text
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        
        return json.loads(content)