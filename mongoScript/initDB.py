import pymongo
import random
import datetime
from datetime import date ,datetime,time
from pymongo import MongoClient,Connection
from geopy.geocoders import Nominatim

client = MongoClient('mongodb://localhost:27017/')
db=client['Empatica']
geolocator = Nominatim()
data = []
cont=0
db.downloads.remove()
while cont<1000:
    longit =  random.randint(0,150) if random.randint(0,1) == 0  else  - random.randint(0,150) 
    lat =   random.randint(0,70) if random.randint(0,1) == 0  else  - random.randint(0,70) 
    location = geolocator.reverse(str(longit)+ ".0 , " +  str(lat)+".0" )
    #dateDownloads = datetime.date(random.randint(2000 , 2017),random.randint(1,12),random.randint(1 , 28))
    datetimeDownload = datetime(random.randint(2000 , 2016),random.randint(1,12),random.randint(1 , 28) , hour=random.randint(0 , 23), minute= random.randint(0 , 59), second=random.randint(0 , 59),
    microsecond=0,tzinfo=None,fold=0)
    print(location.raw)
    country =  location.raw['address']['country']  if ( (('error' in location.raw) == False )  and  ( ('address' in location.raw) == True) and ( ('country' in location.raw['address']) == True)  ) else 'Italy'   
    db.downloads.insert({ 'latitude' :lat  ,'longitude' :longit , 'download_at' : datetimeDownload.ctime() , 'app_id' : "IOS_ALERT", 'country' :  country });
    cont = cont+1
