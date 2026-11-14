import json
from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_ready_summary_counts():
    assert client.get('/api/health').json()['data']['status'] == 'ok'
    assert client.get('/api/ready').json()['data']['series_files'] == 104
    s = client.get('/api/summary').json()['data']
    assert s['site_counts'] == {'Earth': 14, 'Moon': 2, 'Mars': 1}
    assert s['comparison_records'] == 420 and s['recommendation_records'] == 210

def test_sites_and_foreign_keys():
    assert client.get('/api/sites?limit=500').json()['meta']['total'] == 17
    assert client.get('/api/sites?body=Earth').json()['meta']['total'] == 14
    assert client.get('/api/sites/EARTH-VREDEFORT').json()['data']['site_id'] == 'EARTH-VREDEFORT'
    assert client.get('/api/sites/nope').status_code == 404

def test_actual_series_index_and_payload():
    index = client.get('/api/timeseries?limit=500').json()
    assert index['meta']['total'] == 104
    result = client.get('/api/timeseries/monthly_climate?site_id=EARTH-VREDEFORT&limit=2&variables=year,month,air_temperature_mean_c').json()
    assert result['meta']['total'] == 120
    assert len(result['data']['records']) == 2
    assert set(result['data']['records'][0]) <= {'stable_id','year','month','air_temperature_mean_c'}
    assert result['data']['units']['air_temperature_mean_c'] == 'degC'
    mars = client.get('/api/timeseries/mcd_seasonal?site_id=MARS-HELLAS&limit=5000&ls=0&localtime=12')
    assert mars.status_code == 200
    assert mars.json()['meta']['total'] >= 1

def test_filters_counts_and_exact_scores():
    assert client.get('/api/comparisons?limit=500').json()['meta']['total'] == 420
    assert client.get('/api/recommendations?limit=500').json()['meta']['total'] == 210
    scores = client.get('/api/crater-profile-scores').json()['data']
    assert len(scores) == 6
    assert scores[0]['shape_rmse'] == 0.225446732949634
    assert client.get('/api/recommendations?sort=rank&limit=500').status_code == 200

def test_typed_nulls_and_no_overall_percentage():
    score = client.get('/api/recommendations?limit=1').json()['data'][0]
    assert 'probability' in score and score['probability'] is None
    assert client.get('/api/limitations').json()['data']['overall_similarity_percentage'] is None

def test_coordinate_guardrails_and_geojson():
    geo = client.get('/api/earth/geojson').json()['data']
    assert geo['coordinate_reference_system'].startswith('EPSG:4326')
    assert client.get('/api/planetary-regions?body=Moon').status_code == 200
    assert client.get('/api/planetary-regions?body=Earth').status_code == 422

def test_path_rejection_and_generic_errors():
    assert client.get('/api/timeseries/../../etc/passwd?site_id=EARTH-VREDEFORT').status_code in {404, 307}
    response = client.get('/api/does-not-exist')
    assert response.status_code == 404
    assert 'traceback' not in response.text.lower() and '/home/' not in response.text

def test_cors_openapi():
    response = client.get('/api/health', headers={'Origin':'http://localhost:3000'})
    assert response.headers.get('access-control-allow-origin') == 'http://localhost:3000'
    assert client.get('/openapi.json').status_code == 200
