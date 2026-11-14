import pytest
from starlette.testclient import TestClient
from app.main import app
client=TestClient(app)
@pytest.mark.parametrize('path',['/','/explore','/compare','/test-planner','/about'])
def test_built_five_page_routes(path):
    response=client.get(path)
    assert response.status_code==200
    assert response.headers['content-type'].startswith('text/html')
    assert '<div id="root">' in response.text
    assert '/assets/' in response.text
@pytest.mark.parametrize('path',['/unknown-page','/assets/missing.js','/api/missing','/data/website_json/website_sites.json','/backend/app/main.py'])
def test_unknown_paths_never_become_successful_spa_html(path):
    assert client.get(path).status_code==404
