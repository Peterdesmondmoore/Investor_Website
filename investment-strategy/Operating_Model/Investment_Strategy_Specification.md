# Investment Strategy Specification Standard

Use the below standard to ensure Investment Straetgies updated through code align with standard.

---

## 1. Strategy Metadata

### 1.1 Strategy Identification
- **Strategy Name**
- **Asset / Theme**
- **Strategy Type**
  - Core / Tactical / Core + Tactical / Relative Value / Thematic
- **Primary Objective**
  - Capital growth / income / diversification / convexity / hedging
- **As-of Date**
- **Original Baseline Date**
- **Review Cadence**
  - Monthly / Quarterly / Event-driven

### 1.2 Investment Universe
- **Eligible Asset Classes**
  - Equities / ETFs / Futures / Options / Physical / Hybrids
- **Geographic Scope**
- **Sector / Sub-sector Constraints**
- **Instrument Eligibility Rules**
  - Liquidity thresholds  
  - Listing venues  
  - Currency exposure rules  
  - Leverage constraints  

### 1.3 Time Horizon
- **Strategic Horizon** (e.g. 3–7 years)
- **Tactical Horizon** (e.g. weeks to months)
- **Expected Holding Period per Sleeve**

---

## 2. Core Investment Thesis

### 2.1 Primary Thesis Statement
Single, explicit statement describing:
- Structural drivers
- Why mispricing exists
- Why the opportunity persists despite known risks

### 2.2 Structural Drivers
For each driver:
- **Driver Name**
- **Mechanism**
- **Duration**
- **Sensitivity**
- **Second-order Effects**

Examples:
- Demand transformation  
- Supply constraints  
- Cost curve shifts  
- Regulation / geopolitics  
- Technology adoption  

### 2.3 Why the Market Is Mispricing the Thesis
- Short-term noise factors  
- Behavioural or institutional constraints  
- Measurement or data lags  
- Consensus blind spots  

---

## 3. Strategy Structure

### 3.1 Portfolio Architecture
- **Sleeve Definitions**
  - Core sleeve  
  - Tactical / satellite sleeve(s)  
- **Purpose of Each Sleeve**
- **Risk Role of Each Sleeve**
  - Stabiliser / amplifier / convexity provider  

### 3.2 Allocation Bands
For each sleeve:
- **Target Range (%)**
- **Hard Limits**
- **Rebalancing Rules**
- **Conditions for Band Breach**

### 3.3 Instrument Roles
For each instrument:
- **Instrument Name**
- **Ticker / Identifier**
- **Role in Portfolio**
- **Primary Risk Exposure**
- **Correlation Intent**
- **Reason for Inclusion**

---

## 4. Deployment & Execution Framework

### 4.1 Entry Strategy
- Lump sum vs staged
- Use of volatility
- Macro or price-based triggers

### 4.2 Scaling Rules
- Add conditions
- Trim conditions
- Stop / pause conditions

### 4.3 Exit Strategy
- Structural exit signals
- Late-cycle indicators
- Thesis invalidation triggers

---

## 5. Scenario Framework

### 5.1 Scenario Definitions
Minimum of three:
- Bear / Downside  
- Base / Neutral  
- Bull / Upside  

For each scenario:
- Macro assumptions  
- Demand assumptions  
- Supply assumptions  
- Policy / geopolitical assumptions  

### 5.2 Scenario Probabilities
- Explicit probability per scenario
- Rationale for weighting
- Conditions that would shift probabilities

### 5.3 Price / Valuation Paths
For each scenario:
- Spot anchor
- Expected range
- Terminal assumptions
- Path dependency notes

---

## 6. Return & Risk Modelling Assumptions

### 6.1 Return Expectations
- Asset-level expected returns
- Sleeve-level expected returns
- Probability-weighted outcomes

### 6.2 Volatility & Drawdowns
- Expected volatility ranges
- Peak-to-trough drawdowns
- Asymmetry assumptions

### 6.3 Correlation Assumptions
- Within-strategy correlations
- Cross-asset correlations
- Regime-dependent behaviour

---

## 7. Risk Framework

### 7.1 Key Risks
For each risk:
- **Risk Name**
- **Transmission Channel**
- **Affected Assets**
- **Mitigation Mechanism**

Typical categories:
- Macro / recession  
- Policy / regulation  
- Supply disruption  
- Demand shock  
- Execution / operational  
- Concentration risk  

### 7.2 Thesis Invalidation Criteria
Explicit conditions under which:
- Position sizing is reduced
- Strategy is paused
- Strategy is terminated

---

## 8. Strategy Monitoring Inputs

### 8.1 Quantitative Signals
- Price levels
- Volatility
- Inventories / balances
- Cost curves
- Spreads / arbitrage signals

### 8.2 Fundamental Indicators
- Demand indicators
- Supply growth metrics
- Capex cycles
- Project pipelines

### 8.3 Event-Driven Triggers
- Policy announcements
- Earnings / production updates
- Geopolitical events
- Supply disruptions

---

## 9. Strategy Update & Versioning

### 9.1 Update Log Structure
Each update must record:
- Update date
- Variables changed
- Old assumption
- New assumption
- Reason for change

### 9.2 Re-baselining Rules
- When spot prices move materially
- When probabilities change
- When regime shifts occur

---

## 10. Intended Use by Models & Agents

### 10.1 Model Consumption Rules
- Treat assumptions as illustrative, not forecasts
- Use scenarios for stress-testing
- Preserve allocation bands unless explicitly overridden

### 10.2 Agent Responsibilities
- Monitor inputs
- Flag probability shifts
- Recommend tactical adjustments
- Detect thesis erosion

### 10.3 Integration Context
- Portfolio construction layer
- Risk aggregation
- Cross-strategy correlation analysis

---

## 11. Constraints & Disclaimers
- No implicit leverage unless specified
- No forecasting guarantees
- Strategy assumptions are conditional and revisable
- Strategy outputs are inputs to decision-making, not decisions
