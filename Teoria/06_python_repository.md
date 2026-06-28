# Ingegneria del Software Avanzata A.A. 2025/2026

## Progetti in Python

Docente: Damiano Azzolini - Università di Ferrara

---

<!-- ## Struttura di un Repository Python

Ci sono diverse possibilità.
Supponiamo di avere un progetto (cartella corrente) che si chiami `prova`.
La struttura:
- file README.md nella root del progetto
- file LICENSE (se necessario) root del progetto
- cartella `src/prova` (con lo stesso nome del progetto) che contiene il codice sorgente
- cartella `tests` che contiene i test
- eventuale cartella `docs` -->

## Inizializzazione Progetto
Utilizziamo lo strumento [`uv`](https://docs.astral.sh/uv/#highlights).

Dopo averlo installato, possiamo inizializzare un progetto (consideriamo `prova` come sopra) con
```
uv init prova
```
Viene creata una cartella che contiene alcuni file
```
prova
├── README.md
├── main.py
└── pyproject.toml
```

Il file [`pyproject.toml`](https://packaging.python.org/en/latest/guides/writing-pyproject-toml/) è un file di configurazione per un progetto Python.

Il comando `uv add` ci permette di aggiungere delle dipendenze al progetto.
Aggiungiamo per esempio `pytest`.
```
uv add pytest
```
Il comando sopra aggiunge una riga in `dependencies` nel file `pyproject.toml`.

Copiamo il contenuto della nostra applicazione in `main.py` poi lanciamolo con 
```
uv run main.py
```

Aggiungiamo la dipendenza `ruff`
```
uv add ruff
```

Poi possiamo analizzare il file con
```
uv run ruff check main.py 
```

Aggiungiamo un altro linter: `pylint`.
```
uv add pylint
```
poi lanciamo
```
uv run pylint main.py 
```