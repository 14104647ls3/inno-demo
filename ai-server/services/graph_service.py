import matplotlib
matplotlib.use('Agg')  # Non-GUI backend
import matplotlib.pyplot as plt
import plotly.graph_objects as go
import plotly.express as px
from io import BytesIO
import base64
from typing import Dict, Any, List, Literal

class GraphService:
    def __init__(self):
        # Set default style
        plt.style.use('seaborn-v0_8-darkgrid')
    
    def generate_graph_base64(
        self,
        graph_data: Dict[str, Any],
        graph_type: str = "auto",
        engine: Literal["matplotlib", "plotly"] = "plotly",
        width: int = 800,
        height: int = 600
    ) -> str:
        """
        Generate graph as base64 string
        
        Args:
            graph_data: Data from Claude containing labels, datasets, etc.
            graph_type: bar, line, pie, scatter, etc.
            engine: matplotlib or plotly
            width, height: Image dimensions
            
        Returns:
            base64 encoded image string with data URI prefix
        """
        if engine == "plotly":
            return self._generate_plotly_base64(graph_data, graph_type, width, height)
        else:
            return self._generate_matplotlib_base64(graph_data, graph_type, width, height)
    
    def _generate_plotly_base64(
        self,
        graph_data: Dict[str, Any],
        graph_type: str,
        width: int,
        height: int
    ) -> str:
        """Generate graph using Plotly"""
        
        try:
            # Extract data
            labels = graph_data.get('labels', [])
            datasets = graph_data.get('datasets', [])
            
            # Auto-detect type if needed
            if graph_type == "auto":
                graph_type = graph_data.get('type', 'bar')
            
            # Create figure based on type
            if graph_type == "bar":
                fig = self._create_plotly_bar(labels, datasets)
            elif graph_type == "line":
                fig = self._create_plotly_line(labels, datasets)
            elif graph_type == "pie":
                fig = self._create_plotly_pie(labels, datasets)
            elif graph_type == "scatter":
                fig = self._create_plotly_scatter(labels, datasets)
            else:
                fig = self._create_plotly_bar(labels, datasets)  # Default
            
            # Update layout
            fig.update_layout(
                width=width,
                height=height,
                title=graph_data.get('title', ''),
                template="plotly_white",
                font=dict(size=12),
                showlegend=True,
                margin=dict(l=50, r=50, t=80, b=50)
            )
            
            # Convert to base64
            img_bytes = fig.to_image(format="png", engine="kaleido")
            img_base64 = base64.b64encode(img_bytes).decode('utf-8')
            
            return f"data:image/png;base64,{img_base64}"
            
        except Exception as e:
            print(f"Error generating Plotly graph: {e}")
            return self._generate_error_image(str(e))
    
    def _create_plotly_bar(self, labels: List, datasets: List[Dict]) -> go.Figure:
        """Create bar chart"""
        fig = go.Figure()
        
        for dataset in datasets:
            fig.add_trace(go.Bar(
                name=dataset.get('label', 'Data'),
                x=labels,
                y=dataset.get('data', []),
                marker_color=dataset.get('backgroundColor', '#3b82f6')
            ))
        
        return fig
    
    def _create_plotly_line(self, labels: List, datasets: List[Dict]) -> go.Figure:
        """Create line chart"""
        fig = go.Figure()
        
        for dataset in datasets:
            fig.add_trace(go.Scatter(
                name=dataset.get('label', 'Data'),
                x=labels,
                y=dataset.get('data', []),
                mode='lines+markers',
                line=dict(color=dataset.get('borderColor', '#3b82f6'))
            ))
        
        return fig
    
    def _create_plotly_pie(self, labels: List, datasets: List[Dict]) -> go.Figure:
        """Create pie chart"""
        # Use first dataset for pie chart
        dataset = datasets[0] if datasets else {}
        
        fig = go.Figure(data=[go.Pie(
            labels=labels,
            values=dataset.get('data', []),
            hole=0.3  # Donut chart
        )])
        
        return fig
    
    def _create_plotly_scatter(self, labels: List, datasets: List[Dict]) -> go.Figure:
        """Create scatter plot"""
        fig = go.Figure()
        
        for dataset in datasets:
            fig.add_trace(go.Scatter(
                name=dataset.get('label', 'Data'),
                x=labels,
                y=dataset.get('data', []),
                mode='markers',
                marker=dict(
                    size=8,
                    color=dataset.get('backgroundColor', '#3b82f6')
                )
            ))
        
        return fig
    
    def _generate_matplotlib_base64(
        self,
        graph_data: Dict[str, Any],
        graph_type: str,
        width: int,
        height: int
    ) -> str:
        """Generate graph using Matplotlib"""
        
        try:
            # Create figure
            fig, ax = plt.subplots(figsize=(width/100, height/100), dpi=100)
            
            # Extract data
            labels = graph_data.get('labels', [])
            datasets = graph_data.get('datasets', [])
            
            # Auto-detect type
            if graph_type == "auto":
                graph_type = graph_data.get('type', 'bar')
            
            # Create chart based on type
            if graph_type == "bar":
                self._create_matplotlib_bar(ax, labels, datasets)
            elif graph_type == "line":
                self._create_matplotlib_line(ax, labels, datasets)
            elif graph_type == "pie":
                self._create_matplotlib_pie(ax, labels, datasets)
            else:
                self._create_matplotlib_bar(ax, labels, datasets)
            
            # Set title
            if 'title' in graph_data:
                ax.set_title(graph_data['title'], fontsize=14, fontweight='bold')
            
            plt.tight_layout()
            
            # Convert to base64
            buffer = BytesIO()
            plt.savefig(buffer, format='png', bbox_inches='tight', dpi=100)
            plt.close(fig)
            
            buffer.seek(0)
            img_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            
            return f"data:image/png;base64,{img_base64}"
            
        except Exception as e:
            print(f"Error generating Matplotlib graph: {e}")
            plt.close('all')
            return self._generate_error_image(str(e))
    
    def _create_matplotlib_bar(self, ax, labels: List, datasets: List[Dict]):
        """Create bar chart with matplotlib"""
        import numpy as np
        
        x = np.arange(len(labels))
        width = 0.8 / len(datasets) if datasets else 0.8
        
        for i, dataset in enumerate(datasets):
            offset = width * i - (width * len(datasets) / 2) + width / 2
            ax.bar(
                x + offset,
                dataset.get('data', []),
                width,
                label=dataset.get('label', f'Dataset {i+1}'),
                alpha=0.8
            )
        
        ax.set_xticks(x)
        ax.set_xticklabels(labels, rotation=45, ha='right')
        ax.legend()
        ax.grid(axis='y', alpha=0.3)
    
    def _create_matplotlib_line(self, ax, labels: List, datasets: List[Dict]):
        """Create line chart with matplotlib"""
        for dataset in datasets:
            ax.plot(
                labels,
                dataset.get('data', []),
                marker='o',
                label=dataset.get('label', 'Data'),
                linewidth=2
            )
        
        ax.legend()
        ax.grid(alpha=0.3)
        plt.xticks(rotation=45, ha='right')
    
    def _create_matplotlib_pie(self, ax, labels: List, datasets: List[Dict]):
        """Create pie chart with matplotlib"""
        dataset = datasets[0] if datasets else {}
        
        ax.pie(
            dataset.get('data', []),
            labels=labels,
            autopct='%1.1f%%',
            startangle=90
        )
        ax.axis('equal')
    
    def _generate_error_image(self, error_msg: str) -> str:
        """Generate error placeholder image"""
        from PIL import Image, ImageDraw, ImageFont
        
        img = Image.new('RGB', (800, 600), color='white')
        draw = ImageDraw.Draw(img)
        
        # Draw error message
        text = f"Error generating graph:\n{error_msg[:100]}"
        draw.text((50, 250), text, fill='red')
        
        # Convert to base64
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        img_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        
        return f"data:image/png;base64,{img_base64}"