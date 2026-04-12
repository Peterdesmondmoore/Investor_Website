# Silver Market Analyst Technical Documentation

This document explains the implementation behind `ia_explained/silver_market_analyst.html` and the silver market-analysis stack in `C:\Users\peter\OneDrive\Documents\GitHub\Investor_Anatomy_Code`. It follows the code contracts, prompt files, signal registry, and page wiring that currently exist in the repository.

Where the IA Explained Sankey simplifies a relationship, this document follows the underlying code instead of the simplified visual. That matters most for `Silver Regime State` and `Signal Change Monitor`, because the rendered graph is narrower than the actual execution path in `Investor_Anatomy_Code`.

## Page Summary

- Primary page file: `ia_explained/silver_market_analyst.html`
- Public IA Explained route: `/ia_explained/silver_market_analyst.html`
- Historical reporting file: `/ia_explained/Silver_regime_state_visualisation.jsonl`
- Major page sections:
  - Hero
  - Overview
  - Featured Insights
  - Historical Reporting View
  - Model Architecture
  - Footer
- Featured Insight cards configured in the page:
  - `Silver Outlook` -> `/signal_report/Silver_Outlook_Podcast.html`
  - `Execution Brief` -> `/signal_report/silver_execution_brief.html`
  - `Silver News 7 Days` -> `/signal_report/Podcast_Silver_News_Signal_7D.html`
  - `Silver News 2 Days` -> `/signal_report/Podcast_Silver_News_Signal_48H.html`
- Historical reporting loader:
  - External source: `/ia_explained/Silver_regime_state_visualisation.jsonl`
  - Embedded fallback record exists directly in the HTML inside `#reporting-history-embedded`
  - Reporting fields rendered:
    - `liquidity_regime`
    - `real_rate_regime`
    - `usd_regime`
    - `inflation_regime`
    - `stress_state`
    - `positioning_regime`
    - `flow_regime`
    - `market_expression_check`
    - `horizon_bias_1m`
    - `horizon_bias_3m`
    - `6-12 Month Bias`
    - `trade_call`
    - `price`
    - `commentary`

## Architecture Reading Notes

- The page-level Sankey shows only five direct edges into `Silver Regime State`, but the actual regime-state prompt consumes the full silver macro stack:
  - liquidity
  - real rates
  - USD
  - inflation
  - stress
  - positioning
  - flow
  - confirmatory pricing
- The page-level Sankey shows nearly every upstream signal feeding `Signal Change Monitor`, but the real execution-brief delta candidate list is narrower and does **not** include `macro_theme_global_inflation_fx_dynamics`.
- The node label has been renamed to `News Monitor`, but one fallback tooltip string in `silver_market_analyst.html` still says `Deduplicate, normalize, and enrich incoming news before compression.`
- The page defines the `Silver Price Research` node link as `/signal_report/silver_price_research/`, while the research module writes `signal_report/Silver_Price_Research.html` and the signal catalogue also points to `https://investoranatomy.com/signal_report/Silver_Price_Research.html`.

## Signals

This section groups the silver inputs by source family, because that is how the IA Explained page colors and organizes them. For each signal, the "Outbound connections" field follows the code-level consumers, not just the Sankey rendering.

### FRED

#### Real Interest Rate Trend Signal Monitor

- Name: `real_interest_rate_trend_signal`
- Description: This signal measures whether US 10-year real yields are moving above or below their medium-term trend and treats that move as a direct silver macro constraint. In the silver stack it is a first-order regime input because silver is highly sensitive to real-rate pressure through both monetary demand and the opportunity-cost channel.
- Methodology:

```json
{"signal_id":"real_interest_rate_trend_signal","signal_purpose":"To identify shifts in the directional impulse of real borrowing costs and the stance of monetary restrictiveness.","what_the_signal_measures":"The medium-term trend of the US 10-year inflation-indexed Treasury yield (TIPS).","primary_drivers":["Federal Reserve monetary policy","Real economic growth expectations","TIPS market liquidity","Inflation risk premia"],"interpretation_rules":[{"condition":"Real yield < 6-month moving average by > 0.05%","economic_meaning":"Easing real-rate pressure at the margin.","investment_implication":"Bullish; indicates more accommodative real financial conditions."},{"condition":"Real yield > 6-month moving average by > 0.05%","economic_meaning":"Tightening real-rate pressure at the margin.","investment_implication":"Bearish; indicates restrictive real financial conditions."},{"condition":"Real yield within +/- 0.05% of 6-month moving average","economic_meaning":"Real rates are stable relative to recent trend.","investment_implication":"Neutral; no clear directional impulse from real rates."}],"regime_bias_logic":"Bullish values imply an expansionary or accommodative regime; Bearish values imply a contractionary or restrictive regime.","confirmation_or_conflict_signals":"Nominal 10-year yields (DGS10), Breakeven inflation (T10YIE), 5-year real yields (DFII5) for curve slope, and market volatility/liquidity indicators.","known_limitations":"Lagging behavior due to moving average window; TIPS liquidity premia can distort yields during risk-off episodes; simple trend filters may produce false signals in high-volatility environments.","model_usage_notes":"Treat as a directional 'real-rates impulse' indicator. Cross-reference with term-structure (5yr vs 10yr) to distinguish policy repricing from long-run growth repricing. Discount abrupt moves during liquidity stress unless corroborated by nominal yields."}
```

- Outbound connections:
  - `silver_regime_state_deterministic`
  - `silver_execution_brief` as a delta candidate after the latest `silver_market_analyst` anchor

#### Federal Reserve Liquidity Composite Signal Monitor

- Name: `federal_reserve_liquidity_composite_signal`
- Description: This signal aggregates M2, Fed balance-sheet direction, reserve conditions, and ON RRP behavior into a liquidity regime classifier. In the silver stack it is a dominant macro driver because liquidity expansion can override weaker tactical inputs and create a higher-conviction support regime for precious metals.
- Methodology:

```json
{"signal_id":"federal_reserve_liquidity_composite_signal","signal_purpose":"Quantify aggregate US dollar liquidity availability driven by Federal Reserve balance sheet operations and broad money supply.","what_the_signal_measures":"The net expansion or contraction of the monetary base and private sector credit availability.","primary_drivers":["M2 Money Supply growth","Federal Reserve asset purchases and sales (QE/QT)","Commercial bank reserve levels","Overnight Reverse Repo (ON RRP) facility drainage"],"interpretation_rules":[{"condition":"Composite Score (LC) >= 0.75","economic_meaning":"Broad-based liquidity expansion across multiple channels.","investment_implication":"Risk-on bias; favorable for equities and credit."},{"condition":"Composite Score (LC) <= -0.75","economic_meaning":"Systemic liquidity withdrawal or tightening.","investment_implication":"Risk-off bias; defensive positioning recommended."},{"condition":"Falling ON RRP usage","economic_meaning":"Cash returning to the private banking system from the Fed.","investment_implication":"Incremental easing impulse regardless of total balance sheet size."},{"condition":"Rising Reserve Balances (WRESBAL)","economic_meaning":"Increased settlement liquidity for depository institutions.","investment_implication":"Supportive of lower short-term funding volatility."}],"regime_bias_logic":"Positive values indicate expansionary/risk-on regimes; negative values indicate contractionary/risk-off regimes.","confirmation_or_conflict_signals":"Real yields, credit spreads, USD Index, and volatility (VIX).","known_limitations":"M2 reporting lags, weekly data alignment noise, and sensitivity to Treasury General Account (TGA) volatility.","model_usage_notes":"Use as a primary regime filter; signal reliability is highest when at least three sub-components (M2, Assets, Reserves, RRP) show directional coherence."}
```

- Outbound connections:
  - `silver_regime_state_deterministic`
  - `silver_execution_brief` as a delta candidate

#### M2 Money Supply Signal Monitor

- Name: `m2_money_supply_signal`
- Description: This signal tracks broad money-supply expansion and short-horizon momentum to determine whether macro liquidity is accelerating or contracting. In the silver stack it operates as part of the liquidity regime block that helps determine whether silver is trading in a supportive monetary backdrop or a liquidity-withdrawal environment.
- Methodology:

```json
{"signal_id":"m2_money_supply_signal","signal_purpose":"Assess macro-liquidity conditions to determine risk-on or risk-off tilts for cyclical assets and precious metals.","what_the_signal_measures":"The growth rate and short-term momentum of the US broad money supply (M2).","primary_drivers":["Federal Reserve monetary policy","Commercial bank credit creation","Government fiscal spending and transfers"],"interpretation_rules":[{"condition":"M2 YoY > 6.0% and 3M Momentum > 1.0%","economic_meaning":"Aggressive monetary expansion and high liquidity.","investment_implication":"Bullish for cyclicals, precious metals, and risk assets."},{"condition":"M2 YoY < 2.0% or 3M Momentum < -1.0%","economic_meaning":"Monetary stagnation or contraction; liquidity withdrawal.","investment_implication":"Bearish for risk assets; defensive positioning favored."},{"condition":"M2 YoY between 2.0% and 6.0%","economic_meaning":"Stable or moderate liquidity growth.","investment_implication":"Neutral macro environment; trend-following or idiosyncratic factors dominate."}],"regime_bias_logic":"Rising values imply expansionary/risk-on regimes; falling or low values imply slowdown/risk-off regimes.","confirmation_or_conflict_signals":"Federal Reserve Liquidity Composite, credit spreads, USD index, and inflation expectations.","known_limitations":"Monthly reporting frequency causes lag; subject to data revisions; 3-month momentum can be volatile/noisy.","model_usage_notes":"Apply 'worst-of' logic for risk control; if either level or momentum is Bearish, the overall signal is Bearish. Primary input for liquidity-driven asset allocation models."}
```

