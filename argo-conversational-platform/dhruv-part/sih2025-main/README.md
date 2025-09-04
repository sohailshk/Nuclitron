# Ocean SST Forecast (PoC)

This Proof-of-Concept fetches public Sea Surface Temperature (SST) data from NOAA CoastWatch ERDDAP (GHRSST MUR), fits a simple time-series baseline, and provides a Streamlit UI to forecast near-term SST at a selected coordinate. No API key is required.

## Quickstart

1. Create a Python 3.10+ environment and install requirements:

```bash
pip install -r requirements.txt
```

2. Run the Streamlit app:

```bash
streamlit run app.py
```

3. Choose a location input mode, set history/forecast windows, then click "Fetch and Forecast".

## Location Input Modes
- Place name: Type a name like "Arabian Sea" or "Chennai, India" and click "Find location" (uses OpenStreetMap Nominatim to geocode to lat/lon).
- Region preset: Pick a common ocean region in the Indian Ocean with a default representative point.
- Coordinates: Enter latitude/longitude directly.

Note: Geocoding uses Nominatim with a simple, rate-limited request and a custom User-Agent.

## Data Source
- ERDDAP server: `https://coastwatch.pfeg.noaa.gov/erddap`
- Dataset: `jplMURSST41` (GHRSST MUR, daily 0.01° global SST)
- Variables: `analysed_sst` is converted from Kelvin to Celsius.

## Files
- `data_fetcher.py`: ERDDAP client and SST point timeseries retrieval
- `model.py`: Baseline forecaster (7-day seasonal lag + linear trend)
- `app.py`: Streamlit UI, Plotly visualizations, CSV export, geocoding and region presets
- `requirements.txt`: Dependencies
- `email_service.py`: Utility for sending emails via SendGrid

## Notes and Roadmap to Full Problem Statement
This PoC demonstrates a minimal, API-key-free path to predict current climate proxy (SST). To extend toward the full ARGO conversational system:

- Ingest and structure ARGO NetCDF profiles (pressure/depth, temperature, salinity, BGC):
  - Use `xarray`, `netCDF4` to parse; store in PostgreSQL and Parquet.
  - Index metadata in FAISS/Chroma; store summaries and geospatial tiles.
- Build RAG with MCP-enabled tools for SQL generation:
  - Provide schema/tooling to LLM to translate NL questions to SQL over ARGO tables.
  - Use multimodal LLMs (e.g., Mistral/Qwen) for interpretation; LangChain/LlamaIndex for orchestration.
- Dashboards:
  - Geospatial maps (Leaflet/kepler.gl/Plotly mapbox) for float tracks and near-real-time overlays (SST, SSH, chlorophyll).
  - Profile viewers: depth-time sections, TS diagrams, profile comparisons.
- Chatbot:
  - Natural language querying with clarifications; guidance for filters (region, time, variable, depth, platform).
- Exports:
  - CSV, Parquet, and NetCDF (subset of original).

## Disclaimer
This is a simple baseline and not an operational forecast; accuracy varies by region and seasonality. For robust forecasting, consider physics-informed models or data assimilation systems.

## Email notifications (SendGrid)

The app can notify subscribers via email about updates.

Setup:

1. Create a SendGrid account and get an API key.
2. Verify a sender identity (from email) in SendGrid.
3. Set environment variables before running the app:

```bash
setx SENDGRID_API_KEY "<your_sendgrid_api_key>"
setx SENDGRID_SENDER_EMAIL "<your_verified_sender@example.com>"
```

You may need to restart your terminal after `setx` on Windows.

Usage in the app:
- After generating a forecast, scroll to "Notify subscribers about updates".
- Enter a subject, comma-separated recipient emails, and a message.
- Click "Send Email". Emails are sent via SendGrid to the recipients.

