# Agile-Software-Project - Money Mood

## Set up virtual environment and install dependencies

At the root directory:

```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cd web-app
npm install
```

## Running the development environment

NOTE: You will need to specify the relevant the environment variables e.g with a `.env` file for the app to work properly.

Always ensure that the virtual environment is activated:

```
source venv/bin/activate
```

### Running the Flask App

At the root directory:

```
flask run --port 8080
```

### Running the React App

From root directory, change directory to web-app

```
cd web-app
npm start
```

The app should be running at `localhost:3000`.

## Versions [For reference only]

```
npm: 8.5.5
node: v17.8.0
Python: 3.9
pip: 21.2.3
```
