import helper_functions
from src.firebase_ad import init_firebase

init_firebase()

from firebase_admin import db

# fetch users
users = db.reference('users').get()
user_info = list(users.items())

# print(user_info)
crpt = ['btc', 'ada', 'xrp', 'sol', 'dot']
stck = ['aapl', 'goog', 'msft', 'ba','ibm']

eligible_cryptos = helper_functions.find_eligible_products('cryptos', crpt)
eligible_stocks = helper_functions.find_eligible_products('stocks', stck)

def target_user_info():
    user_info_final_list = []

    for i in range(0, len(user_info)):
        cryptos = (user_info[i][1].get('cryptos'))
        email = (user_info[i][1].get('email'))
        stocks = (user_info[i][1].get('stocks'))
        
        if(isinstance(cryptos, str)):
            crypto_list = cryptos.split(',')
            user_cryptos = helper_functions.list_contains(eligible_cryptos, crypto_list)

        if(isinstance(stocks, str)):
            stock_list = stocks.split(',')
            user_stocks = helper_functions.list_contains(eligible_stocks, stock_list)

        if(user_cryptos or user_stocks):
            user_info_final = {
                "email" : email,
                "cryptos": user_cryptos,
                "stocks" : user_stocks,
                "name" : str(email[ : email.index('@')])
            }
            user_info_final_list.append(user_info_final)
    
    return user_info_final_list
