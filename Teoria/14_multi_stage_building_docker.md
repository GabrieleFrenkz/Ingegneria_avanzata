# Ingegneria del Software Avanzata A.A. 2025/2026
## Multi Stage Building

Docente: Damiano Azzolini - Università di Ferrara

---

**Multi stage building**: utilizzo più istruzioni `FROM` in un Dockerfile.

Consideriamo un'applicazione in C che deve essere compilata poi eseguita.
Invece che compilare in locale e poi caricare il compilato vorrei compilare il codice direttamente su un container Docker.

Creo un file `main.c` con un'applicazione che semplicemente stampa gli argomenti passati da linea di comando.

```c
#include <stdio.h>

int main(int argc, char **argv) {
    int i = 0;
    for(i = 1; i < argc; i++) {
        printf("Argument: %s\n", argv[i]);
    }

    if(argc == 1) {
        printf("No arguments\n");
    }

    return 0;
}
```

con `Dockerfile` (parto dall'immagine `gcc` cond dimensione 470 MB)
```Dockerfile
FROM gcc

WORKDIR home/my_c_app

COPY main.c .

RUN ["gcc", "main.c"]

ENTRYPOINT ["./a.out"]
```

```bash
$ sudo docker image build --tag my_c_app:2026 .
$ sudo docker container run my_c_app:2026
No arguments
$ sudo docker container run my_c_app:2026 ciao prova
Argument: ciao
Argument: prova
```

Proviamo ad analizzare l'immagine `ubuntu`, che ha dimensione molto minore rispetto a gcc (< 30 MB).
Per eseguire l'applicazione mi basta solamente `ubuntu`, non serve anche `gcc`: mi piacerebbe compilare e poi 'spostare' il compilato in un'immagine che ha solamente ubuntu.

```bash
$ sudo docker image ls
my_c_app                    2026      c82f0ac16c1f   5 minutes ago    1.38GB
```

Creo `light.Dockerfile`
```Dockerfile
FROM gcc AS compile_stage
WORKDIR home/my_c_app
COPY main.c .
RUN ["gcc", "main.c", "-o", "compiled"]

FROM ubuntu
WORKDIR home/my_c_app
COPY --from=compile_stage home/my_c_app/compiled .
ENTRYPOINT ["./compiled"]
```

```bash
$ sudo docker image build -f light.Dockerfile --tag my_c_app_light:2026 .
$ sudo docker container run my_c_app_light:2026 ciao prova
Argument: ciao
Argument: prova
```

ed ora
```bash
$ sudo docker image ls
my_c_app_light              2026      8a1af420cd68   About a minute ago   77.9MB
my_c_app                    2026      c82f0ac16c1f   9 minutes ago        1.38GB
```

Notare la dimensione molto minore della seconda immagine.