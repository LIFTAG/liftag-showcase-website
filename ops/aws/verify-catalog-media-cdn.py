"""Read-only smoke test for the public CDN, including CORS, cache hits and ranges."""
import concurrent.futures
import json
import urllib.parse
import urllib.request

DOMAINS = {
    "production": "dg7n4oxpac1h9.cloudfront.net",
    "staging": "d3tf9y94un7tuc.cloudfront.net",
}
EXERCISE = "/incline-dumbbell-press/videos/20260828T124537Z/"


def request(url, *, origin=None, method="GET", byte_range=None):
    headers = {}
    if origin:
        headers["Origin"] = origin
    if byte_range:
        headers["Range"] = byte_range
    with urllib.request.urlopen(
        urllib.request.Request(url, headers=headers, method=method), timeout=30
    ) as response:
        assert response.status == (206 if byte_range else 200), (url, response.status)
        assert response.headers.get("Access-Control-Allow-Origin") == "*", url
        assert "immutable" in response.headers.get("Cache-Control", ""), url
        return dict(response.headers), response.read()


def verify(environment, domain):
    master_url = "https://" + domain + EXERCISE + "master.m3u8"
    # Exercise native-style fetches followed by CORS fetches of the same URL.
    _, master = request(master_url)
    request(master_url, origin="https://liftag.fit")
    headers, _ = request(master_url, origin="http://localhost:3000")
    cache = next((value for key, value in headers.items() if key.lower() == "x-cache"), "")
    assert "Hit from cloudfront" in cache, (master_url, cache)
    playlists = []
    for line in master.decode().splitlines():
        if line.startswith("#EXT-X-MEDIA:"):
            playlists.append(urllib.parse.urljoin(master_url, line.split('URI="')[1].split('"')[0]))
        elif line and not line.startswith("#"):
            playlists.append(urllib.parse.urljoin(master_url, line))
    segments = []
    for url in playlists:
        _, body = request(url, origin="https://liftag.fit")
        segments.extend(
            urllib.parse.urljoin(url, line)
            for line in body.decode().splitlines()
            if line and not line.startswith("#")
        )
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        list(executor.map(lambda url: request(url, origin="https://liftag.fit", method="HEAD"), segments))
    assert len(playlists) == 3 and len(segments) == 12, (playlists, segments)
    headers, body = request(segments[0], origin="https://liftag.fit", byte_range="bytes=0-187")
    assert len(body) == 188, len(body)
    assert next(value for key, value in headers.items() if key.lower() == "content-range").startswith("bytes 0-187/")
    return {"environment": environment, "domain": domain, "playlists": len(playlists), "segments": len(segments), "cors": "passed with and without Origin", "cache": cache, "range": "206, 188 bytes"}


if __name__ == "__main__":
    for environment, domain in DOMAINS.items():
        print(json.dumps(verify(environment, domain)))
