import datetime
import os

import pandas as pd
import plotly.graph_objs as go
import streamlit as st
import requests

from data_fetcher import fetch_sst_timeseries
from model import BaselineSSTForecaster
from email_service import send_email

st.set_page_config(page_title="Ocean SST Nowcasting", layout="wide")

st.title("AI-assisted Ocean SST Forecast (PoC)")

# Coordinates-only mode with optional auto-fetch from LLM/backend

def _fetch_coords_from_backend():
	"""Attempt to auto-fetch coordinates from a user-provided backend/LLM service.

	The endpoint URL can be provided via Streamlit secrets as "coords_api_url"
	or environment variable "COORDS_API_URL". The endpoint should return JSON
	like {"lat": <float>, "lon": <float>}.
	"""
	# Prefer env var. Only read Streamlit secrets if a secrets.toml actually exists.
	url = os.getenv("COORDS_API_URL")
	if not url:
		# Check common secrets paths to avoid triggering Streamlit's file-not-found error
		user_home = os.path.expanduser("~")
		project_root = os.getcwd()
		candidate_paths = [
			os.path.join(user_home, ".streamlit", "secrets.toml"),
			os.path.join(project_root, ".streamlit", "secrets.toml"),
		]
		if any(os.path.exists(p) for p in candidate_paths):
			try:
				url = st.secrets.get("coords_api_url", None)
			except Exception:
				url = None
	if not url:
		url = os.getenv("COORDS_API_URL")
	if not url:
		return None, None, None
	try:
		resp = requests.get(url, timeout=10)
		resp.raise_for_status()
		data = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
		lat_val = data.get("lat")
		lon_val = data.get("lon")
		return lat_val, lon_val, url
	except Exception as exc:
		st.warning(f"Auto-fetch of coordinates failed: {exc}")
		return None, None, url

auto_lat, auto_lon, source_url = _fetch_coords_from_backend()

col1, col2 = st.columns(2)
with col1:
	lat = st.number_input(
		"Latitude",
		value=float(auto_lat) if isinstance(auto_lat, (int, float)) else 0.0,
		format="%.4f",
	)
with col2:
	lon = st.number_input(
		"Longitude",
		value=float(auto_lon) if isinstance(auto_lon, (int, float)) else 0.0,
		format="%.4f",
	)

if auto_lat is not None and auto_lon is not None:
	st.caption(
		f"Coordinates auto-filled from backend: lat={float(auto_lat):.4f}, lon={float(auto_lon):.4f}"
	)

col3, col4 = st.columns(2)
with col3:
	history_days = st.slider("History days", min_value=30, max_value=365, value=180)
with col4:
	forecast_days = st.slider("Forecast days", min_value=3, max_value=30, value=7)

end_date = datetime.date.today()
start_date = end_date - datetime.timedelta(days=history_days)

st.caption("Data source: NOAA CoastWatch ERDDAP GHRSST MUR (no API key required)")

disabled_fetch = lat is None or lon is None
if st.button("Fetch and Forecast", disabled=disabled_fetch):
	with st.spinner("Fetching SST from ERDDAP..."):
		df = fetch_sst_timeseries(lat, lon, start_date, end_date)
	if df.empty:
		st.warning("No data returned for the selected location/date range.")
		st.stop()

	st.subheader("Historical SST (C)")
	st.dataframe(df.tail(10), use_container_width=True)

	with st.spinner("Training baseline model and forecasting..."):
		model = BaselineSSTForecaster(seasonal_lag=7, alpha=0.5)
		model.fit(df)
		forecast = model.predict(days_ahead=forecast_days)

	future_df = pd.DataFrame({"date": forecast.future_dates, "sst_c": forecast.predicted_sst_c})

	fig = go.Figure()
	fig.add_trace(go.Scatter(x=df["date"], y=df["sst_c"], name="History", mode="lines"))
	fig.add_trace(go.Scatter(x=future_df["date"], y=future_df["sst_c"], name="Forecast", mode="lines+markers"))
	fig.update_layout(xaxis_title="Date", yaxis_title="SST (C)", template="plotly_white")

	st.subheader("SST Forecast")
	st.plotly_chart(fig, use_container_width=True)

	st.download_button(
		label="Download forecast CSV",
		data=future_df.to_csv(index=False),
		file_name="sst_forecast.csv",
		mime="text/csv",
	)

	# Notifications section
	st.markdown("---")
	st.subheader("Notify subscribers about updates")
	with st.expander("Send update email"):
		default_subject = f"SST Forecast Update for lat={lat:.4f}, lon={lon:.4f}"
		subject = st.text_input("Subject", value=default_subject)
		recipients_text = st.text_area("Recipients (comma-separated emails)")
		message = st.text_area(
			"Message",
			value=(
				"Hello,\n\n"
				"Here are the latest updates from our LLM-driven SST forecasting project.\n\n"
				f"History window: {history_days} days\n"
				f"Forecast horizon: {forecast_days} days\n\n"
				"Visit the app to view charts and download data.\n"
			)
		)
		if st.button("Send Email"):
			recipients = [r.strip() for r in recipients_text.split(",") if r.strip()]
			if not recipients:
				st.error("Please provide at least one recipient email.")
			else:
				with st.spinner("Sending emails via SendGrid..."):
					ok, err = send_email(subject=subject, content_text=message, recipients=recipients)
					if ok:
						st.success(f"Email sent to {len(recipients)} recipient(s).")
					else:
						st.error(f"Failed to send email: {err}")
