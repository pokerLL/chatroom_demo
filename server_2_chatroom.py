import asyncio
import json
import logging

import websockets

logging.basicConfig()

'''
交换数据格式
action  xxx(message,user)
time    xxx
username    xxx
[meaasge xxx]
'''

USERS = set()
USER_NAME = dict()


async def notify_users():
    if USERS:
        user_num = len(USERS)
        message = {
            "action": "user",
            "user_num": user_num
        }
        await asyncio.wait([user.send(json.dumps(message)) for user in USERS])


async def register(websocket):
    USERS.add(websocket)
    print('new socket:', end=' ')
    print(websocket)
    await notify_users()


async def unregister(websocket):
    USERS.remove(websocket)
    await notify_users()


async def push_message(message):
    if USERS:
        await asyncio.wait([user.send(message) for user in USERS])


async def chatroom_poker(websocket):
    await register(websocket)
    try:
        async for message in websocket:
            data = json.loads(message)
            print(data)
            if data['action'] == 'message':
                await push_message(message)
            else:
                print("???????")
    finally:
        await unregister(websocket)


asyncio.get_event_loop().run_until_complete(
    websockets.serve(chatroom_poker, 'localhost', 6789))
asyncio.get_event_loop().run_forever()
