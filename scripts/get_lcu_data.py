import champion_mapping

connector = Connector()
@connector.ws.register('/lol-champ-select/v1/session', event_types=('UPDATE', 'DELETE'))
    