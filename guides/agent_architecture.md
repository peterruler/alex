# Alex Agent Architecture

This document illustrates how the AI agents in the Alex platform collaborate to provide comprehensive financial planning and portfolio analysis.

## Agent Collaboration Overview

```mermaid
graph TB
    User[User Request] -->|Portfolio Analysis| Planner[Financial Planner<br/>Orchestrator Agent]
    
    Planner -->|Check Instruments| Tagger[InstrumentTagger<br/>Agent]
    Tagger -->|Classify Assets| DB[(Database)]
    
    Planner -->|Generate Analysis| Reporter[Report Writer<br/>Agent]
    Reporter -->|Markdown Reports| DB
    
    Planner -->|Create Visualizations| Charter[Chart Maker<br/>Agent]
    Charter -->|JSON Chart Data| DB
    
    Planner -->|Project Future| Retirement[Retirement Specialist<br/>Agent]
    Retirement -->|Income Projections| DB
    
    DB -->|Results| Response[Complete Analysis<br/>Report]
    
    Planner -->|Retrieve Context| Vectors[(S3 Vectors<br/>Knowledge Base)]
    
    Schedule[EventBridge<br/>Every 2 Hours] -->|Trigger| Researcher[Researcher<br/>Agent]
    Researcher -->|Store Insights| Vectors
    Researcher -->|Web Research| Browser[Web Browser<br/>MCP Server]
    
    style Planner fill:#FFD700,stroke:#333,stroke-width:3px
    style Researcher fill:#87CEEB
    style Schedule fill:#9333EA
    style Tagger fill:#98FB98
    style Reporter fill:#DDA0DD
    style Charter fill:#F0E68C
    style Retirement fill:#FFB6C1
```

## Agent Responsibilities

### Financial Planner (Orchestrator)
**Role**: Master coordinator that manages the entire analysis workflow
- Receives user requests for portfolio analysis
- Identifies missing instrument data and delegates to InstrumentTagger
- Coordinates all specialized agents
- Retrieves relevant context from S3 Vectors knowledge base
- Compiles final analysis from all agent outputs
- Updates job status throughout the process

### InstrumentTagger
**Role**: Automatically populate reference data for financial instruments
- Classifies instruments by asset class (equity, fixed income, etc.)
- Determines regional allocation (North America, Europe, Asia, etc.)
- Identifies sector exposure (technology, healthcare, financials, etc.)
- Uses Structured Outputs for consistent data format
- Future: Will integrate with Polygon API for real-time market data

### Researcher (Independent Agent)
**Role**: Autonomously gather market intelligence and investment insights
- Runs independently on EventBridge schedule (every 2 hours)
- Not orchestrated by Financial Planner - operates autonomously
- Browses financial websites for latest market trends
- Analyzes company news and earnings reports
- Researches economic indicators and market conditions
- Generates investment insights and recommendations
- Continuously populates S3 Vectors knowledge base
- Knowledge is later retrieved by Financial Planner for context

### Report Writer
**Role**: Generate comprehensive portfolio analysis narratives
- Analyzes portfolio composition and diversification
- Evaluates risk exposure and asset allocation
- Generates executive summaries in markdown format
- Creates detailed analysis sections
- Provides actionable recommendations
- Writes in clear, professional financial language

### Chart Maker
**Role**: Transform portfolio data into visual insights
- Calculates allocation percentages across dimensions
- Creates pie charts for asset class distribution
- Generates bar charts for regional exposure
- Produces sector allocation visualizations
- Formats data for Recharts components
- Ensures all percentages sum to 100%

### Retirement Specialist
**Role**: Project long-term financial outcomes
- Calculates projected retirement income
- Runs Monte Carlo simulations for probability analysis
- Factors in years until retirement and target income
- Creates projection charts showing income over time
- Analyzes portfolio sustainability
- Provides recommendations for retirement readiness

## Agent Communication Flow

