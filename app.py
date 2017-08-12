#!flask/bin/python
import pymongo
import json
from flask import Flask , send_file,request
from flask_cors import CORS , cross_origin
from pymongo import MongoClient
from bson import Binary, Code
from bson.json_util import dumps
from flask_socketio import SocketIO,emit,send

app = Flask(__name__)
CORS(app)
socketApp = SocketIO(app)
client = MongoClient('mongodb://localhost:27017/')

@socketApp.on('connect', namespace='/poll')
def test_connect():
    print('Connected')

@socketApp.on('refreshData', namespace='/poll')
def refresh():
    print('refreshData')

@socketApp.on('send_message', namespace='/poll')
def handle_message(data):
    countDownloads = client.Empatica.downloads.count()
    print(countDownloads)
    resp = { 'refresh' : ( countDownloads - int(data['message']) )   }
    emit('refreshMap', resp, namespace='/poll', broadcast=True)

#connectionMongo = MongoClient(host="localhost" , port=80, max_pool_size=100 , document_class=dict,tz_aware=False)
@app.route('/downloads',methods=['GET']) 
def mapData():
    data =  client.Empatica.downloads.find();
    return dumps(data)

@app.route('/last_download',methods=['GET']) 
def lastData():
    print(request.args.get('limit'))
    data =  client.Empatica.downloads.find().sort([('_id',pymongo.DESCENDING)]).limit(int( request.args.get('limit')) )
    return dumps(data)
 


#app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

if __name__ == '__main__':
    socketApp.run(app, port=5000)
    app.run(debug=True)