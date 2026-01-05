from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

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
    graph_engine: Literal["matplotlib"] = "matplotlib"
    image_width: int = 800
    image_height: int = 600


class StatisticResult(BaseModel):
    metric_name: str
    value: float
    unit: str
    breakdown: Dict[str, Any] | None = None


class AnalysisResponse(BaseModel):
    summary: str
    statistics: List[StatisticResult]
    graph_url: str | None = None
    sql_queries: List[str]
    graph_type: str | None = None


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_leads(request: AnalysisRequest, raw_request: Request):
    """Main analytics endpoint - returns graph as url"""
    try:
        # Step 1: Validate table exists
        available_tables = query_service.get_available_tables()
        if request.table_name not in available_tables:
            raise HTTPException(
                status_code=404, 
                detail=f"Table {request.table_name} not found"
            )
        
        print("Table exists")
        # Step 1.5: Auto-detect if graph should be generated (if not explicitly set)
        # should_include_graph = request.include_graph
        # graph_type_to_use = request.graph_type
        # print("Graph auto-detect: ", request.include_graph)
        # print("Graph type: ", request.graph_type)

        # if request.include_graph is None:  # Auto-detect mode
        graph_decision = await claude_service.should_generate_graph(request.question)
        should_include_graph = graph_decision['include_graph']
        if graph_decision['graph_type'] != 'none':
            graph_type_to_use = graph_decision['graph_type']

        print("Graph auto-decision: ", graph_decision['include_graph'], graph_decision['graph_type'])
        print("Reasoning: ", graph_decision['reasoning'])

        # Step 2: Generate SQL queries
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
            graph_type=graph_type_to_use,
            include_graph=should_include_graph
        )
        
        # Step 6: Generate graph file ONLY if requested
        graph_url = None
        if should_include_graph and graph_type_to_use != 'none':
            filename = graph_service.generate_graph_file(
                graph_data=analysis['graph_data'],
                graph_type=graph_type_to_use,
                engine=request.graph_engine,
                width=request.image_width,
                height=request.image_height
            )
            graph_url = f"{str(raw_request.base_url)}static/images/{filename}"
        
        return AnalysisResponse(
            summary=analysis['summary'],
            statistics=analysis['statistics'],
            graph_url=graph_url,  # Will be None if not requested
            sql_queries=[q['sql'] for q in queries],
            graph_type=graph_type_to_use  # Will be None if not requested
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