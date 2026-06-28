# Ingegneria del Software Avanzata A.A. 2025/2026
## Esempio di Utilizzo di Docker

Docente: Damiano Azzolini - Università di Ferrara

---

Guida per installare
https://docs.docker.com/engine/install/ubuntu/

Usare `sudo /etc/init.d/docker start`
se si ha l'errore
`Cannot connect to the Docker daemon at unix:/var/run/docker.sock. Is the docker daemon running?`

Usare `sudo chmod 666 /var/run/docker.sock` (read e write per owner e group)
se si ha l'errore `Got permission denied while trying to connect to the Docker daemon socket`

Vedere: https://chmod-calculator.com/ per i permission bit.

## Pratica
Controllo se ho delle immagini (`docker image ls`).

Controllo se ho dei container (`docker container ls`) o ho dei container interrotti (`docker container ls -a`).

Proviamo ad utilizzare `docker container run hello-world`: lancio il container passando come argomento l'immagine che voglio eseguire (`hello-world`).
Questa immagine sarà cercata prima in locale e poi su dockerhub.
Quando l'immagine è stata scaricata, docker la trasforma in un container e la esegue.
```
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
2db29710123e: Pull complete 
Digest: sha256:10d7d58d5ebd2a652f4d93fdd86da8f265f5318c6a73cc5b6a9798ff6d2b2e67
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
...
To try something more ambitious, you can run an Ubuntu container with:
$ docker run -it ubuntu bash
```
Appare `:latest` perché, non avendo specificato il tagname, di default è `latest` (ultima versione).
Leggere l'output.

Ora, `docker image ls` mostra la nuova immagine.
`docker container ls` mostra nulla mentre `docker container ls -a` mostra il container che abbiamo appena eseguito (il nome che troviamo è stato associato di default).

Proviamo ora, come suggerisce l'output del comando `docker container run hello-world`, ad eseguire `docker run -it ubuntu bash`.
```
Unable to find image 'ubuntu:latest' locally
latest: Pulling from library/ubuntu
e0b25ef51634: Pull complete 
Digest: sha256:9101220a875cee98b016668342c489ff0674f247f6ca20dfc91b91c0f28581ae
Status: Downloaded newer image for ubuntu:latest
root@382d9f22e121:/# 
```
Ci troviamo nella bash del container appena avviato. Posso utilizzare i comandi della bash come `ls`, ecc.

Per uscire dal container, `ctrl p + ctrl q` (questo devo farlo in un terminale oppure modificare le impostazioni di vscode oppure cambiare le detach keys).
Con `docker container ls` vedo che il container è ancora in esecuzione.
Mi ricollego al container con `docker container attach <nome>`.
<!-- Per vedere che rimane in esecuzione in background, eseguire il comando, per esempio, `top`, poi `ctrl p` `ctrl q` e `docker container attach <nome>`.
Si riapre la schermata di prima. -->

Per interrompere un container, `docker container stop <nome>` oppure `ctrl d` dal container.
Con `docker inspect <nome>` ispeziono un container e ottengo alcune informazioni.

Posso far ripartire un container con `docker container start <nome>`.
Con `docker container ls` vedo che il container è stato riavviato.
Posso collegarmi con `docker container attach <nome>`.
Notare che se eseguo nuovamente `docker run -it ubuntu bash` viene creato un nuovo container e non viene riaperto quello precedente.

Cancello un container con `docker container rm <nome>` (o `<id>`).

Assegno un nome ad un container con l'opzione `--name`: `docker run --name ciao -it ubuntu bash`.

Notare che le operazioni sono fatte istantaneamente (a differenza delle VM).

Con `docker container ls -a`, vedo che tutti i container derivano dalla stessa immagine.

`docker container prune` cancella tutti i container inattivi.

## Creazione e distribuzione di un'immagine
Andiamo nel repository dell'applicazione Python discussa nel file `07_testing.md` e seguenti (carrello) e creiamo un container.

Vediamo come inserire tutta la cartella.

Creo il file `Dockerfile` nella cartella del progetto poi inserisco
```Dockerfile
FROM python:latest
WORKDIR /app
COPY main.py .
COPY README.md .
```
Creo l'immagine: `docker image build --tag isa:2026 .` (notare il `.`) alla fine del comando.
Ci mette un po' poi crea l'immagine.

Testiamola: `docker container run -it isa:2026 bash` poi `python3 main.py`.

Come faccio a pubblicarla in remoto?

Creo account dockerhub: registrazione, dockerid rappresenta il nome utente.

Creo un repository remoto: tag Repositories poi click su Create Repository.
Nome: `isa`, poi `Create`.