```mermaid
sequenceDiagram
    participant S as EventBridge Schedule
    participant Re as Researcher
    participant V as S3 Vectors
    participant U as User
    participant P as Financial Planner
    participant T as InstrumentTagger
    participant Rw as Report Writer
    participant C as Chart Maker
    participant Rt as Retirement Specialist
    participant DB as Database
    
    Note over S,Re: Independent Research Flow (Every 2 Hours)
    S->>Re: Trigger scheduled research
    Re->>V: Store market insights
    
    Note over U,DB: User-Triggered Analysis Flow
    U->>P: Request Portfolio Analysis
    P->>DB: Check for missing instrument data
    
    alt Missing Instrument Data
        P->>T: Tag unknown instruments
        T->>DB: Store classifications
    end
    
    P->>V: Retrieve relevant research
    Note right of P: Uses research previously<br/>stored by Researcher
    
    par Parallel Analysis
        P->>Rw: Generate portfolio report
        Rw->>DB: Save analysis
    and
        P->>C: Create visualizations
        C->>DB: Save chart data
    and
        P->>Rt: Calculate projections
        Rt->>DB: Save retirement analysis
    end
    
    P->>DB: Compile all results
    P->>U: Return complete analysis
```

## Data Flow

```mermaid
graph LR
    subgraph Input
        Portfolio[Portfolio Data]
        Instruments[Instrument Symbols]
        Goals[Retirement Goals]
    end
    
    subgraph Processing
        Analysis[Analysis Engine]
        Knowledge[Knowledge Base]
        Market[Market Data]
    end
    
    subgraph Output
        Report[Written Report]
        Charts[Visualizations]
        Projections[Retirement Projections]
        Recommendations[Action Items]
    end
    
    Portfolio --> Analysis
    Instruments --> Analysis
    Goals --> Analysis
    
    Knowledge --> Analysis
    Market --> Analysis
    
    Analysis --> Report
    Analysis --> Charts
    Analysis --> Projections
    Analysis --> Recommendations
```

## Agent Capabilities Matrix

| Agent | AI Model | Primary Function | Output Format | Execution Time |
|-------|----------|------------------|---------------|----------------|
| Financial Planner | Claude 4 Sonnet | Orchestration & Coordination | Job Status | 2-3 minutes |
| InstrumentTagger | Claude 4 Sonnet | Asset Classification | Structured JSON | 5-10 seconds |
| Researcher | Claude 4 Sonnet | Market Intelligence | Markdown Articles | 30-60 seconds |
| Report Writer | Claude 4 Sonnet | Portfolio Narrative | Markdown Report | 20-30 seconds |
| Chart Maker | Claude 4 Sonnet | Data Visualization | Recharts JSON | 10-15 seconds |
| Retirement Specialist | Claude 4 Sonnet | Future Projections | Analysis + Charts | 20-30 seconds |

## Knowledge Integration

The agents leverage two primary knowledge sources:

### S3 Vectors Knowledge Base
- Historical research and market insights
- Company analysis and earnings reports
- Economic indicators and trends
- Investment strategies and recommendations
- Continuously updated by the Researcher agent

### Database Reference Data
- Instrument classifications and allocations
- User portfolios and preferences
- Historical reports and analyses
- Cached calculations and projections

## Agent Collaboration Patterns

### 1. Data Enrichment Pattern
```
Unknown Instrument → InstrumentTagger → Enriched Data → Other Agents
```

### 2. Independent Research Pattern
```
EventBridge (Every 2hrs) → Researcher → S3 Vectors → Knowledge Base Growth
```

### 3. Knowledge Integration Pattern
```
Financial Planner → Retrieve from S3 Vectors → Contextual Analysis
```

### 4. Parallel Processing Pattern
```
Financial Planner → [Report Writer, Chart Maker, Retirement] → Compiled Results
```

### 5. Continuous Learning Pattern
```
Researcher (Autonomous) → Accumulating Knowledge → Better Analysis Over Time
```

## Key Design Principles

1. **Specialization**: Each agent has a focused responsibility
2. **Orchestration**: Financial Planner coordinates but doesn't micromanage
3. **Parallel Execution**: Independent agents run simultaneously for speed
4. **Knowledge Sharing**: S3 Vectors enables collective intelligence
5. **Graceful Degradation**: System works even if some agents fail
6. **Incremental Enhancement**: New agents can be added without disrupting existing ones

## Future Agent Enhancements

### Planned Agents
- **Tax Optimizer**: Analyze tax implications and strategies
- **Rebalancer**: Suggest portfolio rebalancing actions
- **Risk Analyzer**: Deep dive into portfolio risk metrics

### Planned Capabilities
- Real-time market data integration (Polygon API)
- Options strategy analysis
- International market coverage
- ESG (Environmental, Social, Governance) scoring