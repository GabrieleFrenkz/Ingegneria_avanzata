# Ingegneria del Software Avanzata A.A. 2025/2026
## Clean Code

Docente: Damiano Azzolini - Università di Ferrara

---

Scrivere "Clean Code" non significa solo produrre software che funziona, ma scrivere codice che sia **leggibile, manutenibile e facile da evolvere**.

<!-- L'unico modo per misurare davvero la qualità del codice è il numero di "WTF" al minuto durante una code review. -->


## 1. Nomi Significativi
> Il codice dovrebbe essere **auto-esplicativo**.

Per esempio, se è necessario aggiungere un commento per spiegare cosa fa una variabile, allora il nome non è adatto.

* **Evitare abbreviazioni criptiche**: per esempio, usare `daysUntilExpiration` invece di `d_exp`
* **Usare verbi per le funzioni**: per esempio, `calculateTotal()` è meglio di `total()`
* **I nomi devono essere pronunciabili e ricercabili**: per esempio, `MAX_RETRY_ATTEMPTS` è molto più facile da trovare nel codice rispetto a un numero come `5`

## 2. Funzioni: Piccole e Specializzate

> Una funzione dovrebbe fare **una sola cosa**.

* **Limitare il numero di righe di codice all'interno di una funzione/metodo**
* **Limitare gli argomenti**: molti argomenti rendono i test e la comprensione del codice complicati
* **Niente effetti collaterali**: limitare le responsabilità di una funzione

---

## 3. Don't Repeat Yourself

> Ogni elemento logico deve avere una **rappresentazione singola e univoca** all'interno del sistema.

* Se durante lo sviluppo ci si ritrova a fare **copia-incolla**, qualcosa può essere migliorato
* Estrarre la logica comune in una funzione o una classe separata
* Duplicazione significa poca manutenibilità: cambiare una logica presente in molti file diversi è complicato

## 4. Commenti

> I commenti devono essere **appropriati**.

* **Commentare il "perché", non il "cosa":** il codice dice *come* funziona, il commento dovrebbe spiegare le decisioni o vincoli tecnici particolari
* **Eliminare il codice commentato:** per quello esiste Git. Se non serve, cancellarlo

---

## 5. I Principi SOLID
Per la programmazione a oggetti, è consigliato seguire i principi SOLID

| Principio | Descrizione Breve |
| :--- | :--- |
| **S**ingle Responsibility | Una classe deve eseguire un'unica operazione |
| **O**pen/Closed | Una classe deve essere facilmente modificabile, senza necessità di cambiarla |
| **L**iskov Substitution | Le sottoclassi devono poter sostituire le classi base |
| **I**nterface Segregation | Meglio tante interfacce piccole che una "monolitica" |
| **D**ependency Inversion | I moduli ad alto livello non devono dipendere dai moduli di basso livello, ma solo dalle astrazioni |

## Esempio
Come può essere migliorato il seguente codice (Python)?
```
def p(l):
    for i in l:
        if i['status'] == 'active':
            # Calcolo prezzo con tasse al 22%
            t = i['price'] * 1.22
            if i['price'] > 100:
                # Sconto di 10 euro
                t = t - 10
            print(f"Invio ordine {i['id']} per un totale di {t}")
```

<!-- Problematiche:
- Nomi variabili: `p`, `l`, `i`, `t` 
- Numeri nel codice: cosa sono `1.22` e `10`? Sono costanti che dovrebbero avere un nome
- Violazione SRP (Single Responsibility): la funzione filtra, calcola il prezzo, applica lo sconto e stampa a video
- Mancanza di Type Hinting -->