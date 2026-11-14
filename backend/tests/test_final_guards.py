from starlette.testclient import TestClient
from app.main import app
from app.repository import REPO
from app.security import public_safe
client = TestClient(app)

def test_root_frontend_and_missing_assets():
    assert client.get('/').status_code == 200
    assert client.get('/assets/nonexistent.js').status_code == 404
    assert client.get('/unknown-front-end-route').status_code == 404

def test_source_derived_counts_and_coverage():
    data = client.get('/api/summary').json()['data']
    assert data['active_sites'] == len(REPO.sites) == 17
    assert data['series_files'] == len(REPO.series) == 104
    assert data['purpose_evidence_records'] == 210
    assert client.get('/api/coverage').json()['data']['hourly_rows'] == 1227408

def test_secret_redaction_and_invalid_sort():
    assert 'sensitiveValue' not in public_safe('api_key = sensitiveValue')
    assert client.get('/api/sites?sort=not_a_field').status_code == 422

def test_null_ranks_stay_last_in_both_directions():
    for sort in ['rank','-rank']:
        rows = client.get('/api/recommendations', params={'sort':sort, 'limit':500}).json()['data']
        seen_null = False
        for row in rows:
            if row['rank'] is None: seen_null = True
            else: assert not seen_null

def test_earth_monthly_date_filter_uses_actual_year_month():
    rows = client.get('/api/sites/EARTH-VREDEFORT/timeseries/monthly_climate', params={'date_from':'2020-01-01','date_to':'2020-12-31','limit':5000}).json()['data']['records']
    assert len(rows) == 12
    assert all(r['year'] == 2020 for r in rows)


def test_retained_crater_profile_values_and_missing_pairs():
    import csv
    from app.repository import DATA
    profile = client.get('/api/crater-profiles',params={'earth_site_id':'EARTH-VREDEFORT','planetary_site_id':'MOON-ORIENTALE'}).json()['data']
    assert len(profile['records']) == 15
    with (DATA/'catalogs'/'retained_crater_profiles.csv').open() as stream:
        source = list(csv.DictReader(stream))
    expected = [float(r['normalized_shape']) for r in source if r['site']=='vredefort']
    assert [r['earth_normalized_shape'] for r in profile['records']] == expected
    absent = client.get('/api/crater-profiles',params={'earth_site_id':'EARTH-ATACAMA','planetary_site_id':'MOON-MONS-MOUTON'}).json()['data']
    assert absent['records'] == [] and absent['status'] == 'DATA_UNAVAILABLE'
