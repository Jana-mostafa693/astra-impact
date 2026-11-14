from __future__ import annotations

import csv
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any, Iterable
from .scientific_schema import SiteDocumentSchema

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"
WEBSITE = DATA / "website_json"
SERIES_DIR = DATA / "website_timeseries"

class DataValidationError(RuntimeError):
    pass


def _load(path: Path) -> Any:
    with path.open(encoding="utf-8") as fh:
        return json.load(fh)


def _as_list(obj: Any, key: str) -> list:
    if isinstance(obj, list):
        return obj
    return obj.get(key, [])


class Repository:
    """Startup-loaded, immutable in-memory view of the validated website dataset."""
    def __init__(self) -> None:
        self.sites_doc = _load(WEBSITE / "website_sites.json")
        self.comparisons_doc = _load(WEBSITE / "website_comparisons.json")
        self.recommendations_doc = _load(WEBSITE / "website_analog_recommendations.json")
        self.schema = _load(WEBSITE / "website_schema.json")
        limitations_path = DATA / "scientific_reports" / "SCIENTIFIC_LIMITATIONS.md"
        self.limitations_markdown = limitations_path.read_text(encoding="utf-8")
        self.details: dict[str, dict] = {}
        for filename in ("website_earth_details.json", "website_moon_details.json", "website_mars_details.json"):
            for site in _as_list(_load(WEBSITE / filename), "sites"):
                self.details[site["site_id"]] = site
        self.sites = {site["site_id"]: site for site in self.sites_doc["sites"]}
        self.comparisons = self.comparisons_doc["records"]
        self.recommendations = self.recommendations_doc["recommendations"]
        self.categories = self.comparisons_doc.get("categories", [])
        self.purposes = self.recommendations_doc.get("research_purposes", [])
        self.sources = self._load_sources()
        self.series: dict[str, dict] = {}
        self.series_index: dict[str, list[dict]] = {site_id: [] for site_id in self.sites}
        for path in sorted(SERIES_DIR.glob("*.json")):
            doc = _load(path)
            rel = path.relative_to(DATA).as_posix()
            if doc.get("site_id") not in self.sites:
                raise DataValidationError(f"series references unknown site: {rel}")
            key = doc.get("kind")
            if not key or (doc["site_id"], key) in self.series:
                raise DataValidationError(f"invalid or duplicate series kind: {rel}")
            self.series[(doc["site_id"], key)] = doc
            self.series_index[doc["site_id"]].append({
                "series_type": key, "site_id": doc["site_id"], "body": doc.get("body"),
                "records": len(doc.get("records", [])), "source": doc.get("source"),
                "units": doc.get("units"), "field_metadata": doc.get("field_metadata"),
                "path": rel,
            })
        self._validate()

    def _load_sources(self) -> dict[str, dict]:
        path = DATA / "catalogs" / "planetary_source_catalog.csv"
        with path.open(encoding="utf-8", newline="") as fh:
            return {row["source_id"]: row for row in csv.DictReader(fh)}

    def _validate(self) -> None:
        for detail in self.details.values():
            SiteDocumentSchema.model_validate(detail)
        if len(self.sites) != 17 or Counter(s["body"] for s in self.sites.values()) != Counter({"Earth": 14, "Moon": 2, "Mars": 1}):
            raise DataValidationError("active site registry count/body validation failed")
        if len(self.series) != 104:
            raise DataValidationError(f"expected 104 series files, found {len(self.series)}")
        if len(self.comparisons) != 420 or len(self.recommendations) != 210:
            raise DataValidationError("current comparison/recommendation counts failed")
        ids = set(self.sites)
        for site in self.sites.values():
            if site.get("site_id") not in self.details:
                raise DataValidationError("site detail foreign key missing")
            coords = site.get("coordinates", {})
            if site["body"] == "Earth":
                if coords.get("earth_epsg") != 4326 or not coords.get("earth_map_eligible"):
                    raise DataValidationError("Earth coordinate CRS validation failed")
            elif coords.get("earth_map_eligible"):
                raise DataValidationError("non-Earth site marked Earth map eligible")
            for sid in site.get("source_ids", []):
                if sid not in self.sources and sid != "RETAINED_CRATER_PROFILES":
                    raise DataValidationError(f"unknown source id {sid}")
        for row in self.comparisons:
            if row.get("earth_site_id") not in ids or row.get("planetary_site_id") not in ids:
                raise DataValidationError("comparison foreign key validation failed")
            if row.get("earth_record_status") not in {"EXISTING_ANALYZED", "PROPOSED_SCREENING"}:
                raise DataValidationError("comparison status validation failed")
        for row in self.recommendations:
            if row.get("earth_site_id") not in ids or row.get("planetary_site_id") not in ids:
                raise DataValidationError("recommendation foreign key validation failed")
        for (site_id, _), doc in self.series.items():
            if doc.get("site_id") != site_id or doc.get("body") != self.sites[site_id]["body"]:
                raise DataValidationError("series foreign key/body validation failed")

    def get_site(self, site_id: str) -> dict | None:
        return self.details.get(site_id)

    def site_records(self) -> list[dict]:
        return list(self.sites.values())

    def measurement_records(self) -> list[dict]:
        rows = []
        for site_id, detail in self.details.items():
            for measurement in detail.get("environmental_measurements", []):
                rows.append({"site_id": site_id, "site_name": detail.get("site_name"), **measurement})
        return rows

    def quality_records(self) -> list[dict]:
        return [{"site_id": s["site_id"], "site_name": s["site_name"], "body": s["body"], "site_verification_status": s.get("site_verification_status"), "scientific_quality_flags": s.get("scientific_quality_flags"), "missing_variables": s.get("missing_variables")} for s in self.details.values()]

    def find_series(self, site_id: str, series_type: str) -> dict:
        if site_id not in self.sites:
            raise KeyError("site not found")
        # Resolve only from the startup-built allowlist; never concatenate user paths.
        if (site_id, series_type) not in self.series:
            raise KeyError("series not found")
        return self.series[(site_id, series_type)]

    def timeseries_index(self, site_id: str | None = None) -> list[dict]:
        return [x for sid in ([site_id] if site_id else self.sites) for x in self.series_index[sid]]

    def summary(self) -> dict:
        validation = _load(DATA / "final_validation.json")
        counts = validation.get("coverage", {})
        return {
            "site_counts": dict(Counter(s["body"] for s in self.sites.values())),
            "active_sites": len(self.sites), "comparison_records": len(self.comparisons), "recommendation_records": len(self.recommendations),
            "purpose_evidence_records": len(self.recommendations_doc.get("purpose_evidence", [])), "series_files": len(self.series), "source_catalog_records": len(self.sources),
            "hourly_rows": counts.get("hourly_rows"), "dataset_status": validation.get("status"),
            "scientific_flags": validation.get("retained_scientific_flags", []),
            "exact_crater_profile_scores": self.comparisons_doc.get("exact_crater_profile_scores", []),
            "overall_similarity_percentage": None,
        }

REPO = Repository()
