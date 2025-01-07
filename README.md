# steps to spin the server:
1. `git clone https://github.com/A1iHassan/tester.git`
2. `npm install`
3. `sudo apt update && sudo apt install redis`
4. `sudo systemctl start redis`
5. `cd temp2`
6. `node server.js`


## Test the server:
* `curl http://localhost:5000/api/signup -X POST -H 'Content-Type: application/json' -d '{"name": "ali", "email": "me@me.com", "phone": "12345", "gender": "male", "password": "pass1234"}'` , this will give back a `'{ "message": "User created successfully" }'` message.


* `curl http://localhost:5000/api/login -X POST -d '{"email": "me@me.com", "password": "pass1234"}' -H 'Content-Type: application/json'`, this will give back `{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3MzYyODQwMjc1MDgiLCJpYXQiOjE3MzYyODU4MDcsImV4cCI6MTczNjM3MjIwN30.HSd_VJ_7PhV711gMrbDtYylRMtLOMBuFb5Sme3LhsyA","user":{"id":"1736284027508","name":"ali","email":"me@me.com"}}` message.