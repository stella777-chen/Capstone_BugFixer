# data_gen/main.py
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import List, Dict

import numpy as np
import pandas as pd


# -----------------------------
# Config
# -----------------------------
@dataclass(frozen=True)
class Config:
    days: int = 120
    lines: tuple[str, ...] = ("Line A", "Line B", "Line C", "Line D", "Line E")
    seed: int = 42

    # Output behavior assumptions (simple draft)
    base_output_low: int = 80
    base_output_high: int = 160
    weekend_drop_pct: float = 0.20  # weekend output drop

    # Scrap rate range (draft)
    scrap_rate_low: float = 0.01
    scrap_rate_high: float = 0.05


# -----------------------------
# Fact data generation
# -----------------------------
def generate_fact_production_daily(cfg: Config) -> pd.DataFrame:
    """
    Generate fact-level production data at grain: daily x line.
    Minimal fields for Scrap KPI: date, line, total_output, scrap_qty.
    """
    rng = np.random.default_rng(cfg.seed)

    end_date = pd.Timestamp.today().normalize()
    start_date = end_date - pd.Timedelta(days=cfg.days - 1)
    dates = pd.date_range(start=start_date, end=end_date, freq="D")

    rows = []
    for d in dates:
        is_weekend = d.dayofweek >= 5  # 5=Sat, 6=Sun
        for line in cfg.lines:
            # Base output
            base_output = rng.integers(cfg.base_output_low, cfg.base_output_high + 1)

            # Make Line D slightly higher (simple realism)
            if line == "Line D":
                base_output = int(base_output * 1.15)

            # Weekend drop
            if is_weekend:
                base_output = int(base_output * (1 - cfg.weekend_drop_pct))

            total_output = max(0, int(base_output))

            # Scrap qty derived from scrap rate
            scrap_rate = rng.uniform(cfg.scrap_rate_low, cfg.scrap_rate_high)
            scrap_qty = int(round(total_output * scrap_rate))

            rows.append(
                {
                    "date": d.date().isoformat(),   # keep as string for easier export
                    "line": line,
                    "total_output": int(total_output),
                    "scrap_qty": int(scrap_qty),
                }
            )

    df = pd.DataFrame(rows)
    return df


# -----------------------------
# "Query" / KPI builder
# -----------------------------
def build_scrap_rate_response(df_fact: pd.DataFrame, window_days: int) -> List[Dict]:
    """
    Build response for Scrap Rate card.
    Output structure aligns with frontend mock:
      [{ "scrap": number, "wipCount": number }]
    where scrap is percentage (0-100).
    """
    if window_days <= 0:
        raise ValueError("window_days must be positive")

    # Ensure date parsing
    df = df_fact.copy()
    df["date"] = pd.to_datetime(df["date"])

    end_date = df["date"].max()
    start_date = end_date - pd.Timedelta(days=window_days - 1)

    df_win = df[(df["date"] >= start_date) & (df["date"] <= end_date)]

    total_output_sum = float(df_win["total_output"].sum())
    scrap_sum = float(df_win["scrap_qty"].sum())

    scrap_pct = 0.0 if total_output_sum == 0 else (scrap_sum / total_output_sum) * 100.0

    # Match mock key naming: wipCount
    return [
        {
            "scrap": round(scrap_pct, 2),
            "wipCount": int(total_output_sum),
        }
    ]

def execute_query(query: dict, df_fact: pd.DataFrame):
    metric = query.get("metric")
    time_window = query.get("time_window")

    if metric == "scrap_rate":
        return build_scrap_rate_response(df_fact, int(time_window))

    raise ValueError(f"Unsupported metric: {metric}")
# -----------------------------
# Export helpers
# -----------------------------
def export_csv(df: pd.DataFrame, out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)


def export_json(obj, out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(obj, indent=2), encoding="utf-8")


# -----------------------------
# Main
# -----------------------------
def main() -> None:
    cfg = Config()

    project_root = Path(__file__).resolve().parent
    out_facts = project_root / "data" / "facts"
    out_responses = project_root / "data" / "responses"

    # 1) Generate fact data
    df_prod = generate_fact_production_daily(cfg)
    export_csv(df_prod, out_facts / "fact_production_daily.csv")

    # 2) Build Scrap Rate responses (7/30/90 days)
    resp_7 = build_scrap_rate_response(df_prod, 7)
    resp_30 = build_scrap_rate_response(df_prod, 30)
    resp_90 = build_scrap_rate_response(df_prod, 90)

    export_json(resp_7, out_responses / "scrap_rate_7days.json")
    export_json(resp_30, out_responses / "scrap_rate_30days.json")
    export_json(resp_90, out_responses / "scrap_rate_90days.json")

    print("✅ Done!")
    print(f"- Exported: {out_facts / 'fact_production_daily.csv'}")
    print(f"- Exported: {out_responses / 'scrap_rate_7days.json'}")
    print(f"- Exported: {out_responses / 'scrap_rate_30days.json'}")
    print(f"- Exported: {out_responses / 'scrap_rate_90days.json'}")


        # 3) Simulate a query request (like frontend sending Query JSON)
    query_30 = {"metric": "scrap_rate", "time_window": 30}

    response_30 = execute_query(query_30, df_prod)

    export_json(response_30, out_responses / "query_result_scrap_rate_30days.json")
    print(f"- Exported: {out_responses / 'query_result_scrap_rate_30days.json'}")


if __name__ == "__main__":
    main()

