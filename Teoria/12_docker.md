# Ingegneria del Software Avanzata A.A. 2025/2026
## Docker

Docente: Damiano Azzolini - Università di Ferrara

---

## Processo di Sviluppo Software
Il processo di sviluppo software segue solitamente le seguenti fasi:
* Impostazione dell'ambiente di sviluppo
* Scrittura codice
* Test codice
* Rilascio codice

Le ultime tre fasi vengono ripetute, mentre la prima viene eseguita un'unica volta (o molto meno frequentemente).

### Problemi comuni
* L'applicazione necessita di una specifica versione di una libreria mentre sulla macchina ospite è installata una versione differente
* Come rendere disponibile facilmente l'applicazione?
* Come mantenere e testare diverse versioni dell'applicazione su diversi sistemi operativi?

Soluzioni: Utilizzo di Macchine Virtuali o di Container.

---

## Macchine Virtuali (VM)
Le macchine virtuali sono un'astrazione di una macchina fisica gestite da uno strato software chiamato **hypervisor**. Ogni VM ha un proprio sistema operativo ospite e vede solo le risorse hardware allocate dall'hypervisor (controllo granulare).

**Svantaggi:**
* immagini di diversi GB per il sistema operativo ospite
* spazio di archiviazione allocato anche se non utilizzato
* tempi di avvio elevati (secondi o minuti)

---

## Container
I container sfruttano una funzionalità del kernel del sistema operativo per far coesistere diversi "spazi utente". Sono gestiti da un **container engine**.

Vantaggi rispetto alle VM:
* più leggeri e veloci (avvio in decimi di secondo)
* non richiedono un sistema operativo ospite completo, sfruttano il kernel dell'host
* lo spazio occupato è dell'ordine dei MB


---

## Cos'è Docker
> "Docker is an open platform for developing, shipping, and running applications. Docker enables you to separate your applications from your infrastructure so you can deliver software quickly."

Docker è basato su un'architettura client-server (Docker client e Docker daemon) ed è scritto in Go.

### Concetti Fondamentali
* **Immagine**: modello usato per creare un container (analogia: classe in OOP)
* **Container**: istanza eseguibile di un'immagine (analogia: istanza in OOP)
* **Container Engine**: Gestore che crea, avvia e cancella i container
* **Registry Service**: Servizio di distribuzione delle immagini (es. DockerHub)

---

## Vantaggi di Docker
* **Avvio rapido**
* **Deployment semplificato**: l'immagine contiene già tutte le dipendenze
* **Rilascio semplificato**: basta fare il *push* di una nuova immagine e il cliente esegue il *pull*
* **Testing semplificato**: possibilità di testare in diversi ambienti (es. versioni diverse di Python)
* **Controllo delle risorse e Microservizi**: suddivisione dell'app in componenti specifici

---

## Installazione e Comandi Base
Sito ufficiale: [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/) 

Su Linux: `sudo apt install docker`

**Struttura comandi:** `docker <comando-principale> [<comando-secondario>] [<argomenti>]`

* Verificare versione: `docker version`
* Elenco immagini: `docker image ls`
* Rimuovere immagine: `docker image rm <nome-immagine>`
* Scaricare immagine: `docker image pull <nome-immagine>`

---

## Il Dockerfile
Documento con le istruzioni sequenziali (le istruzioni vengono eseguite in *ordine*) per creare un'immagine.

Ogni istruzione aggiunge un **layer** ad una immagine.

Docker usa la cache per i layer non modificati per velocizzare il build: se un layer è cambiato, allora deve essere eseguito nuovamente il build di quel layer e quelli sottostanti, atrimenti non è necessario.

Posso vedere la struttura di un'immagine con `sudo docker image history` (base layer in basso).

## Istruzioni Principali


### FROM
Specifica l'immagine base, solitamente è la prima istruzione di un Dockerfile.
```dockerfile
FROM <image>[:tag] [AS <name>]
FROM ubuntu
FROM ubuntu:18.04
FROM ubuntu:18.04 AS ub
```


### WORKDIR
Imposta la cartella di lavoro per i comandi successivi (`ADD`, `CMD`, `COPY`, `ENTRYPOINT` e `RUN`, spiegati più avanti).

```dockerfile
WORKDIR <path>
WORKDIR /my_app
```


### COPY
Copia i file all'interno del container che verrà creato partendo dall'immagine definita tramite Dockerfile.

```dockerfile
COPY <src> <dest>
COPY file.txt dir/ # relative path
COPY file.txt /dir/ # absolute path
COPY local_dir remote_dir/
```

### ADD
Copia i file all'interno del container che verrà creato partendo dall'immagine definita tramite Dockerfile.
Simile a `COPY`, ma l'uso di `COPY` è consigliato.

### ARG

Definisce variabili che possono essere passate dall'utente durante la fase di construzione del container.

```dockerfile
ARG <variable>[=<default>]
ARG version
```

e poi

```shell
docker image build --build-arg version=1
```

### RUN
Esegue comandi durante la fase di build.

```dockerfile
RUN <command> # shell form
RUN ["command", "parameter1", "parameter2", ...] # exec form

RUN gcc main.c
RUN ["gcc", "main.c"]
```

