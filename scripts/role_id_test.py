from roleidentification import get_roles, pull_data

import itertools
import copy
from typing import List

#Pull the data required to make role assignments
champion_roles = pull_data()
champion_roles[0] = {
    'BOTTOM': 0.0,
    'JUNGLE': 0.0,
    'MIDDLE': 0.0,
    'TOP': 0.0,
    'UTILITY': 0.0,
}

# You can pass in a list of champions to `get_roles`
champions = [0, 1, 29, 110, 119]

roles = get_roles(champion_roles, champions)

print(roles)