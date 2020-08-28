from lcu_driver import Connector
import json
import requests
import config
connector = Connector()
with open('data.txt') as json_file:

    data = json.load(json_file)
    #start here: data should be a dict
    summonerIds = [p.get('summonerId') for p in data.get('myTeam')]
    
    print(summonerIds)

@connector.ready
async def connect(connection):
    res = await connection.request( 'get', f'/lol-summoner/v1/summoners/{69803225}')
    print(await res.json())



connector.start()