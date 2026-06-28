# Ingegneria del Software Avanzata A.A. 2025/2026
## Mutation Testing

Docente: Damiano Azzolini - Università di Ferrara

---

## Mutation Testing
Come funziona il mutation testing:
- vengono generati i *mutants*, cioè versioni leggermente modificate del codice sorgente: queste simulano l'introduzione di bug nel codice
- l'obiettivo è che i test che sono stati scritti coprano tutte queste variazioni

## Come Utilizzarlo in Python
Consideriamo il piccolo progetto descritto in `06_python_repository.md` e `07_testing.md`.
Aggiungiamo la dipendenza [`mutmut`](https://mutmut.readthedocs.io/en/latest/index.html)
```
uv add mutmut
```

poi [modifichiamo](https://mutmut.readthedocs.io/en/latest/index.html#configuration) il file `pyproject.toml` specificando di quale file vogliamo generare i mutants

```
[tool.mutmut]
paths_to_mutate = [ "main.py" ] 
```

generiamo i mutants

```
uv run mutmut run
```

controlliamo quali sono stati generati

```
uv run mutmut browse
```

Idealmente i test dovrebbero coprire tutti i mutants generati.

Ricordarsi di ignorare la cartella mutants quando si lancia `pytest`

```
uv run pytest --ignore=mutants/
```