import fetch_email

# email list
receipent_info = fetch_email.target_user_info()


receipent_user_emails = []
for i in range(0, len(receipent_info)):
    email = receipent_info[i].get('email')
    name = receipent_info[i].get('name')
    cryptos = receipent_info[i].get('cryptos')
    stocks = receipent_info[i].get('stocks')
    
    receipent_user_emails.append({
        'email' : email, 
        'name' :  name})

def email_list():
    return receipent_user_emails

def email_subject():
    return "Extreme movement in prices of your favourite cryptos and stocks Today"

def email_body():
    return '''Hello there!!

We noticed an extreme movement in prices in some of the products you're following.
It's time to have a look and invest according to the movement!

From
MONEY MOOD'''



