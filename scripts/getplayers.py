import json
from lcu_driver import Connector
from tensorflow.keras.models import load_model
import numpy as np

connector = Connector()
model = load_model('./scripts/champs_model.h5')

#builds the champ mapping
'''
# Because the champion id's have spaces between them, we have to condense them
# to do 1-hot encoding such that every index at the resulting array corresponds
# to a champion

full_champ_json = requests.get('http://ddragon.leagueoflegends.com/cdn/10.16.1/data/en_US/champion.json') \
                        .json()['data']
champ_ids = []
for value in full_champ_json.values():
    champ_ids.append(int(value['key']))
champ_ids.sort()

mapping = [None] * (champ_ids[len(champ_ids)-1] + 1)

for i in range(0,len(champ_ids)):
    mapping[champ_ids[i]] = i

#returns the index given the champion id
def get_mapping(i:int) -> int:
    return(mapping[i])
'''


def get_champion_name(_id):
    """
    this functions takes an _id and returns the associate champions name
    :param _id: any integer from 1 to 555. if there is a champion, it will return the name.
    :return: champions name
    """
    all_champion_id = {
        0: None,
        1: "Annie",
        2: "Olaf",
        3: "Galio",
        4: "Twisted Fate",
        5: "XinZhao",
        6: "Urgot",
        7: "LeBlanc",
        8: "Vladimir",
        9: "Fiddlesticks",
        10: "Kayle",
        11: "Master Yi",
        12: "Alistar",
        13: "Ryze",
        14: "Sion",
        15: "Sivir",
        16: "Soraka",
        17: "Teemo",
        18: "Tristana",
        19: "Warwick",
        20: "Nunu",
        21: "Miss Fortune",
        22: "Ashe",
        23: "Tryndamere",
        24: "Jax",
        25: "Morgana",
        26: "Zilean",
        27: "Singed",
        28: "Evelynn",
        29: "Twitch",
        30: "Karthus",
        31: "Cho'Gath",
        32: "Amumu",
        33: "Rammus",
        34: "Anivia",
        35: "Shaco",
        36: "Dr.Mundo",
        37: "Sona",
        38: "Kassadin",
        39: "Irelia",
        40: "Janna",
        41: "Gangplank",
        42: "Corki",
        43: "Karma",
        44: "Taric",
        45: "Veigar",
        48: "Trundle",
        50: "Swain",
        51: "Caitlyn",
        53: "Blitzcrank",
        54: "Malphite",
        55: "Katarina",
        56: "Nocturne",
        57: "Maokai",
        58: "Renekton",
        59: "JarvanIV",
        60: "Elise",
        61: "Orianna",
        62: "Wukong",
        63: "Brand",
        64: "LeeSin",
        67: "Vayne",
        68: "Rumble",
        69: "Cassiopeia",
        72: "Skarner",
        74: "Heimerdinger",
        75: "Nasus",
        76: "Nidalee",
        77: "Udyr",
        78: "Poppy",
        79: "Gragas",
        80: "Pantheon",
        81: "Ezreal",
        82: "Mordekaiser",
        83: "Yorick",
        84: "Akali",
        85: "Kennen",
        86: "Garen",
        89: "Leona",
        90: "Malzahar",
        91: "Talon",
        92: "Riven",
        96: "Kog'Maw",
        98: "Shen",
        99: "Lux",
        101: "Xerath",
        102: "Shyvana",
        103: "Ahri",
        104: "Graves",
        105: "Fizz",
        106: "Volibear",
        107: "Rengar",
        110: "Varus",
        111: "Nautilus",
        112: "Viktor",
        113: "Sejuani",
        114: "Fiora",
        115: "Ziggs",
        117: "Lulu",
        119: "Draven",
        120: "Hecarim",
        121: "Kha'Zix",
        122: "Darius",
        126: "Jayce",
        127: "Lissandra",
        131: "Diana",
        133: "Quinn",
        134: "Syndra",
        136: "AurelionSol",
        141: "Kayn",
        142: "Zoe",
        143: "Zyra",
        145: "Kai'sa",
        150: "Gnar",
        154: "Zac",
        157: "Yasuo",
        161: "Vel'Koz",
        163: "Taliyah",
        164: "Camille",
        201: "Braum",
        202: "Jhin",
        203: "Kindred",
        222: "Jinx",
        223: "Tahm Kench",
        235: "Senna",
        236: "Lucian",
        238: "Zed",
        240: "Kled",
        245: "Ekko",
        246: "Qiyana",
        254: "Vi",
        266: "Aatrox",
        267: "Nami",
        268: "Azir",
        350: "Yuumi",
        412: "Thresh",
        420: "Illaoi",
        421: "Rek'Sai",
        427: "Ivern",
        429: "Kalista",
        432: "Bard",
        497: "Rakan",
        498: "Xayah",
        516: "Ornn",
        517: "Sylas",
        523: "Aphelios",
        518: "Neeko",
        555: "Pyke",
        777: "Yone",
        875: "Sett",
        876: "Lillia",

    }
    return all_champion_id.get(_id)

# fired when LCU API is ready to be used
@connector.ready
async def connect(connection):
    res = await connection.request('get','/lol-champ-select/v1/session')
    if res.status == 200:
        handleData(await res.json())

# fired when League Client is closed (or disconnected from websocket)
@connector.close
async def disconnect(_):
    await connect.stop()

@connector.ws.register('/lol-champ-select/v1/session', event_types=('UPDATE','DELETE'))
async def champ_select(connection, event):
    handleData(event.data)
    #print(json.dumps(event.data, indent=2))


def handleData(data: dict) -> None:
    team1_champ_ids = [p.get('championId') for p in data.get('myTeam')]
    team2_champ_ids = [p.get('championId') for p in data.get('theirTeam')]

    all_champ_ids = team1_champ_ids + team2_champ_ids
    all_champ_names = [get_champion_name(p) for p in all_champ_ids]
    if len(all_champ_ids) == 10:
        arr = np.array([all_champ_ids])
        prediction = model.predict(x=arr, batch_size=32, verbose=0)
    else:
        prediction = [-1]
    champs = {
        'champ_ids':all_champ_ids,
        'champ_names':all_champ_names,
        'pred': float(prediction[0]),
    }
    print(json.dumps(champs))

connector.start()