- Outbound connections:
  - `silver_regime_state_deterministic`
  - `silver_execution_brief` as a delta candidate

#### Explicit Neutral Rate R Proxy Signal Monitor

- Name: `explicit_neutral_rate_r_proxy_signal`
- Description: This signal estimates whether policy is running above, near, or below a market-implied neutral real rate. In the silver system it is part of the liquidity-and-rates block that helps distinguish whether current policy settings are suppressing or supporting silver through the financial-conditions channel.
- Methodology:

```json
{"signal_id":"explicit_neutral_rate_r_proxy_signal","signal_purpose":"To provide a market-anchored context for the neutral real interest rate (r*) to determine if current monetary policy is restrictive, neutral, or accommodative.","what_the_signal_measures":"The distance (stance_gap) between the inflation-adjusted policy rate and a composite market-implied neutral rate.","primary_drivers":["10-Year Treasury Real Yields (TIPS)","10-Year Breakeven Inflation","Federal Funds Effective Rate","10-Year Term Premia"],"interpretation_rules":[{"condition":"stance_gap >= +0.50","economic_meaning":"Restrictive policy stance","investment_implication":"Ongoing headwinds to growth and tighter financial conditions."},{"condition":"-0.50 < stance_gap < +0.50","economic_meaning":"Near neutral policy stance","investment_implication":"Policy aligned with market neutral; monitor drift and macro momentum for direction."},{"condition":"stance_gap <= -0.50","economic_meaning":"Accommodative policy stance","investment_implication":"Support for growth and risk assets; potential for inflation persistence."},{"condition":"drift > +0.10","economic_meaning":"Rising neutral rate context","investment_implication":"Reduces restrictiveness of current rates; supports 'higher for longer' narrative."},{"condition":"drift < -0.10","economic_meaning":"Falling neutral rate context","investment_implication":"Increases restrictiveness of current rates; strengthens case for policy easing."}],"regime_bias_logic":"Positive/Rising stance_gap values indicate a restrictive/slowdown regime; Negative/Falling values indicate an accommodative/expansionary regime.","confirmation_or_conflict_signals":"Inflation momentum, economic slack (unemployment/output gap), financial stress indices, and liquidity indicators.","known_limitations":"Market-implied r* includes liquidity/risk premia; breakevens reflect risk premia not just expectations; term premium model revisions; 10-year horizon may mismatch near-term policy cycles.","model_usage_notes":"Use stance_gap to categorize 'on hold' policy into economic regimes. Prioritize multi-week persistence over daily market noise. Cross-reference with growth indicators to validate restrictiveness impact."}
```

- Outbound connections:
  - `silver_regime_state_deterministic`
  - `silver_execution_brief` as a delta candidate

#### USD Index Signal Monitor

- Name: `usd_index_signal`
- Description: This signal classifies whether the broad USD is strengthening, weakening, or transitioning relative to trend and momentum thresholds. In the silver stack it is a direct macro driver because silver is highly conditioned by the USD channel, especially when liquidity support and real-rate headwinds conflict.
- Methodology:

```json
{"signal_id":"usd_index_signal","signal_purpose":"To identify the regime of U.S. dollar strength or weakness as a proxy for global financial conditions and risk sentiment.","what_the_signal_measures":"The relative value of the USD against a broad basket of trading partner currencies, reflecting global liquidity and dollar-denominated funding costs.","primary_drivers":["Interest rate differentials","Global risk appetite","Relative economic growth","Safe-haven demand"],"interpretation_rules":[{"condition":"USD > 12M MA (+0.5% band) AND 6M Change > 5%","economic_meaning":"Bullish USD regime with reinforcing momentum.","investment_implication":"Tightening financial conditions; headwind for commodities and non-USD assets."},{"condition":"USD < 12M MA (-0.5% band) AND 6M Change < -5%","economic_meaning":"Bearish USD regime with reinforcing downside momentum.","investment_implication":"Easing financial conditions; tailwind for commodities and risk assets."},{"condition":"Momentum and level conflict OR price within hysteresis band","economic_meaning":"Neutral/Transition state.","investment_implication":"Indeterminate regime; monitor for volatility expansion or trend initiation."}],"regime_bias_logic":"Bullish values indicate risk-off/tightening; Bearish values indicate risk-on/expansion.","confirmation_or_conflict_signals":"Confirm with liquidity, credit spreads, and interest rates. Conflict with rising commodities or falling volatility during USD Bullish regimes.","known_limitations":"Lagging behavior due to moving average and hysteresis; sensitivity to end-of-month price spikes; static thresholds may not adapt to volatility shifts.","model_usage_notes":"Use discrete labels for regime classification and continuous metrics (distance to MA, 6M change) to assess trend maturity and mean-reversion risk."}
```

- Outbound connections:
  - `silver_regime_state_deterministic`
  - `silver_execution_brief` as a delta candidate

#### Inflation Term Structure Signal Monitor

- Name: `inflation_term_structure_signal`
- Description: This signal measures how breakevens and real-yield structure combine into a reflationary, disinflationary, or neutral market regime. In the silver stack it helps decide whether inflation credibility is adding support to silver or removing one of the asset's macro tailwinds.
- Methodology:

```json
{"signal_id":"inflation_term_structure_signal","signal_purpose":"Identify shifts in market-priced inflation regimes and real financial conditions relative to a rolling historical baseline.","what_the_signal_measures":"The aggregate state of market-implied inflation compensation and the ease of real interest rate environments.","primary_drivers":["Inflation expectations","Inflation risk premia","TIPS liquidity","Real interest rates","Hedging demand"],"interpretation_rules":[{"condition":"Composite > 0.75","economic_meaning":"Reflationary; inflation compensation and real-rate easing are elevated versus history.","investment_implication":"Favors pro-cyclical assets, commodities, and value over growth."},{"condition":"Composite < -0.75","economic_meaning":"Disinflationary; low inflation compensation and high real yields indicate tight conditions.","investment_implication":"Favors defensive positioning and assets sensitive to lower inflation expectations."},{"condition":"Absolute Composite < 0.75","economic_meaning":"Neutral; market pricing is within normal historical bands.","investment_implication":"Treat as a weak conditioning variable; no strong directional bias."}],"regime_bias_logic":"Rising values imply reflationary expansion (risk-on); falling values imply disinflationary slowdown or tightening (risk-off).","confirmation_or_conflict_signals":"Liquidity indicators, credit spreads, survey-based inflation expectations, and volatility.","known_limitations":"TIPS liquidity distortions during market stress can create false disinflation signals; monthly resampling introduces recognition lag.","model_usage_notes":"Condition macro factor models on regime. Distinguish between 'real-rate easing' (driven by inverted real yields) and 'inflation-premium' (driven by breakevens) to refine asset tilts."}
```

- Outbound connections:
  - `silver_regime_state_deterministic`
  - `silver_execution_brief` as a delta candidate

#### Market Implied Inflation Signal Monitor

- Name: `market_implied_inflation_signal`
- Description: This signal converts breakeven inflation and related market pricing into a clean inflation-compensation regime. In the silver stack it complements the term-structure signal by indicating whether the market is actively repricing inflation higher, anchoring it, or pricing disinflation.
- Methodology:

```json
{"signal_id":"market_implied_inflation_signal","signal_purpose":"Quantify market-based inflation compensation and forward-looking inflation expectations.","what_the_signal_measures":"The spread between nominal Treasuries and TIPS, representing the sum of expected inflation, inflation risk premia, and liquidity premia.","primary_drivers":["10-Year Breakeven Inflation Rate (T10YIE)","5-Year 5-Year Forward Inflation Expectation Rate (T5YIFR)","TIPS liquidity conditions","Monetary policy interventions (QE)","Nominal vs. real yield curve dynamics"],"interpretation_rules":[{"condition":"z-score >= 1.0 (RISING)","economic_meaning":"Inflation compensation is accelerating relative to the 10-year historical distribution.","investment_implication":"Expect higher inflation pricing and increased probability of restrictive monetary policy; upward pressure on real yields."},{"condition":"-0.5 < z-score < 1.0 (STABLE)","economic_meaning":"Inflation expectations are range-bound and consistent with long-term norms.","investment_implication":"Neutral signal; prioritize realized inflation data (CPI/PPI) and liquidity signals for directional conviction."},{"condition":"z-score <= -0.5 (FALLING)","economic_meaning":"Market is pricing disinflation or experiencing a flight-to-quality event.","investment_implication":"Disinflationary bias; potential for lower yields or risk-off sentiment compression."}],"regime_bias_logic":"Rising values imply inflationary expansion or policy tightening; falling values imply disinflation or risk-off flight-to-quality.","confirmation_or_conflict_signals":"Fed Inflation Signal (realized), CPI vs PPI (momentum), Liquidity Regime (distortions), Real Yields.","known_limitations":"TIPS liquidity premiums artificially depress breakevens during market stress; QE and supply shifts distort term premia; signal includes non-inflation risk premia.","model_usage_notes":"Interpret as 'inflation compensation' rather than a pure forecast. Discount 'FALLING' signals if the Liquidity Regime is flagged as 'stressed'. Extremes (|z| >= 2) indicate market dislocation rather than linear trend."}
```