Facciamo il push su dockerhub.
Prima `docker login`. 
Poi associo `isa:2026` con il mio username e repository su dockerhub: `docker image tag isa:2026 <username>/isa:2026`.
Lo username sarà diverso per ogni studente.
<!-- damianodamianodamiano -->
Infine `docker image push <username>/isa:2026`.
Su dockerhub ora vedo il container. 
<!-- : https://hub.docker.com/r/damianodamianodamiano/isa/tags -->

Provare ora ad eseguire: `docker container run -it damianodamianodamiano/isa:2026 bash` poi `python3 main.py`.
In questo modo, scaricate la mia immagine e la eseguite.

Posso fare delle modifiche al repository, poi nuovemente `docker image build --tag isa:2026 .` e `docker image tag isa:2026 <username>/isa:2026`. 
Notare cached in output.

Posso scaricare le modifiche all'immagine con `docker image pull <username>/isa:2026`.
Eseguendo nuovamente `docker container run -it damianodamianodamiano/isa:2026 bash` poi `python3 main.py` vedo le nuove modifiche.


## Utilizzo di Altri Comandi
----------------

Finora abbiamo eseguito il comando a mano dopo aver fatto partire il container in modalità interattiva.
Proviamo ora a far partire il comando in maniera automatica con `ENTRYPOINT`
Aggiorniamo il Dockerfile con
```Dockerfile
ENTRYPOINT ["python","main.py"]
```

Poi eseguo nuvomente `sudo docker image build --tag isa:2026 .`.
Notare la scritta `CACHED` sui layer.
```
=> CACHED [2/5] WORKDIR /app
=> CACHED [3/5] COPY main.py .
=> CACHED [4/5] COPY README.md .
```

Ottengo ora
```bash
$ sudo docker container run isa:2026
Total order cost: 145.00€
```

Modifichiamo l'applicazione aggiungendo la possibilità di passare due argomenti da linea di comando:
```Python
import argparse

def parse_args():
    parser = argparse.ArgumentParser(description="Process some integers.")
    parser.add_argument('--promo-code', type=str, default="", help='Promo code to apply')
    parser.add_argument('--is-vip', action='store_true', help='Whether the customer is VIP')
    return parser.parse_args()

# poi nella funzione main
args = parse_args()
total = calculate_order_total(order, promo_code=args.promo_code, is_vip=args.is_vip)
```

Proviamo ora a passare gli argomenti come linea di comando: `sudo docker image build --tag isa:2026 .`
Poi
```bash
$ sudo docker container run isa:2026
Total order cost: 155.00€
$ sudo docker container run isa:2026 --promo-code="SAVE10"
Total order cost: 145.00€
```

Pubblichiamo l'applicazione su dockerhub.
```bash
sudo docker login
sudo docker image tag isa:2026 <username>/isa:2026
sudo docker image push <username>/isa:2026
```

<!-- ## Esposizione Porte
Creiamo un web server con flask poi creiamo un'immagine che contenga il sito.
Realizziamo poi un container che esegue il sito ed espone le porte per collegarci.
Usiamo flask: `python -m pip install flask`.

Creo file main.py (lo stesso che c'è nella guida di Flask https://flask.palletsprojects.com/en/3.0.x/quickstart/):
```
from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"
```
eseguo
`flask --app main run`

Ora creiamo un Dockerfile:
```
# parto da un'immagine python già esistente
FROM python

# imposto la workdir
WORKDIR home/website

COPY main.py .

RUN ["python", "-m", "pip", "install", "flask"]

EXPOSE 5000

# 0.0.0.0 ascolta su tutti gli indirizzi
ENTRYPOINT ["flask", "--app", "main", "run", "--host", "0.0.0.0", "--port", "5000"]
```
poi lancio
```
sudo docker image build --tag my_ws:2024 .
sudo docker container run -p 5000:5000 my_ws:2024
```
Posso lanciarla in detached mode con opzione `-d`
```
sudo docker container run -p 5000:5000 -d my_ws:2024
sudo docker container ls
curl http://172.17.0.1:5000
``` -->

<!-- ## Layer


Vediamo meglio l'ordine delle istruzioni come influsice sulla creazione dell'immagine.
Ora abbiamo FROM, WORKDIR, COPY, RUN, EXPOSE e ENTRYPOINT.
Se cambio qualcosa nella directory corrente (quindi il contenuto analizzato da COPY cambierà), tutte le istruzioni sotto verranno eseguite di nuovo.
Provo a cambiare una riga di codice poi creo nuovamente l'immagine e vedo.
Provo ad invertire l'ordine di RUN e COPY.
Build immagine, poi eseguo una modifica nel file main.py e poi nuovamente il build: il comando RUN non viene eseguito nuovamente -->

