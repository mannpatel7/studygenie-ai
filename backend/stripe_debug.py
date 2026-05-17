import json
import urllib.request
import urllib.error
import time

base = 'http://localhost:5001'
email = f'stripe-test-cli-{int(time.time())}@example.com'

try:
    req = urllib.request.Request(
        base + '/api/auth/register',
        data=json.dumps({'name': 'Stripe Test', 'email': email, 'password': 'Test1234'}).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
    )
    with urllib.request.urlopen(req) as r:
        data = json.load(r)
        print('register OK', data)
        token = data['token']

    req2 = urllib.request.Request(
        base + '/api/billing/create-checkout-session',
        data=b'{}',
        headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'},
    )
    with urllib.request.urlopen(req2) as r2:
        data2 = json.load(r2)
        print('session OK', data2)
except urllib.error.HTTPError as e:
    print('HTTP', e.code)
    body = e.read().decode('utf-8')
    print(body)
except Exception as e:
    print('ERR', e)
