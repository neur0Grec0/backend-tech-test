Matts tech test
Use node 20
npm install
nest start

You can make requests like this using postman
localhost:3000/companies?limit=100&offset=0&filters[industry]=Investment&filters[active]=true

Or Curl in terminal
curl --location --globoff 'localhost:3000/companies?limit=100&offset=0&filters[industry]=Investment&filters[active]=true'
