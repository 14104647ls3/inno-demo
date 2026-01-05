from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Literal
import os
from dotenv import load_dotenv

from services.claude_service import ClaudeService
from services.query_service import QueryService
from services.validation_service import ValidationService
from services.graph_service import GraphService

load_dotenv()

app = FastAPI(title="Lead Analytics AI API")

app = FastAPI(title="Lead Analytics AI API")

# CORS for your Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default
        "http://localhost:3000",  # Alternative
        os.getenv("FRONTEND_URL", "")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
claude_service = ClaudeService(os.getenv("ANTHROPIC_API_KEY"))
query_service = QueryService(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)
validation_service = ValidationService()
graph_service = GraphService()


class AnalysisRequest(BaseModel):
    question: str
    table_name: str
    include_graph: bool = False 
    graph_type: str = "auto"
    graph_engine: Literal["matplotlib", "plotly"] = "plotly"
    image_width: int = 800
    image_height: int = 600


class StatisticResult(BaseModel):
    metric_name: str
    value: float
    unit: str
    breakdown: Dict[str, Any] | None = None


class AnalysisResponse(BaseModel):
    summary: str  # NEW: Human-readable summary
    statistics: List[StatisticResult]
    graph_base64: str | None = None
    sql_queries: List[str]
    graph_type: str | None = None


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_leads(request: AnalysisRequest):
    """Main analytics endpoint - returns graph as base64"""
    try:
        # Step 1: Validate table exists
        available_tables = query_service.get_available_tables()
        if request.table_name not in available_tables:
            raise HTTPException(
                status_code=404, 
                detail=f"Table {request.table_name} not found"
            )
        
        # Step 2: Generate SQL queries using Claude
        queries = await claude_service.generate_queries(
            question=request.question,
            table_name=request.table_name
        )
        
        # Step 3: Validate queries
        for query in queries:
            if not validation_service.is_safe_query(query['sql']):
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsafe query detected"
                )
        
        # Step 4: Execute queries
        query_results = []
        for query in queries:
            result = query_service.execute_query(query['sql'])
            query_results.append({
                'query': query,
                'data': result
            })
        
        # Step 5: Generate statistics (always) and graph data (conditional)
        analysis = await claude_service.generate_analysis(
            query_results=query_results,
            graph_type=request.graph_type,
            include_graph=request.include_graph
        )
        
        # Step 6: Generate base64 image ONLY if requested
        graph_base64 = None
        actual_graph_type = None
        
        if request.include_graph and 'graph_data' in analysis:
            graph_base64 = graph_service.generate_graph_base64(
                graph_data=analysis['graph_data'],
                graph_type=request.graph_type,
                engine=request.graph_engine,
                width=request.image_width,
                height=request.image_height
            )
            actual_graph_type = request.graph_type
        
        return AnalysisResponse(
            summary=analysis['summary'],
            statistics=analysis['statistics'],
            graph_base64=graph_base64,  # Will be None if not requested
            sql_queries=[q['sql'] for q in queries],
            graph_type=actual_graph_type  # Will be None if not requested
        )
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)