- Outbound connections:
  - `silver_regime_state_deterministic`
  - `silver_execution_brief` as a delta candidate

#### Policy Relevant Inflation PCE Signal Monitor

- Name: `policy_relevant_inflation_pce_signal`
- Description: This signal reframes PCE inflation into a policy-relevant regime score that tracks whether inflation is significantly above target, below target, or accelerating from neutral. In the silver stack it acts as a real-economy and central-bank confirmation layer inside the inflation regime block.
- Methodology:

```json
{"signal_id":"policy_relevant_inflation_pce_signal","signal_purpose":"To monitor inflation relative to the Federal Reserve's 2% target and historical volatility to anticipate monetary policy shifts.","what_the_signal_measures":"Aggregate consumer price pressure and underlying inflation persistence.","primary_drivers":["Consumer demand","Energy and food price shocks","Supply chain costs","Labor market tightness","Monetary policy transmission"],"interpretation_rules":[{"condition":"Score > 0.75","economic_meaning":"Inflation significantly above historical trend.","investment_implication":"Hawkish policy bias; risk-off for long-duration assets."},{"condition":"Score < -0.75","economic_meaning":"Inflation significantly below historical trend.","investment_implication":"Dovish policy bias; potential disinflationary or deflationary risk."},{"condition":"Momentum > 0 while Score is Neutral","economic_meaning":"Inflation is accelerating toward a hot regime.","investment_implication":"Early warning of tightening cycle; reduce duration exposure."},{"condition":"Level_pp > 0","economic_meaning":"Inflation is exceeding the 2% policy target.","investment_implication":"Structural pressure on central bank to maintain restrictive rates."}],"regime_bias_logic":"Rising values indicate inflationary expansion or overheating; falling values indicate disinflationary slowdown or transition to contraction.","confirmation_or_conflict_signals":"CPI, Dallas Fed Trimmed Mean PCE, Unemployment Rate, 10Y Breakeven Inflation Rates.","known_limitations":"Subject to material BEA revisions; monthly reporting lag; z-scores may be distorted by structural breaks in inflation volatility.","model_usage_notes":"Prioritize Momentum for lead-lag analysis. Use the Confidence Band to filter noise near regime thresholds. Treat 'Low Confidence' flags as a signal to wait for data stabilization before rebalancing."}
```

- Outbound connections:
  - `silver_regime_state_deterministic`
  - `silver_execution_brief` as a delta candidate

#### Financial Stress Index Signal Monitor

- Name: `financial_stress_index_signal`
- Description: This signal classifies the market into risk-on or risk-off conditions using the STLFSI stress complex and related sub-pillars. In the silver stack it can activate a stress override that partly neutralizes USD or real-rate suppression and changes the meaning of tactical price action.
- Methodology:

```json
{"signal_id":"financial_stress_index_signal","signal_purpose":"Classify market environments into risk-on or risk-off regimes based on systemic financial stress levels.","what_the_signal_measures":"Aggregate financial system tightness, funding stress, and market risk aversion relative to long-run averages.","primary_drivers":["Equity implied volatility (VIX)","Corporate credit risk premiums (High Yield OAS)","Interbank funding liquidity (TED spread)"],"interpretation_rules":[{"condition":"STLFSI4 > 0 OR Robust Z-score > 0.5","economic_meaning":"Elevated financial stress and tightening conditions.","investment_implication":"Bearish/Risk-off; reduce cyclical risk exposure."},{"condition":"STLFSI4 < 0 AND Robust Z-score < -0.5","economic_meaning":"Loose financial conditions and low systemic stress.","investment_implication":"Bullish/Risk-on; support for risk-seeking positioning."},{"condition":"Neither Bullish nor Bearish criteria met","economic_meaning":"Normalised stress levels or conflicting trend/level data.","investment_implication":"Neutral; maintain baseline exposure."}],"regime_bias_logic":"Positive or rising values indicate a transition to risk-off, contractionary, or tightening regimes; negative or falling values indicate expansionary or risk-on regimes.","confirmation_or_conflict_signals":"Confirm with liquidity, credit, and volatility signals. Conflict with growth/inflation signals may indicate temporary market dislocation or policy-driven distortions.","known_limitations":"Weekly reporting frequency; potential data staleness in sub-components (e.g., TED spread); sensitivity to threshold whipsaws near zero.","model_usage_notes":"Use sustained Bearish signals as a macro headwind rather than a precise timing tool. Prioritize rapid Z-score surges for tactical risk control. Treat LOW confidence flags as a prompt to ignore sub-pillar drivers and rely solely on the headline index."}
```

- Outbound connections:
  - `silver_regime_state_deterministic`
  - `silver_execution_brief` as a delta candidate

#### Financial Stress Composite Signal Monitor

- Name: `financial_stress_composite_signal`
- Description: This signal combines broad volatility, credit stress, and curve information into a unified financial-stress regime measure. In the silver stack it works alongside the stress index and VIX to decide whether the stress override is active and how much weight to put on tactical exhaustion versus safe-haven support.
- Methodology:

```json
{"signal_id":"financial_stress_composite_signal","signal_purpose":"Quantify aggregate U.S. financial system strain to identify shifts in risk regimes and funding conditions.","what_the_signal_measures":"The intersection of broad market volatility, corporate credit risk premia, and monetary policy-driven yield curve inversion.","primary_drivers":["Funding liquidity","Corporate default risk","Monetary policy expectations","Market volatility"],"interpretation_rules":[{"condition":"Composite > 0.75","economic_meaning":"High Stress: Materially elevated funding and credit strain.","investment_implication":"Risk-off; expect tightened credit availability and reduced risk appetite."},{"condition":"Composite < -0.75","economic_meaning":"Low Stress: Accommodative financial conditions.","investment_implication":"Risk-on; expansionary bias with low risk premia."},{"condition":"-0.75 <= Composite <= 0.75","economic_meaning":"Neutral: Conditions align with historical norms.","investment_implication":"Market stability; monitor for directional persistence or sub-component divergence."}],"regime_bias_logic":"Rising values indicate a transition toward risk-off and economic slowdown; falling values indicate a transition toward risk-on and expansion.","confirmation_or_conflict_signals":"VIX, TED Spread, Credit Spreads, Yield Curve Slope.","known_limitations":"Monthly frequency misses intra-month spikes; potential double-counting between STLFSI4 and HY OAS; lagging nature of yield curve inversion.","model_usage_notes":"Analyze sub-component contributions to distinguish between credit-led stress (HY OAS) and policy-led stress (Inversion). Use CompositeConfidence flag to adjust signal weighting in multi-signal models."}
```

- Outbound connections:
  - `silver_regime_state_deterministic`
  - `silver_execution_brief` as a delta candidate

### COT

#### USD Individual Market Analysis Monitor

- Name: `usd_individual_market_analysis`
- Description: This signal uses CoT-style futures positioning to interpret the USD as a systemic liquidity and macro-regime instrument rather than just an FX pair. In the silver stack it complements the broad USD index by adding crowding, reversal-risk, and liquidity-regime context.
- Methodology:

```json
{"signal_id":"usd_individual_market_analysis","signal_purpose":"Measures global USD liquidity conditions and systemic financial tightening or easing pressure.","what_the_signal_measures":"Global funding stress, balance-sheet capacity, and macro policy transmission via the USD basket.","primary_drivers":["Federal Reserve policy expectations","Global USD funding demand","Managed money macro positioning","Cross-asset capital allocation"],"interpretation_rules":[{"condition":"Extreme long positioning","economic_meaning":"Global liquidity regime saturation and tight financial conditions.","investment_implication":"Elevated downside risk for risk assets; high sensitivity to liquidity shifts."},{"condition":"Extreme short positioning","economic_meaning":"Reflation consensus and easing global funding stress.","investment_implication":"Supportive for commodities and emerging markets; upside convexity."},{"condition":"Multi-week flow reversal","economic_meaning":"Inflection in the global liquidity regime.","investment_implication":"Signals imminent global risk re-pricing regardless of absolute levels."},{"condition":"High positioning tension score","economic_meaning":"Instability in the current liquidity regime.","investment_implication":"Heightened fragility and potential for asymmetric cross-asset volatility."}],"regime_bias_logic":"Rising long positioning implies a risk-off/tightening regime; rising short positioning implies a risk-on/easing/reflationary regime.","confirmation_or_conflict_signals":"Federal Reserve policy guidance, global liquidity indicators, financial conditions indices, and EM equity performance.","known_limitations":"Commercial positioning is primarily hedging and lacks directional signal; flows are more predictive than absolute net levels.","model_usage_notes":"Interpret as a systemic liquidity gauge rather than idiosyncratic FX direction. Use stretch and flow momentum to detect cross-asset asymmetry and regime shifts."}
```

- Outbound connections:
  - `silver_regime_state_deterministic`
  - `silver_execution_brief` as a delta candidate

#### Silver Individual Market Analysis Monitor

