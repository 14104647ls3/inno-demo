-- Create the read-only query executor function
CREATE OR REPLACE FUNCTION execute_readonly_query(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Validate: must start with SELECT
  IF query !~* '^\s*select' THEN
    RAISE EXCEPTION 'Only SELECT queries allowed';
  END IF;
  
  -- Prevent destructive keywords
  IF query ~* '(insert|update|delete|drop|create|alter|truncate|grant|revoke)' THEN
    RAISE EXCEPTION 'Destructive operations not allowed';
  END IF;
  
  -- Execute and return as JSON array
  EXECUTE format('SELECT json_agg(t) FROM (%s) t', query) INTO result;
  
  -- Return empty array if no results
  RETURN COALESCE(result, '[]'::json);
END;
$$;