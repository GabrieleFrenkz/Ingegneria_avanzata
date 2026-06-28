# Ingegneria del Software Avanzata A.A. 2025/2026
## Introduzione alla Code Review


Docente: Damiano Azzolini - Università di Ferrara


---

## Cos'è la Code Review?
La **Code Review** (revisione del codice) è il processo in cui uno o più sviluppatori esaminano il codice scritto da un collega prima che venga integrato nel ramo principale del progetto.

**Obiettivo**: migliorare il prodotto software.

---

## Perché è Fondamentale?
I vantaggi principali per il team e per il prodotto sono:

1. **Qualità:** intercetta (sperabilmente) bug, vulnerabilità e difetti logici prima della produzione
2. **Condivisione della conoscenza:** tutti gli sviluppatori conoscono (almeno approssimativamente) le diverse parti del sistema
3. **Mentorship:** gli sviluppatori junior imparano le best practice mentre gli sviluppatori senior ricevono nuove prospettive
4. **Standardizzazione:** garantisce che il codice segua le stesse linee guida stilistiche e architetturali

---

## Il Processo Tipico (Pull Request)

1. **Sviluppo:** il programmatore scrive il codice su un branch separato
2. **Creazione PR:** il programmatore apre una Pull Request (PR)
3. **Review:** i colleghi (reviewers) leggono il codice e lasciano commenti
4. **Iterazione:** il programmatore risponde ai commenti e aggiorna il codice
5. **Approvazione e Merge:** la pull request viene approvata e il codice integrato

---

## Suggerimenti per il Programmatore

* **PR Piccole e Mirate:** risolvere un solo problema per PR
* **Descrizioni Chiare:** spiegare *cosa* è stato fatto e *perché* nella descrizione della PR
* **Autorevisione:** rileggere il stesso codice prima di chiedere agli altri di farlo

---

## Suggerimenti per il Revisore

* **Chiarezza:** differenziare tra cambiamento obbligatorio o suggerimento stilistico

---

## La Checklist
Cosa controllare:
* **Architettura e Design:** l'approccio generale è coerente?
* **Leggibilità e Nomi:** le variabili e le funzioni hanno nomi esplicativi? Il codice si "legge bene"?
* **Logica e Bug:** ci sono casi particolari non gestiti? Cicli infiniti?
* **Test:** il nuovo codice è coperto da test unitari/di integrazione?
* **Sicurezza:** i dati in ingresso sono validati?

---

## Strumenti Comuni
La Code Review moderna è supportata da piattaforme avanzate:

* **GitHub**
* **GitLab**
* **Bitbucket**
* Strumenti di *Static Analysis* per automatizzare la ricerca di alcuni bug

---

## Esempio in Python

- linter (es. `Ruff`, `Flake8`, `Pylint`)
- auto-formatter (es. `Black` o `YAPF`)
- invece dei classici cicli for con indici usare `enumerate()` e/o `zip()`
- per filtrare/creare liste preferire *List/Dict Comprehensions*
- apertura file con (`with open(...) as file:`) per garantire la chiusura corretta di file e connessioni
- utilizzo Type Hinting
  - *KO:* `def calcola_sconto(prezzo, percentuale):`
  - *OK:* `def calcola_sconto(prezzo: float, percentuale: float) -> float:`
- controllare la presenza delle **docstring**
  - c'è uno standard?
  - la docstring spiega *perché* una funzione fa una certa cosa (il *come* lo spiega il codice)