- Name: `silver_individual_market_analysis`
- Description: This is the main silver CoT positioning signal and the page's primary futures-market positioning anchor. It measures speculative crowding, hedger balance, flow momentum, and divergence versus price so the silver stack can distinguish between supportive positioning, fragile crowding, and squeeze-prone setups.
- Methodology:

```json
{"signal_id":"silver_individual_market_analysis","signal_purpose":"To identify market participant dominance, positioning fragility, and tactical reversal setups using Commitment of Traders (CoT) data.","what_the_signal_measures":"Speculative and commercial positioning concentration, momentum of capital flows, and positioning extremes relative to historical norms.","primary_drivers":["Speculative Net Positioning","Hedger Net Positioning","Open Interest","4-week Flow Momentum","Price-Positioning Divergence"],"interpretation_rules":[{"condition":"Spec Net % OI is positive","economic_meaning":"Speculative traders are net long and in control of the trend.","investment_implication":"Bullish sentiment; monitor for crowding as values increase."},{"condition":"|z-score| >= 2","economic_meaning":"Positioning is at a historical extreme (crowded).","investment_implication":"High fragility; elevated risk of trend exhaustion or sharp reversal."},{"condition":"Flow opposes net direction","economic_meaning":"Traders are de-risking or conviction is fading.","investment_implication":"Early warning of a potential trend turn or consolidation."},{"condition":"Price up AND positioning momentum down","economic_meaning":"Rally is losing sponsorship from speculative buyers.","investment_implication":"Vulnerability rising; avoid adding to longs."},{"condition":"Price down AND positioning momentum up","economic_meaning":"Selloff is losing sponsorship from speculative sellers.","investment_implication":"Bottoming risk rising; monitor for squeeze potential."}],"regime_bias_logic":"High positive z-scores indicate a crowded long/expansion regime prone to exhaustion; high negative z-scores indicate a crowded short/slowdown regime prone to upside squeezes.","confirmation_or_conflict_signals":"Price action (yfinance), Hedger extremes (mean reversion), 4-week flow acceleration, and Open Interest changes.","known_limitations":"Weekly reporting lag (CoT data is delayed), persistent extremes in strong trends, and noise in low-depth markets.","model_usage_notes":"Treat as a measure of market fragility and setup quality rather than a deterministic timing trigger. Prioritize flow for tactical shifts and z-scores for regime identification."}
```

- Outbound connections:
  - `silver_regime_state_deterministic`
  - `silver_market_analyst`
  - `Silver_Analyst_Podcast`
  - `silver_execution_brief` as a delta candidate
  - `silver_outlook_podcast`

#### Cross Sector Positioning Monitor

- Name: `cross_sector_positioning`
- Description: This signal aggregates speculative crowding and unwind risk across the broader futures complex so that silver is not interpreted in isolation. In the silver stack it is used to distinguish silver-specific opportunity from sector-wide crowding and broader macro unwind risk.
- Methodology:

```json
{"signal_id":"cross_sector_positioning","signal_purpose":"Identify systemic speculative imbalances and potential for sector-wide position liquidations.","what_the_signal_measures":"The degree of consensus and stress within macro-sector futures positioning.","primary_drivers":["Speculative flow direction","Commercial hedger positioning","Market-level crowding extremes","4-week flow momentum"],"interpretation_rules":[{"condition":"spec_crowded_long_share >= 0.40","economic_meaning":"Broad speculative consensus","investment_implication":"High risk of sharp reversal or trend exhaustion."},{"condition":"hedger_pressure_share >= 0.40","economic_meaning":"Systemic commercial hedging","investment_implication":"Defensive regime; potential for increased volatility."},{"condition":"unwind_risk_share >= 0.30","economic_meaning":"Stretched positioning vs adverse flow","investment_implication":"High probability of a systemic short or long squeeze."},{"condition":"avg_spec_zscore is extreme","economic_meaning":"Sector-wide positioning outlier","investment_implication":"Mean reversion candidate."}],"regime_bias_logic":"High crowding and unwind risk indicate trend exhaustion or transition; high hedger pressure indicates defensive or risk-off positioning.","confirmation_or_conflict_signals":"Trend signals, volatility indices, liquidity metrics, macro composites.","known_limitations":"CoT data is lagged; static thresholds may miss structural shifts; sector mapping relies on naming heuristics.","model_usage_notes":"Treat as a contrarian or risk-management signal when thresholds are breached. Best used to flag sectors prone to cascading liquidations."}
```

- Outbound connections:
  - `silver_regime_state_deterministic`
  - `silver_execution_brief` as a delta candidate

#### Specs Vs Hedgers Divergence Reversal Risk Monitor

- Name: `specs_vs_hedgers_divergence_reversal_risk`
- Description: This signal measures whether speculative conviction and commercial conviction are diverging enough to imply structural instability or reversal risk. In the silver stack it is a positioning-fragility input that helps distinguish healthy trend sponsorship from unstable disagreement.
- Methodology:

```json
{"signal_id":"specs_vs_hedgers_divergence_reversal_risk","signal_purpose":"Identify structural market instability and potential price reversals by measuring the conviction-based disagreement between speculative and commercial participants.","what_the_signal_measures":"The breadth of futures markets where speculators and hedgers hold opposing, high-conviction positions (divergent z-scores).","primary_drivers":["Speculator positioning z-scores","Commercial hedger positioning z-scores","Market breadth of positioning divergence"],"interpretation_rules":[{"condition":"Robust Z-Score > 1.5","economic_meaning":"High Divergence Risk; speculators and hedgers are pulling in opposite directions with extreme conviction.","investment_implication":"High risk of volatility, position unwinds, or macro regime transition; potential trend exhaustion."},{"condition":"Robust Z-Score 0.5 to 1.5","economic_meaning":"Moderate Divergence Risk; elevated disagreement and emerging internal market tension.","investment_implication":"Monitor for early-stage instability; reduce aggressive trend exposure."},{"condition":"Robust Z-Score -0.5 to 0.5","economic_meaning":"Normal; positioning alignment is typical across participants.","investment_implication":"Neutral; no immediate structural threat from positioning imbalances."},{"condition":"Robust Z-Score < -0.5","economic_meaning":"Low Divergence; unusually high alignment between speculators and hedgers.","investment_implication":"Strong macro consensus; high probability of trend persistence."}],"regime_bias_logic":"Rising values imply transition or slowdown regimes (instability); falling or low values imply expansion or trend-following regimes (consensus).","confirmation_or_conflict_signals":"Market Tone, Hedger Pressure, Sector Flow, Volatility (VIX/MOVE).","known_limitations":"Requires significant z-score magnitudes on both sides to trigger; noisy in thinly traded markets; lagging due to CoT reporting frequency.","model_usage_notes":"Use as a contrarian overlay for momentum signals. High divergence suggests speculative narratives are detaching from commercial fundamentals."}
```

- Outbound connections:
  - `silver_regime_state_deterministic`
  - `silver_execution_brief` as a delta candidate

#### Hedger Pressure Indicator Monitor

- Name: `hedger_pressure_indicator`
- Description: This signal uses commercial positioning to infer physical tightness or oversupply pressure and acts as the silver stack's flow-regime anchor. It matters because silver's macro picture can be supportive while commercial pressure or tightness materially changes the likely path and volatility of price.
- Methodology:

```json
{"signal_id":"hedger_pressure_indicator","signal_purpose":"Identify physical market supply and demand imbalances through commercial participant positioning.","what_the_signal_measures":"Aggregate commercial sentiment reflecting production expansion versus inventory shortages.","primary_drivers":["Commercial net positioning","Hedger z-scores","Open interest share","Physical inventory levels","Forward pricing expectations"],"interpretation_rules":[{"condition":"Hedger Z-score <= -1.0 (Deep Short)","economic_meaning":"Supply expansion or bearish forward pricing by producers.","investment_implication":"Bearish; expect downward price pressure or oversupply."},{"condition":"Hedger Z-score >= 1.0 (Deep Long)","economic_meaning":"Physical shortage or inventory stress among consumers.","investment_implication":"Bullish; expect upward price pressure or scarcity."},{"condition":"Robust Z-score > 1.5","economic_meaning":"Extreme supply or shortage regime.","investment_implication":"High conviction signal; potential for trend exhaustion or sharp regime shift."},{"condition":"Robust Z-score > 0.75","economic_meaning":"Moderate supply or shortage pressure.","investment_implication":"Trend confirmation; sustained fundamental bias."}],"regime_bias_logic":"Rising shortage pressure (longs) implies inflationary/expansionary bias; rising supply pressure (shorts) implies disinflationary/slowdown bias.","confirmation_or_conflict_signals":"Speculative crowding (CoT), physical inventory data, spot-futures basis, commodity volatility.","known_limitations":"Lagging nature of CoT data, cross-sector behavioral variance, sensitivity to static thresholds, potential data gaps in open interest.","model_usage_notes":"Acts as a fundamental anchor; use to identify divergences where speculators are positioned against commercial reality (hedgers)."}
```

- Outbound connections:
  - `silver_regime_state_deterministic`
  - `silver_execution_brief` as a delta candidate

#### Squeeze Exhaustion Risk Indicators Monitor

- Name: `squeeze_exhaustion_risk_indicators`
- Description: This signal compresses cross-market squeeze and exhaustion breadth into a tactical fragility indicator. In the silver stack it is the second half of the flow regime and helps determine whether price behavior should be interpreted as healthy continuation, unstable extension, or a late-cycle exhaustion move.
- Methodology:

