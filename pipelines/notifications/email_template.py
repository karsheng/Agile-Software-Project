import fetch_user

# email list
receiver_info = fetch_user.target_user_info()

def email_receipent():
    email_receiver = []
    for i in range(0, len(receiver_info)):
        email = receiver_info[i].get('email')
        name = receiver_info[i].get('name')
        
        email_receiver.append({
            'email' : email, 
            'name' :  name})
    
    return email_receiver
    
def email_subject():
    return "Significant changes to the prices / sentiment in your favourite products"

def email_body():
    return '''Hello there!!

We noticed an extreme movement in prices / sentiment in some of the products you're following.
It's time to have a look and invest according to the movement!

From
MONEY MOOD'''



