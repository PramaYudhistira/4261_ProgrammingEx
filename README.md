Instructions to run:

* Frontend: 
    * Its also in the `package.json` file, but the command is `npm start`


* Backend:
    * Written in Flask, best to do this in python venv
    * run `pip install -r requirements.txt`
    * Note: on vscode, the editor may struggle to find the interpreter so just use command palette to find interpreter and select the python interpreter in the venv or whichever way you are running it


    * To run this on a docker container:
        * `docker build -t (image name):(tag, i.e. latest) .` to build image
        * `docker run -p 5000:5000 (image name):(tag)` to run WITHOUT environment variables
        * To run with environment variables:
            * `docker run -p 5000:5000 -e (set environment variables here) (image name):(tag)` 
            * or alernatively ``
        