```json
{"signal_id":"squeeze_exhaustion_risk_indicators","signal_purpose":"Quantify cross-market tactical fragility and trend maturity within the futures complex.","what_the_signal_measures":"The aggregate breadth of markets experiencing forced liquidation risk (squeeze) or momentum decay (exhaustion).","primary_drivers":["Market-level squeeze flags","Market-level exhaustion flags","CoT positioning crowding","Cross-market breadth of tactical stress"],"interpretation_rules":[{"condition":"Squeeze_z >= 1.0","economic_meaning":"High Squeeze Risk","investment_implication":"High vulnerability to forced covering and sharp, flow-driven price spikes or reversals."},{"condition":"Exhaustion_z >= 1.0","economic_meaning":"High Exhaustion Risk","investment_implication":"Widespread trend fatigue; high probability of trend stalling or reversing."},{"condition":"0.5 <= z < 1.0","economic_meaning":"Moderate Risk","investment_implication":"Growing tactical fragility; monitor for confirmation from volatility or liquidity signals."},{"condition":"z < 0.5","economic_meaning":"Normal","investment_implication":"Tactical risks are within historical medians; prevailing trends are less likely to face immediate structural failure."}],"regime_bias_logic":"High values indicate a transition or late-cycle regime; rising values suggest a shift toward risk-off or trend-reversal environments.","confirmation_or_conflict_signals":"Volatility (VIX/MOVE), Liquidity composites, Credit spreads, and aggregate Positioning Crowding.","known_limitations":"Sector-agnostic (ignores concentration), dependent on upstream flag accuracy, lagging CoT reporting frequency, static z-score thresholds.","model_usage_notes":"Use as a contrarian filter for trend-following models. High exhaustion breadth should trigger tighter stops or reduced exposure. High squeeze breadth indicates potential for non-fundamental volatility."}
```

- Outbound connections:
  - `silver_regime_state_deterministic`
  - `silver_execution_brief` as a delta candidate

### Investor Anatomy

#### Global Inflation And FX Dynamics

- Name: `macro_theme_global_inflation_fx_dynamics`
- Description: This is the silver stack's cross-asset macro-theme overlay for global inflation and FX transmission. It is not a raw data monitor in the same sense as FRED or CoT; it is an Investor Anatomy thematic output that frames how inflation and FX conditions interact to shape commodity behavior.
- Methodology: `NA`
- Outbound connections:
  - `silver_regime_state_deterministic`

### YFinance

#### Market Volatility VIX Signal Monitor

- Name: `market_volatility_vix_signal`
- Description: This signal measures implied US equity-market volatility and treats it as a tactical risk thermometer for silver. In the silver stack it has unusual importance because it participates in the regime-state stress block, enters the analyst layer directly, and also anchors the tactical execution brief.
- Methodology:

```json
{"signal_id":"market_volatility_vix_signal","signal_purpose":"Quantify short-term equity market risk sentiment and tail-risk expectations to calibrate risk-on/off positioning.","what_the_signal_measures":"Forward-looking equity market uncertainty and the cost of downside protection relative to historical norms.","primary_drivers":["S&P 500 option-implied variance","Downside hedging demand (skew)","Realized price volatility","Market liquidity conditions"],"interpretation_rules":[{"condition":"VIX < 16 and MVS z-score < 0","economic_meaning":"CALM: Low perceived risk and stable market environment.","investment_implication":"Favor carry trades and risk-premia harvesting."},{"condition":"VIX between 20 and 30 or MVS z-score [0.5, 1.0)","economic_meaning":"ELEVATED: Rising uncertainty and precautionary hedging.","investment_implication":"Reduce aggressive exposure; monitor for trend reversal."},{"condition":"VIX >= 30 or MVS z-score >= 1.0","economic_meaning":"STRESSED: High market fear and active liquidation.","investment_implication":"Prioritize risk control, reduce position sizing, and implement hedging."},{"condition":"VIX >= 45 or MVS z-score >= 2.0 sustained for 5 days","economic_meaning":"CRISIS: Extreme panic and systemic liquidity pressure.","investment_implication":"Maximum defensive posture; expect high drawdown risk."},{"condition":"Implied Volatility significantly exceeds Realized Volatility","economic_meaning":"Expanding Volatility Risk Premium.","investment_implication":"Indicates tightening risk appetite; protection is expensive."}],"regime_bias_logic":"Rising values signal a transition toward risk-off and market contraction; falling values signal a transition toward risk-on and expansion.","confirmation_or_conflict_signals":"Confirm risk-off with widening Credit Spreads (HY OAS) and tightening Liquidity; conflict if VIX rises while USD and Real Yields remain soft.","known_limitations":"Month-end snapshots may miss intramonth volatility bursts; absolute VIX levels can undergo structural shifts over decades.","model_usage_notes":"Treat as a probabilistic risk thermometer rather than a directional timing tool. Use percentile ranks for cross-era stability and absolute levels for intuitive thresholding."}
```

- Outbound connections:
  - `silver_regime_state_deterministic`
  - `silver_market_analyst`
  - `Silver_Analyst_Podcast`
  - `silver_execution_brief` as both direct baseline and delta candidate context
  - `silver_outlook_podcast`

#### Silver Slv Pricing Monitor

- Name: `silver_slv_pricing`
- Description: This is the silver pricing decoder used throughout the stack. It translates SLV price action, volatility, volume, and range position into a silver-specific technical regime, and in the silver architecture it serves as both a confirmatory regime-state input and a direct analyst/execution input.
- Methodology:

```json
{"signal_id":"silver_slv_pricing","signal_purpose":"Translate generic pricing context into asset-specific guidance for silver exposure, emphasizing high beta, volatility clustering, and squeeze risk relative to gold.","what_the_signal_measures":"Trend, momentum, realized volatility, liquidity/volume, and 52-week positioning as a high-convexity precious metal regime indicator.","primary_drivers":["Risk sentiment and liquidity cycles","USD and real-rate shocks","Industrial-demand narrative shifts","Positioning/flow dynamics","Volatility feedback loops"],"interpretation_rules":[{"condition":"Breakout above 50d/200d with high realized volatility","economic_meaning":"Momentum transition occurring in a fragile/high-convexity regime; follow-through can be violent in both directions","investment_implication":"Treat as tactical opportunity with tighter risk; scale-in rather than full size; avoid assuming smooth trend continuation."},{"condition":"High volatility percentile (e.g., >90%) regardless of trend","economic_meaning":"Regime instability and gap risk elevated; stop-outs and reversals more likely","investment_implication":"Reduce leverage and position sizing; use wider but fewer stops; avoid over-trading noise."},{"condition":"Volume percentile elevated with trend confirmation","economic_meaning":"Participation broadening; move more likely to be persistent relative to typical silver noise","investment_implication":"Upgrade confidence modestly; prefer multi-day confirmation rather than single-session spikes."},{"condition":"Trading mid-range within 52-week band while volatility remains high","economic_meaning":"Chop/mean-reverting regime with poor signal-to-noise","investment_implication":"Downgrade conviction; wait for either volatility compression or directional break with confirmation."},{"condition":"Downtrend with stabilising volatility and improving 52-week position (rising from lows)","economic_meaning":"Base-building probability rising, but still vulnerable to macro shocks","investment_implication":"Allow only small exploratory adds after trend stabilises; require confirmation from trend/momentum turn."}],"regime_bias_logic":"Silver pricing context acts as a convexity and regime-instability input; large moves reflect elevated tail-risk rather than linear trends.","confirmation_or_conflict_signals":"Gold regime, USD/real-rate context, and broad risk/liquidity indicators.","known_limitations":"Dominated by flow/positioning; volatility clustering creates false signals; technical regimes flip quickly; data adjustments in proxies.","model_usage_notes":"Prioritise multi-week trend confirmation and volatility regime shifts. Treat volatility extremes as risk controls for sizing rather than directional calls. Avoid extrapolating single-day spikes."}
```

- Outbound connections:
  - `silver_regime_state_deterministic` as confirmatory market-expression input
  - `silver_market_analyst`
  - `Silver_Analyst_Podcast`
  - `silver_execution_brief` as both direct baseline and delta candidate context
  - `silver_outlook_podcast`
  - `Silver_regime_state_visualisation`

#### Metals Comparative Signal

- Name: `metals_comparative_signal`
- Description: This signal adds cross-metal relative-strength and rotation context so the silver stack can compare silver behavior with nearby metal regimes. The silver analyst prompt explicitly treats it as perspective only and forbids it from overriding silver-specific regime logic.
- Methodology: `NA`
- Outbound connections:
  - `silver_market_analyst`
  - `Silver_Analyst_Podcast`
  - `silver_execution_brief` as both direct baseline and delta candidate context
  - `silver_outlook_podcast`

### Blackrock

#### SLV ETF Flow Signal

- Name: `slv_etf_flow_signal`
- Description: This signal tracks ETF flow pressure through the SLV vehicle and uses it as an investment-demand proxy for silver. It is intentionally kept outside `Silver Regime State` on the page and in the regime-state prompt, but it is a direct tactical modifier for the analyst, execution, and outlook layers.
- Methodology: `NA`
- Outbound connections:
  - `silver_market_analyst`
  - `Silver_Analyst_Podcast`
  - `silver_execution_brief` as both direct baseline and delta candidate context
  - `silver_outlook_podcast`

