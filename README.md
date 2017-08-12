# map-app

This project is a real-time Map & Dashboard for monitoring downloads from Server
version 0.1.0.

## Build Mongodb instance

To start Mongodb you may have two options :

1. Run mongoDB docker image with `docker run -d --name mongodb -p 27017:27017 mongo` and initialize db with the command `python ./mongoScript/initDB.py` 
2. Install MongoDB from the site and initialize db with the command `python ./mongoScript/initDB.py` 


## Build & development Server

Run `pip install Flask` for install flask, library used for serving API

Run `pip install geopy` for install geopy used for locate coordinates in the import process

Run `pip install -r requirements.txt` for install other library dependencies

Running `python app.py` will start the server with APIs

## Build & development Client

Run `npm install` and `npm install -g bower , grunt-cli` for install all dependencies required  

Run `grunt` for building and `grunt serve` for start the web app.

## Testing

Running `grunt test` will run the unit tests with karma.
