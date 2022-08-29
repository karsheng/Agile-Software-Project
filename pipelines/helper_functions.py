from firebase_admin import db

def find_eligible_products(product_type, products):
    target_products = []
    for i in range(0, len(products)):
        product_path = product_type + '/' + products[i] + '/prices'
        
        #fetch product 
        product = db.reference(product_path).get()
        price1 = (product[0].get('price (USD)'))
        price2 = (product[1].get('price (USD)'))

        # calculate percentage
        if(price1> price2):
            diff = price1 - price2
        else: 
            diff = price2 - price1
        
        percentage = (diff/price2) * 100

        if(percentage >= 10):
            target_products.append(products[i])
    
    return target_products

# function for checking matching products
def list_contains(List1, List2):
    prod = []

    # Iterate in the 1st list
    for m in List1:

        # Iterate in the 2nd list
        for n in List2:

            # if there is a match
            if m == n:
                prod.append(m)
                return prod

    return prod