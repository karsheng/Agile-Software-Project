# Web Scraping Google Search results for News articles.

# Importing necessary packages. Selenium, webdriver for browser automation , pandas for data.
import os
import time
import pandas as pd
from datetime import date, timedelta
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.common import NoSuchElementException
from selenium.webdriver.common.by import By

# Initialise Google Chrome as the chosen browser for selenium automation.
# please download chrome webdriver package from chromium website for automation to work.
service = ChromeService(executable_path=ChromeDriverManager().install())

# Launch new Google Chrome instance.
driver = webdriver.Chrome(service=service)

# Specific To and from dates to get articles form
start_date = date(2022, 8, 21)
end_date = date(2022, 8, 22)

# To get articles for today's date un-comment this code.
# start_date = date.today()
# end_date = date.today()

# Crypto products.
# products = ["Bitcoin BTC" , "Ethereum ETH", "Binance BNB", "Cardano ADA", "XRP XRP", "Binance USD BUSD", "Solana SOL", "Dogecoin DOGE", "Polkadot DOT", "Shiba Inu SHIB"]

# Stock products
products = ["APPLE AAPL", "IBM IBM", "GOOGLE GOOG", "BOEING BA", "CHEVRON CVX", "MICROSOFT MSFT"]

# Make a list of all dates between to and from dates above.
days = [start_date + timedelta(days=i) for i in range((end_date - start_date).days + 1)]

for product in products:

    for day in days:

        # Initialize an empty list to store scraped articles.
        articles = []

        # This is URL is opened by selenium in the browser instance.
        url = f'https://www.google.com/search?q=allintext:++{product}&lr=lang_en&cr=countryUS&safe=images&biw=1707&bih=906&sxsrf=ALiCzsYT5Q43RqyVD-KBESXuPKoJs_b5HQ%3A1660929408299&source=lnt&tbs=lr%3Alang_1en%2Cctr%3AcountryUS%2Ccdr%3A1%2Ccd_min:{day.strftime("%m/%d/%Y")}%2Ccd_max:{day.strftime("%m/%d/%Y")}&tbm=nws'
        driver.get(url)

        # Scrape Multiple pages.
        while True:
            # check for Google captcha verification and pauses the script until captcha is verified and resumes after 15seconds.
            try:
                if driver.find_element(By.ID, "captcha-form").is_displayed():
                    No_captcha = False
                    time.sleep(15)
            except NoSuchElementException:
                No_captcha = True
            try:
                if driver.find_element(By.ID, "recaptcha").is_displayed():
                    No_captcha = False
                    time.sleep(15)
            except NoSuchElementException:
                No_captcha = True

            if No_captcha:
                time.sleep(1)

                # driver.find_element(By.ID,"gt-nvframe").click()
                # change class names here according to the website being scraped for results.
                article_Link = driver.find_elements(By.CLASS_NAME, "WlydOe")  # Get the article's link.
                article_Title = driver.find_elements(By.CLASS_NAME,
                                                     "mCBkyc.y355M.ynAwRc.MBeuO.nDgy9d")  # Get the article's Title
                article_Publisher = driver.find_elements(By.CLASS_NAME,
                                                         "CEMjEf.NUnG9d")  # Get the article's publisher/author
                article_Date = day.strftime("%Y-%m-%d")

                # Append all individually scraped details of the article into a single list.
                for i in range(len(article_Title)):
                    articles.append(
                        {'Title': article_Title[i].text, 'Publisher': article_Publisher[i].text, 'Date': article_Date,
                         'Link': article_Link[i].get_attribute('href')})

                # For multiple page scraping keeps going to next page as long there is a next button present on the
                # page. If not Exits the loop.
                try:
                    pagination = driver.find_element(By.ID,
                                                     "pnnext").is_enabled()  # Change the value here for every specific website.
                except NoSuchElementException:
                    pagination = False

                if pagination:
                    driver.find_element(By.ID, "pnnext").click()
                else:
                    break

        # Save the list as a pandas data frame.
        df = pd.DataFrame(articles)

        # Save the dataframe as a .csv file in local directory.

        df.to_csv(f'news/{product}/{day.strftime("%Y-%m-%d")}.csv')
