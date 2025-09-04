import datetime
from typing import Optional, List

import pandas as pd
import requests
from erddapy import ERDDAP


OPEN_METEO_MARINE = "https://marine-api.open-meteo.com/v1/marine"


def _clamp_lat(lat: float) -> float:
	return max(min(lat, 89.5), -89.5)


def _wrap_lon(lon: float) -> float:
	if lon > 180:
		return ((lon + 180) % 360) - 180
	if lon < -180:
		return ((lon - 180) % 360) + 180
	return lon


def _fetch_open_meteo_single(latitude: float, longitude: float, start_date: datetime.date, end_date: datetime.date) -> pd.DataFrame:
	params = {
		"latitude": latitude,
		"longitude": longitude,
		"start_date": start_date.isoformat(),
		"end_date": end_date.isoformat(),
		"hourly": "sea_surface_temperature",
	}
	resp = requests.get(OPEN_METEO_MARINE, params=params, timeout=60)
	resp.raise_for_status()
	js = resp.json()
	hourly = js.get("hourly", {})
	times = hourly.get("time")
	sst = hourly.get("sea_surface_temperature")
	if not times or not sst:
		return pd.DataFrame({"date": [], "sst_c": []})
	df = pd.DataFrame({"time": pd.to_datetime(times), "sst_c": sst})
	out = df.groupby(df["time"].dt.date)["sst_c"].mean().reset_index()
	out = out.rename(columns={"time": "date"})
	return out.sort_values("date").reset_index(drop=True)


def _fetch_open_meteo_sst(
	latitude: float,
	longitude: float,
	start_date: datetime.date,
	end_date: datetime.date,
) -> pd.DataFrame:
	# Try the exact point first
	try:
		df = _fetch_open_meteo_single(latitude, longitude, start_date, end_date)
		if not df.empty:
			return df
	except Exception:
		# We'll try neighbors below
		pass

	# Sample nearby points offshore and average
	offsets: List[float] = [0.1, 0.25, 0.5]
	neighbors: List[pd.DataFrame] = []
	for off in offsets:
		for dlat in (-off, 0.0, off):
			for dlon in (-off, 0.0, off):
				if dlat == 0.0 and dlon == 0.0:
					continue
				lat2 = _clamp_lat(latitude + dlat)
				lon2 = _wrap_lon(longitude + dlon)
				try:
					df2 = _fetch_open_meteo_single(lat2, lon2, start_date, end_date)
					if not df2.empty:
						neighbors.append(df2)
				except Exception:
					continue

	if not neighbors:
		return pd.DataFrame({"date": [], "sst_c": []})

	# Align by date and average
	merged = neighbors[0]
	for dfN in neighbors[1:]:
		merged = pd.merge(merged, dfN, on="date", how="outer", suffixes=("", "_n"))
	# Collect all sst columns
	sst_cols = [c for c in merged.columns if c.startswith("sst_c")]
	merged["sst_c_mean"] = merged[sst_cols].mean(axis=1, skipna=True)
	out = merged[["date", "sst_c_mean"]].rename(columns={"sst_c_mean": "sst_c"})
	return out.sort_values("date").reset_index(drop=True)


def build_erddap_client(server: str = "https://coastwatch.pfeg.noaa.gov/erddap") -> ERDDAP:
	client = ERDDAP(server=server, protocol="griddap")
	client.requests_kwargs = {"headers": {"User-Agent": "sih-argo-forecast/1.0"}, "timeout": 60}
	return client


def _fetch_erddap_sst(
	latitude: float,
	longitude: float,
	start_date: datetime.date,
	end_date: datetime.date,
	dataset_id: str = "jplMURSST41",
) -> pd.DataFrame:
	client = build_erddap_client()
	client.dataset_id = dataset_id
	client.variables = ["analysed_sst"]

	lat_min = latitude - 0.05
	lat_max = latitude + 0.05
	lon_min = longitude - 0.05
	lon_max = longitude + 0.05

	constraints_fallback = {
		"time>=": f"{start_date.isoformat()}",
		"time<=": f"{end_date.isoformat()}",
		"lat>=": lat_min,
		"lat<=": lat_max,
		"lon>=": lon_min,
		"lon<=": lon_max,
	}

	client.constraints = constraints_fallback
	df = client.to_pandas(index_col=None)
	if df is None or df.empty:
		return pd.DataFrame({"date": [], "sst_c": []})

	if "analysed_sst" not in df.columns:
		return pd.DataFrame({"date": [], "sst_c": []})

	df["sst_c"] = df["analysed_sst"].astype(float) - 273.15
	date_col = "time" if "time" in df.columns else None
	if date_col is None:
		for c in df.columns:
			if "time" in c.lower():
				date_col = c
				break
	if date_col is None:
		return pd.DataFrame({"date": [], "sst_c": []})

	df[date_col] = pd.to_datetime(df[date_col])
	out = df.groupby(df[date_col].dt.date)["sst_c"].mean().reset_index()
	out = out.rename(columns={date_col: "date"})
	return out.sort_values("date").reset_index(drop=True)


def fetch_sst_timeseries(
	latitude: float,
	longitude: float,
	start_date: datetime.date,
	end_date: datetime.date,
) -> pd.DataFrame:
	"""
	Fetch daily SST time series at a point.
	Primary: Open-Meteo Marine API (public, no key). Fallback: ERDDAP GHRSST MUR.
	Returns DataFrame with columns: ['date', 'sst_c'] (Celsius)
	"""
	try:
		om = _fetch_open_meteo_sst(latitude, longitude, start_date, end_date)
		if not om.empty:
			return om
	except Exception:
		pass
	try:
		return _fetch_erddap_sst(latitude, longitude, start_date, end_date)
	except Exception:
		return pd.DataFrame({"date": [], "sst_c": []})
