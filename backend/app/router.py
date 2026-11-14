from __future__ import annotations

from datetime import date
from typing import Any
from fastapi import APIRouter, HTTPException, Query
from .models import TimeSeriesQuery
from .repository import REPO
from .security import envelope

router = APIRouter(prefix="/api")


def page(rows: list, limit: int, offset: int) -> dict:
    return envelope(rows[offset:offset + limit], {"total": len(rows), "limit": limit, "offset": offset})


def text_match(value: Any, needle: str) -> bool:
    return needle.lower() in str(value or "").lower()


def sort_rows(rows: list[dict], sort: str | None, default: str = "site_id") -> list[dict]:
    field = (sort or default).lstrip("-")
    if field not in {"site_id", "site_name", "body", "site_verification_status"}:
        raise HTTPException(422, "Unsupported site sort field")
    reverse = bool(sort and sort.startswith("-"))
    return sorted(rows, key=lambda r: (r.get(field) is None, r.get(field)), reverse=reverse)


@router.get("/health")
def health():
    return envelope({"status": "ok", "service": "planetary-analog-api", "dataset": "validated-master", "version": "1.0"})

@router.get("/ready")
def ready():
    return envelope({"status": "ready", "validated": True, "sites": len(REPO.sites), "series_files": len(REPO.series)})

@router.get("/summary")
def summary(): return envelope(REPO.summary())

@router.get("/worlds")
def worlds():
    return envelope([{"body": body, "site_count": sum(x["body"] == body for x in REPO.sites.values()), "site_ids": [x["site_id"] for x in REPO.sites.values() if x["body"] == body]} for body in ("Earth", "Moon", "Mars")])

@router.get("/sites")
def sites(body: str | None = None, status: str | None = None, research_purpose: str | None = None, available_variable: str | None = None, quality_status: str | None = None, search: str | None = None, limit: int = Query(50, ge=1, le=500), offset: int = Query(0, ge=0), sort: str | None = None):
    rows = REPO.site_records()
    if body: rows = [r for r in rows if r.get("body", "").lower() == body.lower()]
    if status: rows = [r for r in rows if r.get("site_verification_status") == status]
    if research_purpose: rows = [r for r in rows if any(text_match(p.get("research_purpose"), research_purpose) for p in r.get("purpose_specific_analog_evidence", []))]
    if available_variable: rows = [r for r in rows if any(text_match(m.get("variable"), available_variable) and not m.get("missing", False) for m in r.get("environmental_measurements", []))]
    if quality_status: rows = [r for r in rows if text_match(r.get("scientific_quality_flags"), quality_status)]
    if search: rows = [r for r in rows if text_match(r.get("site_id"), search) or text_match(r.get("site_name"), search)]
    return page(sort_rows(rows, sort), limit, offset)

@router.get("/sites/{site_id}")
def site(site_id: str):
    found = REPO.get_site(site_id)
    if not found: raise HTTPException(404, "site not found")
    return envelope(found)

@router.get("/sites/{site_id}/measurements")
def site_measurements(site_id: str, source_id: str | None = None, data_class: str | None = None, variable: str | None = None, limit: int = Query(500, ge=1, le=500), offset: int = Query(0, ge=0)):
    if site_id not in REPO.sites: raise HTTPException(404, "site not found")
    rows = [r for r in REPO.measurement_records() if r.get("site_id") == site_id]
    if source_id: rows = [r for r in rows if r.get("source_id") == source_id]
    if data_class: rows = [r for r in rows if r.get("data_class") == data_class]
    if variable: rows = [r for r in rows if r.get("variable") == variable]
    return page(rows, limit, offset)

@router.get("/sites/{site_id}/quality")
def site_quality(site_id: str):
    if site_id not in REPO.sites: raise HTTPException(404, "site not found")
    return envelope(next(row for row in REPO.quality_records() if row["site_id"] == site_id))

@router.get("/measurements")
def measurements(source_id: str | None = None, data_class: str | None = None, variable: str | None = None, limit: int = Query(50, ge=1, le=500), offset: int = Query(0, ge=0)):
    rows = REPO.measurement_records()
    if source_id: rows = [r for r in rows if r.get("source_id") == source_id]
    if data_class: rows = [r for r in rows if r.get("data_class") == data_class]
    if variable: rows = [r for r in rows if r.get("variable") == variable]
    return page(rows, limit, offset)