### GPT

#### Silver Price Research

- Name: `Silver_Price_Research`
- Description: This is the GPT-assisted institutional price-target research layer for silver. It reads IA Researcher PDFs, extracts institution-level target rows, synthesizes the current target distribution, and then feeds that research context into the analyst, outlook, and historical-reporting layers.
- Methodology: `NA`
- Outbound connections:
  - `silver_market_analyst`
  - `Silver_Analyst_Podcast`
  - `silver_outlook_podcast`
  - `Silver_regime_state_visualisation`

#### Note On Gold Price Research

- The live silver architecture does **not** consume `Gold_Price_Research`.
- The actual GPT-linked research node used by `silver_market_analyst.html` is `Silver_Price_Research`.
- I am documenting the silver-connected module here to keep this file faithful to the implemented graph.

## News Monitor

`News Monitor` is the preprocessing and orchestration layer behind the page's news path. In the page graph it is one node, but in code it is a deterministic pipeline in `News_Signal/news_signal/news_signal_common.py` plus the silver wrappers `silver_news_signal.py` and `silver_news_signal_48h.py`.

### News Sources

The IA Explained page declares the following source set for silver news:

- `EIN News - Mining (Gold)`  
  High-frequency metals and mining wire headlines on projects, policy, and supply developments.
- `Mining.com`  
  Mining-industry reporting on operations, production, projects, and capital activity.
- `World Gold Council - Research`  
  Gold-market research used as broader precious-metals context.
- `CME Group - Metals Video`  
  Futures-market commentary on metals price action, volatility, and positioning.
- `Bank for International Settlements`  
  Central-bank, liquidity, and macro-financial policy context.
- `CFTC`  
  Regulatory and market-structure releases relevant to positioning and derivatives markets.
- `The Silver Institute`  
  Silver-specific supply, industrial demand, investment demand, and market-balance updates.
- `Yahoo Finance`  
  Broad market and company headline flow that can affect near-term risk tone.

### Deterministic Processing Steps

1. Load tagged article records from `Data\RSS\News_Outputs\rss_feed_items_matching_test_tagged_articles.jsonl`.
2. Normalize `Asset_Class` tags and keep only rows where the asset class contains `Silver`.
3. Normalize `article_date` into an `event_date`.
4. Build a rolling window:
   - `7d` for `silver_news_signal.py`
   - `48h` via `lookback_days=2` for `silver_news_signal_48h.py`
5. Build a structured payload with:
   - `article_date`
   - `title`
   - `description`
   - `company_name`
   - `polarity_score`
   - `top_parent`
   - `top_subcategory`
6. Load pricing context using the `silver_slv_pricing` profile from the pricing config and download recent market data via `yfinance`.
7. Build Gemini context that includes:
   - as-of timestamp
   - news window dates
   - chart/pricing context window
   - record count
   - polarity split
   - top parent categories
   - pricing symbol
   - latest close
   - window price change
   - full structured news records JSON
8. Run one of two narrative prompts:
   - `AssetClassNarrativeSynthesisPrompt` for the 7-day narrative
   - `AssetClassNewsPodcastPrompt48H` for the 48-hour narrative
9. For the 7-day path only, run `AssetClassNewsCompressionPrompt` on:
   - the narrative HTML
   - the structured event records
   - the present categories
   - per-category evidence counts
10. Normalize the compression output into deterministic category states and compute:
    - `category_states`
    - `composite_news_score`
    - `signal_breadth`
    - `overall_state`
11. Generate a chart of positive and negative event counts by category with the pricing series overlaid.
12. Append the chart section back into the final narrative HTML.
13. Persist the result to signal history and also generate a public report page and audio file.

### Prompted News Layers

#### 7-Day Narrative Layer

- Prompt class: `AssetClassNarrativeSynthesisPrompt`
- Core objective: convert structured silver news into a human-readable HTML narrative grouped dynamically by the categories actually present in the feed.
- Hard constraints:
  - HTML only
  - no markdown
  - no bullets
  - no scores
  - no deterministic labels
  - no trade recommendations
- Required structure:
  - one-line subtitle thesis
  - opening paragraph
  - `What is driving the news flow`
  - dynamic category sections
  - `What to watch next`

#### 48-Hour Narrative Layer

- Prompt class: `AssetClassNewsPodcastPrompt48H`
- Core objective: produce a shorter narrative briefing focused only on the most recent 48 hours.
- Additional behavior:
  - exact no-news HTML fallback if the last 48 hours has no relevant records
  - dynamic category grouping
  - HTML only
  - `What to watch next` section remains mandatory for non-empty output

#### 7-Day Compression Layer

- Prompt class: `AssetClassNewsCompressionPrompt`
- Core objective: convert narrative interpretation plus the structured event feed into machine-readable deterministic states.
- Required output JSON fields:
  - `asset`
  - `as_of_date`
  - `category_states`
  - `composite_news_score`
  - `signal_breadth`
  - `overall_state`
- Category state fields:
  - `category`
  - `direction`
  - `strength`
  - `persistence`
  - `confidence`
  - `evidence_count`

### News Monitor Outputs

- `silver_news_signal_7d`
  - Prompt recorded as `AssetClassNarrativeSynthesisPrompt (7D narrative feed)`
  - Public report: `signal_report/Podcast_Silver_News_Signal_7D.html`
  - Audio: `images/Investor_Anatomy_Silver_News_Signal_7D.mp3`
- `silver_news_signal_48h`
  - Prompt recorded as `AssetClassNewsPodcastPrompt48H narrative feed`
  - Public report: `signal_report/Podcast_Silver_News_Signal_48H.html`
  - Audio: `images/Investor_Anatomy_Silver_News_Signal_48H.mp3`
- `silver_news_compression_7d`
  - Prompt recorded as `AssetClassNewsCompressionPrompt (7D deterministic compression layer)`
  - Public report: `signal_report/Podcast_Silver_News_Signal_Compression_7D.html`
  - Snapshot JSON and history metadata are also persisted under the news-signal compression path

## Investor Anatomy Models

### News Monitor

- Name: `News Monitor`
- Description: This is the logical preprocessing node shown in the IA Explained page. It is not a single prompt call; it is the deterministic ingestion, filtering, normalization, context-building, and chart-building stage that prepares silver news for the 7-day narrative, the 48-hour narrative, and the 7-day compression layer.
- Prompt: No standalone LLM prompt. This node represents deterministic preprocessing in `news_signal_common.py` before the narrative and compression prompts are called.
- Inputs:
  - tagged RSS/news JSONL records
  - source metadata from the IA Explained page
  - asset-class filter `Silver`
  - pricing context via `silver_slv_pricing`
- Outputs:
  - normalized article payload for 7-day narrative generation
  - normalized article payload for 48-hour narrative generation
  - structured records and category counts for 7-day compression
  - contextual news-flow chart image
- Outbound connections:
  - `Silver News - 7 Days`
  - `Silver News - 48 Hours`

### Silver News - 7 Days

- Name: `silver_news_signal_7d`
- Description: This is the weekly narrative interpretation layer for silver news. It summarizes the latest 7 days of silver-relevant news flow in a human-readable HTML format and becomes one of the direct qualitative inputs into the silver analyst model.
- Prompt:
  - Source: `AssetClassNarrativeSynthesisPrompt`
  - Objective: convert a structured silver-only news feed into a concise institutional narrative grouped by the categories present in the data.
  - Output contract: HTML fragment only, no markdown, no deterministic scores, no trade instructions, dynamic category grouping, and a final `What to watch next` paragraph.
- Inputs:
  - normalized silver news records from `News Monitor`
  - 30-day price context from the pricing profile
  - polarity split
  - top parent categories
  - Gemini context block from `_build_gemini_context`
- Outputs:
  - signal history record with `signal_id="silver_news_signal_7d"`
  - public report `signal_report/Podcast_Silver_News_Signal_7D.html`
  - audio file `images/Investor_Anatomy_Silver_News_Signal_7D.mp3`
  - chart-enhanced narrative HTML
- Outbound connections:
  - `silver_news_compression_7d`
  - `silver_market_analyst`
  - `Silver_Analyst_Podcast`
  - `silver_outlook_podcast`

### Silver News - 48 Hours

- Name: `silver_news_signal_48h`
- Description: This is the short-horizon narrative layer used to surface what changed most recently in silver news. It is designed for tactical context rather than structural interpretation and is explicitly used by the execution brief.
- Prompt:
  - Source: `AssetClassNewsPodcastPrompt48H`
  - Objective: summarize only the most recent 48 hours of silver news in concise institutional HTML.
  - Special rule: if there is no relevant silver news in the last 48 hours, return the exact `No news.` HTML block.
- Inputs:
  - normalized silver news records for the 48-hour window
  - 30-day price context from `silver_slv_pricing`
  - structured Gemini context block
- Outputs:
  - signal history record with `signal_id="silver_news_signal_48h"`
  - public report `signal_report/Podcast_Silver_News_Signal_48H.html`
  - audio file `images/Investor_Anatomy_Silver_News_Signal_48H.mp3`
- Outbound connections:
  - `silver_execution_brief`
  - `silver_outlook_podcast` as metadata-only page context rather than full signal text

### Silver News Compression

