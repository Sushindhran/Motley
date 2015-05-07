House Hunting Application
=========================

The client is running on http://52.7.23.143/#/

Everything else here is for Development or running the client locally.

Web application that enables one to search for houses with the help of

1) Zillow Estimate API
2) MTA realtime train timings
3) MTA turnstile data
4) NYC crime data

Client
------

### Setup

1) Install NPM dependencies: ```npm install```

2) Build client side code:

For local development
    ```grunt```

3) Start the NGINX server

    sudo grunt start

4) The local server will be running on ```localhost:8080```
    To access the welcome page go to: ```localhost:8080/#/```

##### Grunt tasks:

* ```grunt``` : Build target directory for local development.
* ```grunt deployment```: Build target and deployment directories. Deployment has javascript files minified and CSS files concatenated.
* ```grunt watch:sass```: Watches and builds sass files when changes are made to them.
* ```grunt watchify``` : Watch for changes in the js files and update bundle.js(browserify) on the fly in dev.
* ```grunt start``` : Start NGINX server.
* ```grunt stop``` : Stop NGINX server.
* ```grunt restart``` : Restart NGINX server.

Server
------

### Setup

This is a node.js project. All the relevant code is in server/lib.

1) npm install

2) Before you start off, ensure that you have execute permissions on app.sh

	sudo chmod -R 777 server/lib/app.sh

3) Install mongo if you haven't already. Follow the instructions in the link [here] (http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/)

4) To start the application - server and mongodb

	grunt start

5) To accumulate turnstile data, parse it and store it in mongodb

	grunt accumulate
a

You need HBase installed and you need to start the HBase REST server in order to first accumulate the MTA turnstile data.

To accumulate data, run node lib/accumulator.js from /server

Run all the other files - runDayWiseAv.js, runMonthWiseAv.js, saveStations.js, saveToMongo.js and you will have all the analytics in mongodb.

Please see attached screenshots for proof of working code.