@router.get("/quality")
def quality(limit: int = Query(50, ge=1, le=500), offset: int = Query(0, ge=0)):
    return page(REPO.quality_records(), limit, offset)

@router.get("/timeseries")
def timeseries_index(site_id: str | None = None, limit: int = Query(500, ge=1, le=500), offset: int = Query(0, ge=0)):
    items = REPO.timeseries_index(site_id)
    grouped: dict[str, dict] = {}
    for item in items:
        grouped.setdefault(item["site_id"], {})[item["series_type"]] = {k: v for k, v in item.items() if k not in {"site_id", "series_type"}}
    return envelope({"series": grouped, "items": items[offset:offset + limit]}, {"total": len(items), "limit": limit, "offset": offset})

@router.get("/sites/{site_id}/timeseries")
def site_timeseries_index(site_id: str):
    if site_id not in REPO.sites: raise HTTPException(404, "site not found")
    return envelope({item["series_type"]: {k: v for k, v in item.items() if k not in {"site_id", "series_type"}} for item in REPO.timeseries_index(site_id)})

@router.get("/timeseries/{series_type}")
def timeseries(series_type: str, q: TimeSeriesQuery = Query()):
    if q.site_id is None:
        raise HTTPException(400, "site_id is required for a series request")
    try: doc = REPO.find_series(q.site_id, series_type)
    except KeyError as exc: raise HTTPException(404, str(exc))
    rows = list(doc.get("records", []))
    if q.date_from or q.date_to:
        lo, hi = q.date_from or "", q.date_to or "9999-99-99"
        def record_date(r):
            explicit = r.get("date", r.get("period_start_utc", r.get("composite_start")))
            if explicit is not None: return str(explicit)[:10]
            if r.get("year") is not None: return f"{int(r['year']):04d}-{int(r.get('month', 1)):02d}-01"
            return ""
        rows = [r for r in rows if lo <= record_date(r) <= hi]
    if q.year is not None: rows = [r for r in rows if r.get("year") == q.year]
    if q.month is not None: rows = [r for r in rows if r.get("month") == q.month]
    if q.ls is not None: rows = [r for r in rows if r.get("ls_deg") == q.ls]
    if q.localtime is not None: rows = [r for r in rows if r.get("local_solar_time_martian_hours", r.get("local_time_hours")) == q.localtime]
    if q.height is not None: rows = [r for r in rows if r.get("height_above_surface_m") == q.height]
    if q.profile_scope is not None: rows = [r for r in rows if r.get("profile_scope") == q.profile_scope]
    if q.variables:
        fields = {v.strip() for v in q.variables.split(",") if v.strip()}
        rows = [{k: v for k, v in r.items() if k in fields or k == "stable_id"} for r in rows]
    payload = {k: doc.get(k) for k in ("site_id", "body", "kind", "source", "units", "field_metadata", "source_policy", "guardrail", "site_metadata") if k in doc}
    payload["records"] = rows[q.offset:q.offset + q.limit]
    payload["record_count"] = len(rows)
    return envelope(payload, {"total": len(rows), "limit": q.limit, "offset": q.offset})

@router.get("/sites/{site_id}/timeseries/{series_type}")
def site_timeseries(site_id: str, series_type: str, q: TimeSeriesQuery = Query()):
    if site_id not in REPO.sites:
        raise HTTPException(404, "site not found")
    return timeseries(series_type, q.model_copy(update={"site_id": site_id}))

@router.get("/comparisons")
def comparisons(earth_site_id: str | None = None, planetary_site_id: str | None = None, category: str | None = None, limit: int = Query(50, ge=1, le=500), offset: int = Query(0, ge=0)):
    rows = REPO.comparisons
    if earth_site_id: rows = [r for r in rows if r.get("earth_site_id") == earth_site_id]
    if planetary_site_id: rows = [r for r in rows if r.get("planetary_site_id") == planetary_site_id]
    if category: rows = [r for r in rows if r.get("category") == category]
    return page(rows, limit, offset)

@router.get("/recommendations")
def recommendations(earth_site_id: str | None = None, planetary_site_id: str | None = None, research_purpose: str | None = None, evidence_tier: str | None = None, sort: str | None = None, limit: int = Query(50, ge=1, le=500), offset: int = Query(0, ge=0)):
    rows = REPO.recommendations
    if earth_site_id: rows = [r for r in rows if r.get("earth_site_id") == earth_site_id]
    if planetary_site_id: rows = [r for r in rows if r.get("planetary_site_id") == planetary_site_id]
    if research_purpose: rows = [r for r in rows if r.get("research_purpose") == research_purpose]
    if evidence_tier: rows = [r for r in rows if r.get("evidence_tier") == evidence_tier]
    if sort in {"rank", "-rank"}:
        reverse = sort.startswith("-")
        ranked = [r for r in rows if r.get("rank") is not None]
        unranked = [r for r in rows if r.get("rank") is None]
        rows = sorted(ranked, key=lambda r: r["rank"], reverse=reverse) + unranked
    return page(rows, limit, offset)

