import json
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.repository import REPO

client = TestClient(app)

@pytest.mark.parametrize('body,count', [('Earth',14),('Moon',2),('Mars',1)])
def test_world_counts(body,count):
    assert next(x for x in client.get('/api/worlds').json()['data'] if x['body']==body)['site_count'] == count

@pytest.mark.parametrize('site_id', sorted(REPO.sites))
def test_each_active_site_is_addressable(site_id):
    response = client.get('/api/sites/' + site_id)
    assert response.status_code == 200
    assert response.json()['data']['site_id'] == site_id

@pytest.mark.parametrize('site_id', sorted(REPO.sites))
def test_each_site_has_allowlisted_series(site_id):
    rows = client.get('/api/timeseries', params={'site_id': site_id, 'limit': 500}).json()['data']['items']
    assert rows and all(x['site_id'] == site_id for x in rows)

@pytest.mark.parametrize('kind,expected', [
    ('monthly_climate',120), ('annual_climate',10), ('climatology_months',12),
    ('power_monthly',120), ('solar_monthly',120), ('soil_depth_profiles',6),
])
def test_earth_series_record_counts(kind,expected):
    r = client.get('/api/timeseries/'+kind, params={'site_id':'EARTH-VREDEFORT','limit':5000})
    assert r.status_code == 200 and r.json()['meta']['total'] == expected

def test_actual_mcd_record_counts():
    for kind, expected in [('mcd_seasonal',625),('mcd_seasonal_summary',25),('mcd_vertical_and_10m',1500),('tes_inertia',2)]:
        r = client.get('/api/timeseries/'+kind, params={'site_id':'MARS-HELLAS','limit':5000})
        assert r.status_code == 200 and r.json()['meta']['total'] == expected

def test_actual_diviner_record_counts():
    for site_id in ('MOON-ORIENTALE','MOON-MONS-MOUTON'):
        r = client.get('/api/timeseries/diviner_local_time', params={'site_id':site_id,'limit':5000})
        assert r.status_code == 200 and r.json()['meta']['total'] == 96

def test_no_series_path_leak():
    r = client.get('/api/timeseries/monthly_climate', params={'site_id':'EARTH-VREDEFORT','limit':1})
    text = r.text
    assert '/home/ubuntu' not in text and 'password=' not in text.lower()

def test_unknown_series_is_not_file_access():
    assert client.get('/api/timeseries/../../etc/passwd', params={'site_id':'EARTH-VREDEFORT'}).status_code in (404,307)
    assert client.get('/api/timeseries/not_a_real_series', params={'site_id':'EARTH-VREDEFORT'}).status_code == 404

def test_source_catalog_count_and_filters():
    assert client.get('/api/sources', params={'limit':500}).json()['meta']['total'] == 39
    assert client.get('/api/sources', params={'body':'Mars','limit':500}).json()['meta']['total'] >= 1
    assert client.get('/api/sources', params={'source_id':'MARS_MCD_62','limit':500}).json()['meta']['total'] == 1

def test_measurement_filters_are_effective():
    all_rows = client.get('/api/measurements', params={'limit':500}).json()['meta']['total']
    filtered = client.get('/api/measurements', params={'source_id':'EARTH_SOILGRIDS','limit':500}).json()['meta']['total']
    assert all_rows > filtered > 0

def test_comparison_category_filter():
    cats = client.get('/api/comparison-categories').json()['data']
    assert cats
    assert client.get('/api/comparisons', params={'category':cats[0],'limit':500}).json()['meta']['total'] > 0

def test_recommendation_filters_and_null_rank_sort():
    purposes = client.get('/api/research-purposes').json()['data']
    rows = client.get('/api/recommendations', params={'research_purpose':purposes[0], 'sort':'rank', 'limit':500}).json()['data']
    assert len(rows) == 42
    ranked = [r['rank'] for r in rows if r['rank'] is not None]
    assert ranked == sorted(ranked)
    assert all(r['rank'] is None for r in rows[len(ranked):])

def test_geojson_contains_only_earth_sites():
    features = client.get('/api/earth/geojson').json()['data']['features']
    assert len(features) == 14
    assert all(f['properties']['body'] == 'Earth' for f in features)

def test_scientific_flags_and_exact_rmse():
    summary = client.get('/api/summary').json()['data']
    assert summary['overall_similarity_percentage'] is None
    assert any('MCD' in flag for flag in summary['scientific_flags'])
    scores = client.get('/api/crater-profile-scores').json()['data']
    assert [x['shape_rmse'] for x in scores] == [
        0.225446732949634,1.0782779819185586,1.7128564141044667,
        0.7107488909059236,1.4024113807422527,1.485520933477032
    ]

def test_openapi_lists_api_routes():
    spec = client.get('/openapi.json').json()
    for path in ['/api/health','/api/sites','/api/timeseries/{series_type}','/api/comparisons','/api/recommendations']:
        assert path in spec['paths']

def test_cors_disallows_unknown_origin():
    r = client.get('/api/health', headers={'Origin':'https://not-allowed.invalid'})
    assert r.headers.get('access-control-allow-origin') is None
