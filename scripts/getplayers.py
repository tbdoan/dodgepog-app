import json
from lcu_driver import Connector
from tensorflow.keras.models import load_model
import numpy as np
from roleidentification import pull_data, get_roles
import os.path
from os import path
import champion_mapping

connector = Connector()
# sets up model
if path.exists('./champs_model.h5'):
    model = load_model('./champs_model.h5')
else:
    model = load_model('./scripts/champs_model.h5')

# Pull the data required to make role assignments
champion_roles = pull_data()
champion_roles[0] = {
    'BOTTOM': 0.0,
    'JUNGLE': 0.0,
    'MIDDLE': 0.0,
    'TOP': 0.0,
    'UTILITY': 0.0,
}

##################################################################################

# builds the champ mapping
# Because the champion id's have spaces between them, we have to condense them
# to do 1-hot encoding such that every index at the resulting array corresponds
# to a champion

# full_champ_json = requests.get('http://ddragon.leagueoflegends.com/cdn/10.16.1/data/en_US/champion.json') \
#                         .json()['data']
# champ_ids = []
# for value in full_champ_json.values():
#     champ_ids.append(int(value['key']))
# champ_ids.sort()

# mapping = [None] * (champ_ids[len(champ_ids)-1] + 1)

# for i in range(0,len(champ_ids)):
#     mapping[champ_ids[i]] = i

# #returns the index given the champion id
# def get_mapping(i:int) -> int:
#     return(mapping[i])

##################################################################################


def get_champion_name(_id):
    """
    this functions takes an _id and returns the associate champions name
    :param _id: any integer from 1 to 555. if there is a champion, it will return the name.
    :return: champions name
    """
    all_champion_id = champion_mapping.champion_mapping
    return all_champion_id.get(_id)

# fired when LCU API is ready to be used


@connector.ready
async def connect(connection):
    res = await connection.request('get', '/lol-champ-select/v1/session')
    if res.status == 200:
        handle_data(await res.json())

# fired when League Client is closed (or disconnected from websocket)


@connector.close
async def disconnect(_):
    await connect.stop()


@connector.ws.register('/lol-champ-select/v1/session', event_types=('UPDATE', 'DELETE'))
async def champ_select(connection, event):
    handle_data(event.data)

def handle_data(data: dict) -> None:
    # not in order
    team1_champ_ids = [p.get('championId') for p in data.get('myTeam')]
    team2_champ_ids = [p.get('championId') for p in data.get('theirTeam')]

    # team_champ_ids must be length=5
    if len(team1_champ_ids) == 5 and len(team2_champ_ids) == 5:
        roles1 = get_roles(champion_roles, team1_champ_ids)
        roles2 = get_roles(champion_roles, team2_champ_ids)

        # in order
        team1_champ_ids = list(roles1.values())
        team2_champ_ids = list(roles2.values())

    all_champ_ids = team1_champ_ids + team2_champ_ids
    all_champ_names = [get_champion_name(p) for p in all_champ_ids]
    if len(all_champ_ids) == 10:
        arr = np.array([all_champ_ids])
        prediction = model.predict(x=arr, batch_size=32, verbose=0)
    else:
        prediction = [-1]

    champs = {
        'champ_ids': all_champ_ids,
        'champ_names': all_champ_names,
        'pred': float(prediction[0]),
    }
    print(json.dumps(champs))


connector.start()