@router.get("/sources")
def sources(body: str | None = None, source_id: str | None = None, data_class: str | None = None, limit: int = Query(50, ge=1, le=500), offset: int = Query(0, ge=0)):
    rows = list(REPO.sources.values())
    if body: rows = [r for r in rows if body.lower() in r.get("planetary_body_scope", "").lower()]
    if source_id: rows = [r for r in rows if r.get("source_id") == source_id]
    if data_class: rows = [r for r in rows if data_class.lower() in r.get("observation_model_or_proxy_status", "").lower() or data_class.lower() in r.get("variables_and_units", "").lower()]
    return page(rows, limit, offset)

@router.get("/coverage")
def coverage():
    from .repository import _load, DATA
    actual = dict(_load(DATA / "final_validation.json")["coverage"])
    actual.update(site_counts=REPO.summary()["site_counts"], series_files=len(REPO.series))
    return envelope(actual)

@router.get("/limitations")
def limitations():
    return envelope({"markdown": REPO.limitations_markdown, "scientific_flags": REPO.summary()["scientific_flags"], "overall_similarity_percentage": None, "notes": "All source-specific limitations, model/observation classes, units, and typed nulls are preserved from the validated master dataset."})

@router.get("/earth/geojson")
def earth_geojson():
    return envelope(REPO.sites_doc["earth_map"])

@router.get("/planetary-regions")
def planetary_regions(body: str = Query(..., pattern="^(Moon|Mars)$")):
    key = "moon_regional_selection" if body == "Moon" else "mars_regional_selection"
    return envelope(REPO.sites_doc[key])

@router.get("/research-purposes")
def research_purposes(): return envelope(REPO.purposes)

@router.get("/comparison-categories")
def comparison_categories(): return envelope(REPO.categories)

@router.get("/crater-profile-scores")
def crater_profile_scores(): return envelope(REPO.comparisons_doc.get("exact_crater_profile_scores", []))


@router.get("/crater-profiles")
def crater_profiles(earth_site_id: str, planetary_site_id: str):
    import csv
    from .repository import DATA
    if earth_site_id not in REPO.sites or planetary_site_id not in REPO.sites:
        raise HTTPException(404, "site not found")
    mapping = {"EARTH-VREDEFORT":"vredefort","EARTH-SUDBURY":"sudbury","EARTH-MANICOUAGAN":"manicouagan","MOON-ORIENTALE":"orientale","MARS-HELLAS":"hellas"}
    records = []
    if earth_site_id in mapping and planetary_site_id in mapping and REPO.sites[earth_site_id]["body"] == "Earth" and REPO.sites[planetary_site_id]["body"] != "Earth":
        with (DATA / "catalogs" / "retained_crater_profiles.csv").open(newline="") as stream:
            rows = list(csv.DictReader(stream))
        earth = {float(r["r_over_R"]):float(r["normalized_shape"]) for r in rows if r["site"] == mapping[earth_site_id]}
        planet = {float(r["r_over_R"]):float(r["normalized_shape"]) for r in rows if r["site"] == mapping[planetary_site_id]}
        records = [{"r_over_R":radius,"earth_normalized_shape":earth.get(radius),"planetary_normalized_shape":planet.get(radius)} for radius in sorted(set(earth)|set(planet))]
    return envelope({"records":records,"source_id":"RETAINED_CRATER_PROFILES","source_file":"retained_crater_profiles.csv","data_class":"PRIOR_DERIVED_EXPERIMENTAL_PROFILE","unit":"dimensionless normalized shape","axis_unit":"radial distance / source crater radius (r/R)","status":"PRESENT_RETAINED_PROFILE" if records else "DATA_UNAVAILABLE","limitations":"15 normalized bins from the preserved basin-scale experiment; Gaussian-filtered Earth 6arcmin/planetary6arcmin grids. Not local slope, a geological-unit map, landing safety, or overall similarity. Original raw GMT products unavailable."})
