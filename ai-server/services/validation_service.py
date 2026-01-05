import re

class ValidationService:
    DANGEROUS_PATTERNS = [
        r'\b(insert|update|delete|drop|create|alter|truncate)\b',
        r';.*?--',  # Multiple statements
        r'xp_cmdshell',
        r'exec\s+\(',
    ]
    
    def is_safe_query(self, sql: str) -> bool:
        """Validate SQL query is safe to execute"""
        sql_lower = sql.lower().strip()
        
        # Must start with SELECT
        if not sql_lower.startswith('select'):
            return False
        
        # Check for dangerous patterns
        for pattern in self.DANGEROUS_PATTERNS:
            if re.search(pattern, sql_lower, re.IGNORECASE):
                return False
        
        return True