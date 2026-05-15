from __future__ import annotations


KNOWN_METRICS = {
    "ScrapRate",
    "ReworkRate",
    "YieldRate",
    "DefectDistribution",
    "WipAgingDistribution",
    "LotStatusDistribution",
}

DEFAULT_COMPONENTS = {
    "ScrapRate": "ScrapRateDonut",
    "ReworkRate": "ReworkRateDonut",
    "YieldRate": "LineChart",
    "LotStatusDistribution": "PieChart",
    "WipAgingDistribution": "BarChart",
    "DefectDistribution": "ComboChart",
}

SUPPORTED_COMPONENTS_BY_METRIC = {
    "ScrapRate": {"ScrapRateDonut"},
    "ReworkRate": {"ReworkRateDonut"},
    "YieldRate": {"LineChart", "BarChart"},
    "LotStatusDistribution": {"PieChart", "BarChart"},
    "WipAgingDistribution": {"BarChart", "PieChart"},
    "DefectDistribution": {"ComboChart", "BarChart", "PieChart"},
}

KNOWN_COMPONENTS = {
    component
    for components in SUPPORTED_COMPONENTS_BY_METRIC.values()
    for component in components
}