<!-- ```dockerfile
ARG PROGRAM=main.c
RUN gcc $PROGRAM # ok
RUN ["gcc", "$PROGRAM"] # error
RUN ["sh", "-c", "gcc $PROGRAM"] # ok
``` -->

> I doppi apici attorno ai comandi e agli argomenti sono obbligatori quando si utilizza il formato exec, perché il comando viene interpretato come un array JSON.


Possono esserci più istruzioni `RUN` in un Dockerfile.

### CMD
Specifica il comando da eseguire quando il container derivato dall'immagine creata con il dockerfile viene avviato.

```dockerfile
CMD <command> # shell form
CMD ["command", "parameter1", "parameter2", ...] # exec form
CMD ["./a.out"]
```

> Deve essere presente un'unica (o nessuna) istruzione `CMD` in un Dockerfile.
Se ci sono più istruzioni `CMD`, solamente l'ultima viene considerata.

`RUN`:
- usata per specificare comandi necessari per compilare i file ed aggiornare i programmi
- eseguita durante il build
- sono consentite più istruzioni `RUN` nello stesso dockerfile

`CMD`:
- specifica il comportamento di un'immagine quando un container derivato da essa parte
- solamente un'istruzione `CMD` in un un dockerfile

### ENTRYPOINT
Specifica il comando da eseguire quando il container derivato dall'immagine creata con il dockerfile viene avviato.

Simile a `CMD`, ma i parametri passati da riga di comando vengono appesi ad esso.

```Dockerfile
ENTRYPOINT ["program", "parameter1", ...]  
ENTRYPOINT ["./a.out"]
```

```shell
docker container run my_app
```

Il comando sopra esegue il container `my_app` e poi il comando che si trova nell'istruzione `ENTRYPOINT`.

```shell
docker container run my_app test
```

In questo caso, `test` viene considerato come parametro per il comando specificato in `ENTRYPOINT`.
Il comando eseguito sarà `./a.out test`.


Sia `ENTRYPOINT` che `CMD` presenti
```Dockerfile
ENTRYPOINT ["p0", "arg0"]
CMD ["p1", "arg1"]
```
poi
```shell
docker container run container_name
```

Viene useguito il comando `p0 arg0 p1 arg1`, cioè gli argomenti di `CMD` sono considerati argomenti per il comando specificato in `ENTRYPOINT`.

```Dockerfile
ENTRYPOINT ["p0", "arg0"]
```
poi
```shell
docker container run container_name arg1
```

Viene eseguito il comando `p0 arg0 arg1` (`arg1` è considerato come parametro).

```Dockerfile
CMD ["p0", "arg0"]
```
poi
```shell
docker container run container_name arg1
```
Viene eseguito `arg1` (`CMD` viene ignorato).


### ENV

Imposta variabili d'ambiente.

```Dockerfile
ENV <var>=<value>
ENV VER=1.3
```

### EXPOSE
Utilizzata per specificare che il container derivato dall'immagine è in ascolto su una porta specifica.

```Dockerfile
EXPOSE <port>
EXPOSE <port>/<protocol>
EXPOSE 80/tcp
```

### Altre Istruzioni
Sono disponibili altre istruzioni tra cui:
- `VOLUME`
- `USER`
- `ONBUILD`
- `STOPSIGNAL`
- `HEALTHCHECK`
- `SHELL`

## Ignorare File
Il file `.dockerignore` (deve chiamarsi così) permette di specificare i file da ignorare durante la creazione di un container partendo da un'immagine specificata tramite Dockerfile.

Simile al file `.gitignore`.

## Esempio di Dockerfile
```Dockerfile
# Utilizzo l'immagine node:12.18.1 come immagine base: includo
# nell'immagine corrente tutte le funzionalita' dell'immagine
# node:12.18.1
FROM node:12.18.1

# Imposto una cartella di lavoro: cartella nella quale verranno
# eseguiti diversi comandi, tra cui COPY
WORKDIR /usr/src/app

# Copia i file dall'host nella posizione corrente
COPY package.json .

# Eseguo un comando
RUN npm install

# Informo Docker che il container e' in ascolto sulla
# porta 8080
EXPOSE 8080
```


## Gestione dei Container
Comando `container`
```Dockerfile
docker container <comando-secondario>

# elenco container attivi
docker container ls

# elenco tutti i container
docker container ls -a

# creare ed eseguire container partendo da un'immagine
docker container run <nome-immagine>

# modalità interattiva
docker container run -it <nome-immagine> bash

# eliminare container
docker container rm <nome-container>
```

Detach quando si è in modalità interattiva: `Ctrl+p`, `Ctrl+q` per uscire senza terminare il container.

## Pubblicazione Immagini

[DockerHub](https://hub.docker.com) è un servizio cloud per la registrazione e pubblicazione di immagini.


Per pubblicare su DockerHub:
- creare un alias: `docker image tag <local-image> <username>/<repo>:<tag>`
- caricare: `docker image push <username>/<repo>:<tag>`

I repository remoti seguono la convenzione `<nome-utente>/<nome-immagine>`.