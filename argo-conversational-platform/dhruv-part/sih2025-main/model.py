from __future__ import annotations

import datetime
from dataclasses import dataclass
from typing import List

import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge


@dataclass
class SSTForecast:
	future_dates: List[datetime.date]
	predicted_sst_c: List[float]


class BaselineSSTForecaster:
	def __init__(self, seasonal_lag: int = 7, alpha: float = 1.0) -> None:
		self.seasonal_lag = seasonal_lag
		self.alpha = alpha
		self.model: Ridge | None = None

	def _build_features(self, series: pd.Series) -> pd.DataFrame:
		values = series.values.astype(float)
		dates = pd.to_datetime(series.index)
		ordinal = dates.map(datetime.datetime.toordinal).astype(float).values

		lagged = np.roll(values, self.seasonal_lag)
		lagged[: self.seasonal_lag] = np.nan

		X = pd.DataFrame({
			"ordinal": ordinal,
			f"lag_{self.seasonal_lag}": lagged,
		})
		# Ensure feature frame aligns with the series by date
		X.index = series.index
		return X

	def fit(self, history: pd.DataFrame) -> None:
		if history.empty:
			self.model = None
			return
		series = history.set_index("date")["sst_c"].astype(float)
		series = series.asfreq("D").interpolate(limit_direction="both")
		X_full = self._build_features(series)
		# Keep only rows where lagged value is available
		valid_mask = X_full[f"lag_{self.seasonal_lag}"].notna()
		X = X_full[valid_mask]
		y = series.loc[X.index].values
		# Guard against zero rows and very small sample sizes
		if len(X) == 0 or len(y) == 0 or len(y) < 14:
			self.model = None
			return
		model = Ridge(alpha=self.alpha)
		try:
			model.fit(X, y)
		except Exception:
			# If sklearn refuses to fit due to zero/invalid samples, fall back to naive
			self.model = None
			self._last_series = series
			return
		self.model = model
		self._last_series = series

	def predict(self, days_ahead: int = 7) -> SSTForecast:
		if not hasattr(self, "_last_series"):
			raise ValueError("Model not fitted")
		series = self._last_series
		last_date = series.index[-1].date()
		future_dates = [last_date + datetime.timedelta(days=i) for i in range(1, days_ahead + 1)]

		if self.model is None:
			last_val = float(series.iloc[-1])
			return SSTForecast(future_dates, [last_val] * days_ahead)

		all_series = series.copy()
		preds: List[float] = []
		for i in range(1, days_ahead + 1):
			future_date = series.index[-1] + pd.Timedelta(days=i)
			ordinal = float(future_date.to_pydatetime().toordinal())
			lag_index = future_date - pd.Timedelta(days=self.seasonal_lag)
			lag_value = all_series.asof(lag_index)
			if np.isnan(lag_value):
				lag_value = all_series.iloc[-1]
			Xf = pd.DataFrame({
				"ordinal": [ordinal],
				f"lag_{self.seasonal_lag}": [float(lag_value)],
			})
			pred = float(self.model.predict(Xf)[0])
			preds.append(pred)
			all_series = pd.concat([all_series, pd.Series([pred], index=[future_date])])

		return SSTForecast(future_dates, preds)
