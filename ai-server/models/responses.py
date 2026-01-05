from pydantic import BaseModel
from typing import List, Dict, Any

class StatisticResult(BaseModel):
    metric_name: str
    value: float
    unit: str
    breakdown: Dict[str, Any] | None = None

class AnalysisResponse(BaseModel):
    statistics: List[StatisticResult]
    graph_base64: str  # Changed from graph_data
    sql_queries: List[str]
    graph_type: str