- Name: `silver_news_compression_7d`
- Description: This is the deterministic news-signal layer that converts the 7-day narrative and structured event feed into machine-readable category states. It is the point where the silver news stack stops being purely narrative and starts becoming model-consumable.
- Prompt:
  - Source: `AssetClassNewsCompressionPrompt`
  - Objective: transform qualitative narrative interpretation plus event records into deterministic category states suitable for downstream models.
  - Output contract: JSON only with `category_states`, `composite_news_score`, `signal_breadth`, and `overall_state`.
- Inputs:
  - 7-day silver narrative HTML
  - structured event records
  - categories present
  - per-category evidence counts
  - asset name and date window
- Outputs:
  - canonical signal history record `silver_news_compression_7d`
  - prompt label `AssetClassNewsCompressionPrompt (7D deterministic compression layer)`
  - public report `signal_report/Podcast_Silver_News_Signal_Compression_7D.html`
  - latest snapshot JSON and compression history metadata
- Outbound connections:
  - `silver_market_analyst`
  - `Silver_Analyst_Podcast`
  - `silver_outlook_podcast`

### Silver Price Research

- Name: `Silver_Price_Research`
- Description: This module is the silver institutional target-research engine. It is not a monitor in the usual sense; it is a research synthesis pipeline that extracts institution-level silver price targets from IA Researcher PDFs, maintains a retained dataset, visualizes the target distribution, and turns that dataset into analyst-ready context.
- Prompt:
  - Extraction prompt: `EXTRACTION_PROMPT` converts completed deep-research output into JSONL with one row per institution forecast.
  - Deep research prompt: `DEEP_RESEARCH_PROMPT` asks for institutional silver targets over the next 6-12 months and prioritizes banks, specialists, industry bodies, exchanges, and institutional notes.
  - Synthesis prompt: `SYNTHESIS_PROMPT` asks an impartial commodities research editor to interpret the extracted target dataset in 5-7 HTML paragraphs.
- Inputs:
  - IA Researcher PDFs from `Data\IA_Researcher\Silver`
  - current run extraction rows
  - prior retained institution rows
  - summary statistics when available
- Outputs:
  - signal history record `Silver_Price_Research`
  - public report `signal_report/Silver_Price_Research.html`
  - chart `images/Silver_Price_Research_Targets.png`
  - methodology page path `methodology/silver_price_research.html`
  - master JSONL and run manifest files in the research data folder
- Outbound connections:
  - `silver_market_analyst`
  - `Silver_Analyst_Podcast`
  - `silver_outlook_podcast`
  - `Silver_regime_state_visualisation`

### Silver Regime Framework

- Name: `SILVER_REGIME_FRAMEWORK`
- Description: This is the embedded regime taxonomy that gives the silver analyst model a fixed vocabulary for classifying the current environment and mapping it to historical probability anchors. It is not a separately persisted signal; it is a static context object appended to the analyst prompt.
- Prompt:
  - Source constant: `SILVER_REGIME_FRAMEWORK` in `commodity_market_analyst/silver/prompts.py`
  - Format: JSON taxonomy, not free-form prose
  - Regimes defined:
    - `S1 Liquidity Expansion`
    - `S2 Real Rate Headwind`
    - `S3 USD Dominance`
    - `S4 Reflation and Industrial Upswing`
    - `S5 Disinflation Credibility`
    - `S6 Stress Safe Haven`
    - `S7 Flow-Driven Momentum`
    - `S8 Range-Bound Neutral`
  - Each regime includes:
    - definition
    - primary drivers
    - typical characteristics
    - 1M and 3M probability anchors
    - typical volatility
- Inputs:
  - none at runtime beyond the embedded constant
- Outputs:
  - appended prompt context for `silver_market_analyst`
  - regime definitions and probability anchors used by the analyst layer
- Outbound connections:
  - `silver_market_analyst`

### Silver Regime State

- Name: `silver_regime_state_deterministic`
- Description: This is the core deterministic silver regime interpreter. It is a rules-engine prompt that maps macro, positioning, flow, stress, and pricing inputs into a structured silver regime object with horizon biases, dominant drivers, conflict flags, and override flags.
- Prompt:
  - Source constant: `SILVER_REGIME_STATE_PROMPT`
  - Role: `Macro Signal Silver Analyser`
  - Hard constraints:
    - do not forecast prices
    - do not assign probabilities
    - do not invent new signals
    - operate as a rules engine
  - Authoritative inputs:
    - primary macro drivers:
      - `real_interest_rate_trend_signal`
      - `federal_reserve_liquidity_composite_signal`
      - `m2_money_supply_signal`
      - `explicit_neutral_rate_r_proxy_signal`
      - `usd_index_signal`
      - `usd_individual_market_analysis`
      - `macro_theme_global_inflation_fx_dynamics`
      - `inflation_term_structure_signal`
      - `market_implied_inflation_signal`
      - `policy_relevant_inflation_pce_signal`
    - positioning and flow:
      - `silver_individual_market_analysis`
      - `cross_sector_positioning`
      - `specs_vs_hedgers_divergence_reversal_risk`
      - `hedger_pressure_indicator`
      - `squeeze_exhaustion_risk_indicators`
    - risk and stress:
      - `financial_stress_index_signal`
      - `financial_stress_composite_signal`
      - `market_volatility_vix_signal`
    - confirmatory market expression:
      - `silver_slv_pricing`
  - Deterministic output fields:
    - `liquidity_regime`
    - `real_rate_regime`
    - `usd_regime`
    - `inflation_regime`
    - `stress_state`
    - `positioning_regime`
    - `flow_regime`
    - `market_expression_check`
    - `horizon_bias_1m`
    - `horizon_bias_3m`
    - `dominant_drivers_list`
    - `conflict_flags_list`
    - `override_flags_list`
- Inputs:
  - all `REGIME_SIGNAL_IDS["silver"]`
  - citation prompt built from the same silver regime contract
- Outputs:
  - signal history record `silver_regime_state_deterministic`
  - public report `signal_report/Silver_Regime_State.html`
  - HTML summary block stored back into signal history
- Outbound connections:
  - `silver_market_analyst`
  - `Silver_Analyst_Podcast` indirectly via the reloaded summary
  - `silver_execution_brief`
  - `silver_outlook_podcast`
  - `Silver_regime_state_visualisation`

### Signal Change Monitor

- Name: logical `Signal Change Monitor` node in the IA Explained page
- Description: This is not a standalone signal file. It is the execution-brief selection layer that compares the latest `silver_market_analyst` run timestamp with all delta-candidate signals and keeps only the latest changed record per candidate signal after the anchor.
- Prompt:
  - No standalone prompt constant
  - Implemented by deterministic selection logic in `Silver_Execution_Brief.py`
  - Its narrative representation appears inside the `Signal Change Monitor` section of the execution-brief prompt
- Inputs:
  - anchor signal id `silver_market_analyst`
  - latest signal history records
  - `content_changed` or `table_changed` flags
  - delta-candidate signal ids:
    - `real_interest_rate_trend_signal`
    - `federal_reserve_liquidity_composite_signal`
    - `m2_money_supply_signal`
    - `explicit_neutral_rate_r_proxy_signal`
    - `usd_index_signal`
    - `usd_individual_market_analysis`
    - `inflation_term_structure_signal`
    - `market_implied_inflation_signal`
    - `policy_relevant_inflation_pce_signal`
    - `silver_individual_market_analysis`
    - `cross_sector_positioning`
    - `specs_vs_hedgers_divergence_reversal_risk`
    - `hedger_pressure_indicator`
    - `squeeze_exhaustion_risk_indicators`
    - `financial_stress_index_signal`
    - `financial_stress_composite_signal`
    - `market_volatility_vix_signal`
    - `silver_slv_pricing`
    - `metals_comparative_signal`
    - `slv_etf_flow_signal`
- Outputs:
  - `delta_signal_ids` list used to build `SIGNAL_CONTEXT`
  - `DELTA_NOTE` when there are no changes
  - the rendered `Signal Change Monitor` section inside `silver_execution_brief`
- Outbound connections:
  - `silver_execution_brief`

### Silver Market Analyst

- Name: `silver_market_analyst`
- Description: This is the central silver synthesis layer. It converts regime state, research, news, pricing, volatility, ETF flow, and positioning into a concise institutional silver regime outlook and also powers the consolidated technical-analysis page.
- Prompt:
  - Source constant: `SILVER_ANALYST_PROMPT`
  - Role: institutional macro strategist generating a `Silver Regime Outlook`
  - Mandatory logic:
    - map deterministic regime to historical outcome probabilities
    - separate 1M, 3M, and 12M views
    - distinguish news-driven and flow-driven moves from structural research context
    - keep regime classification fixed
    - use framework probability anchors exactly
  - Required output HTML sections:
    - `Regime Assessment`
    - `1-Month Outlook (Tactical)`
    - `3-Month Outlook (Cyclical)`
    - `12-Month Outlook (Strategic)`
    - `Conflicts, Risks & Invalidation Watchpoints`
- Inputs:
  - `silver_regime_state_deterministic` summary
  - `Silver_Price_Research`
  - `silver_news_signal_7d`
  - `silver_news_compression_7d`
  - `metals_comparative_signal`
  - `slv_etf_flow_signal`
  - `market_volatility_vix_signal`
  - `silver_slv_pricing`
  - `silver_individual_market_analysis`
  - silver-specific citation prompt
  - `SILVER_REGIME_FRAMEWORK`
- Outputs:
  - signal history record `silver_market_analyst`
  - side output `Silver_Analyst_Podcast`
  - consolidated report output configured as `Silver_Market_Analyst.html`
  - consolidated input tabs built from:
    - pricing
    - silver CoT
    - 7-day news narrative
    - 7-day news compression
    - metals comparative
    - SLV ETF flow
    - VIX
    - silver price research
    - silver regime state
    - supporting upstream macro and positioning signals
- Outbound connections:
  - `silver_execution_brief`
  - `silver_outlook_podcast`
  - `Silver_regime_state_visualisation`

### Silver Execution Brief

- Name: `silver_execution_brief`
- Description: This is the tactical 1-3 session execution layer for silver. It separates structural regime bias from tactical posture, loads always-on baseline context plus the latest changed upstream signals since the last analyst run, and turns that into a deterministic execution plan.
- Prompt:
  - Source constant: `ARCHITECTURE_PROMPT` in `Silver_Execution_Brief.py`
  - Role: `concise, tactical Silver Execution Brief`
  - Exact section order:
    - `Headline`
    - `Session Setup`
    - `Signal Change Monitor`
    - `News Drivers and Market Narrative`
    - `Tactical Trade Call`
    - `Risk, Invalidation, Next Triggers`
  - Mandatory tactical framework:
    - price-zone classification using 20-day mean, Bollinger Bands, ATR, and swing levels
    - conflict hierarchy:
      - volatility regime
      - price structure
      - flow confirmation
    - explicit `No trade - wait for trigger` rule when conditions conflict or no entry edge exists
    - explicit fields in `Tactical Trade Call`:
      - structural bias
      - tactical posture
      - setup classification
      - entry condition
      - trim/exit condition
      - setup quality
      - confidence level
      - rationale
- Inputs:
  - direct baseline signals:
    - `market_volatility_vix_signal`
    - `silver_slv_pricing`
    - `metals_comparative_signal`
    - `slv_etf_flow_signal`
    - `silver_regime_state_deterministic`
    - `silver_market_analyst`
    - `silver_news_signal_48h`
  - latest changed post-anchor delta signals from the candidate list above
  - anchor metadata for the latest `silver_market_analyst` run
  - image library and signal context payloads
- Outputs:
  - signal history record `silver_execution_brief`
  - public report `signal_report/silver_execution_brief.html`
  - audio file `images/Investor_Anatomy_Silver_Execution_Brief.mp3`
- Outbound connections:
  - `Silver_regime_state_visualisation`

### Silver Outlook

- Name: `silver_outlook_podcast`
- Description: This is the long-form spoken-word silver outlook that turns the analyst stack into a public-facing narrative report with audio. It is more editorial than `silver_market_analyst`, but it still uses a strict section contract and explicit role separation across price, macro, flows, narrative, research, and risk sections.
- Prompt:
  - Source constant: `ARCHITECTURE_PROMPT` in `Silver_Outlook.py`
  - Role: spoken-word podcast script for the `Silver Outlook`
  - Exact section order:
    - `Headline`
    - `Executive Summary`
    - `Opening Thesis`
    - `Outlook`
    - `Market Regime and Macro Drivers`
    - `Price Action`
    - `Market Expression and Capital Flows`
    - `News Flow and Narrative`
    - `Target Pricing and Research`
    - `Conflicts, Risks & Invalidation Watchpoints`
    - `Closing`
  - Critical global rules:
    - no repetition across sections
    - strict role separation between drivers, price, flows, narrative, forward view, and risk
    - HTML only
    - image use required in several sections
    - `full_signal` inputs may be interpreted fully
    - `metadata_only` inputs cannot be used to infer direction or outcome
- Inputs:
  - full-context signals:
    - `silver_slv_pricing`
    - `silver_individual_market_analysis`
    - `silver_news_signal_7d`
    - `silver_news_compression_7d`
    - `metals_comparative_signal`
    - `slv_etf_flow_signal`
    - `market_volatility_vix_signal`
    - `Silver_Price_Research`
    - `silver_regime_state_deterministic`
    - `silver_market_analyst`
  - metadata-only monitor context:
    - real rates monitor
    - Fed liquidity monitor
    - M2 monitor
    - neutral-rate monitor
    - USD monitor
    - USD CoT monitor
    - global inflation and FX dynamics
    - inflation term structure monitor
    - market-implied inflation monitor
    - PCE monitor
    - 48H news monitor
    - broad stress monitors
- Outputs:
  - signal history record `silver_outlook_podcast`
  - public report `signal_report/Silver_Outlook_Podcast.html`
  - audio file `images/Investor_Anatomy_Silver_Outlook_Podcast.mp3`
  - repair/rebuild contexts:
    - `silver_market_analyst_podcast_notebook`
    - `silver_market_analyst_podcast_notebook_repair`
    - `silver_market_analyst_podcast_notebook_rebuild`
- Outbound connections:
  - Featured Insights card on `ia_explained/silver_market_analyst.html`

### Silver Regime State Visualisation

- Name: `Silver_regime_state_visualisation`
- Description: This is the historical reporting explainer that powers the `Historical Reporting View` table inside `ia_explained/silver_market_analyst.html`. It takes the latest regime, price, research, analyst, and execution outputs and rewrites them into a compact reporting record for the page carousel/table.
- Prompt:
  - Implemented via the common regime-history explainer pipeline in `Commodity_Model_Outputs/regime_history_common.py`
  - Asset-specific configuration lives in `Silver_Regime_history.py`
  - The prompt stored in the embedded history example requires a single JSON object with:
    - `liquidity_regime`
    - `real_rate_regime`
    - `usd_regime`
    - `inflation_regime`
    - `stress_state`
    - `positioning_regime`
    - `flow_regime`
    - `market_expression_check`
    - `horizon_bias_1m`
    - `horizon_bias_3m`
    - `6-12 Month Bias`
    - `trade_call`
    - `price`
    - `commentary`
  - Asset guidance: `Explain silver through real rates, liquidity, USD, inflation, mixed monetary and industrial demand, positioning, and ETF flows.`
- Inputs:
  - target signal ids configured in `ASSET_CONFIG`:
    - `silver_regime_state_deterministic`
    - `silver_slv_pricing`
    - `Silver_Price_Research`
    - `silver_market_analyst`
    - `silver_execution_brief`
  - extracted HTML fields from the latest upstream reports
  - field taxonomy, display styles, and commentary rules from `regime_history_common`
- Outputs:
  - JSONL history rows for `Silver_regime_state_visualisation`
  - public IA Explained history file `/ia_explained/Silver_regime_state_visualisation.jsonl`
  - embedded fallback row inside `ia_explained/silver_market_analyst.html`
  - reporting table rows rendered by `reporting-history-loader.js`
- Outbound connections:
  - `Historical Reporting View` in `ia_explained/silver_market_analyst.html`

## Complete Public Output Inventory

- IA Explained page:
  - `ia_explained/silver_market_analyst.html`
- IA Explained reporting history:
  - `ia_explained/Silver_regime_state_visualisation.jsonl`
- Signal reports:
  - `signal_report/Podcast_Silver_News_Signal_7D.html`
  - `signal_report/Podcast_Silver_News_Signal_48H.html`
  - `signal_report/Podcast_Silver_News_Signal_Compression_7D.html`
  - `signal_report/Silver_Price_Research.html`
  - `signal_report/Silver_Regime_State.html`
  - `signal_report/Silver_Market_Analyst.html`
  - `signal_report/Silver_Outlook_Podcast.html`
  - `signal_report/silver_execution_brief.html`
- Audio outputs:
  - `images/Investor_Anatomy_Silver_News_Signal_7D.mp3`
  - `images/Investor_Anatomy_Silver_News_Signal_48H.mp3`
  - `images/Investor_Anatomy_Silver_Outlook_Podcast.mp3`
  - `images/Investor_Anatomy_Silver_Execution_Brief.mp3`
- Key charts/images:
  - `images/silver_news_signal_events_plot_7d.png`
  - `images/silver_news_signal_events_plot_2d.png`
  - `images/Silver_Price_Research_Targets.png`
  - `images/Silver_Pricing_Dashboard.png`
  - `images/CoT_SILVER_Diagnostics.png`
  - `images/slv_etf_flow_signal_chart.png`
  - `images/US_Market_Volatility_MVS_signal_chart_mpl.png`

## Final Completeness Notes

- The silver page's actual model stack includes both displayed nodes and supporting side outputs such as `Silver_Analyst_Podcast`, context registries, repair/rebuild passes, and audio rendering.
- The definitive signal contract for the silver regime layer is `REGIME_SIGNAL_IDS["silver"]` in `commodity_market_analyst/regime_signal_contract.py`.
- The definitive direct-input contract for the silver analyst layer is `ANALYST_SIGNAL_IDS["silver"]` in the same file.
- The definitive tactical delta-selection contract is `GRAPH_DELTA_CANDIDATE_SIGNAL_IDS` in `Commodity_Model_Outputs/Silver_Market_Analyst/Silver_Execution_Brief.py`.
- The definitive public-outlook context contract is `SIGNAL_REGISTRY` in `Commodity_Model_Outputs/Silver_Market_Analyst/Silver_Outlook.py`.
