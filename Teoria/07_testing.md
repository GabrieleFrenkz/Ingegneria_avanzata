# Ingegneria del Software Avanzata A.A. 2025/2026
## Testing

Docente: Damiano Azzolini - Università di Ferrara

---

## Fondamenti del Testing
Scrivere test è fondamentale:
* riduzione numero di bug
* miglioramento della struttura del codice
* facilitazione del flusso di sviluppo e mantenimento del codice
* copertura codice (ogni funzione e metodo ha un test associato)
* debugging semplificato (il fallimento di un test indica già parzialmente dov'è il problema)
* documentazione sistema (i test fungono da documentazione parziale)


> Ogni test contiene almeno un'*asserzione* (solitamente indicata con `assert`) che confronta il valore calcolato con la chiamata della funzione con quello atteso e lancia un'eccezione o un errore nel caso i valori siano differenti (in modo automatico).

Solitamente risulta utile utilizzare una sola asserzione per ogni test.

**Note:**
* le asserzioni, quando falliscono, lanciano errori o eccezioni. **NON** bisogna inserire asserzioni in costrutti `try-except` (per Python, analogamente per altri linguaggi di programmazione) per forzare il superamento di un test
* un test senza asserzioni non è un test: confrontare con `if` il valore atteso e calcolato e restituire `True` o `False` non è equivalente ad usare un'asserzione
* il framework di testing deve riportare in maniera automatica il risultato dei test

---

## Test Driven Development

Il test driven development (TDD, sviluppo guidato da test) è un approccio alla programmazione in cui vengono alternate fasi di scrittura codice con fasi di scrittura test.

Evoluzione di test first development, dove il programmatore scrive tutti i test di una funzionalità prima dell'implementazione. Superare il test è il cardine dello sviluppo del programma.

Per ogni incremento, il codice viene sviluppato insieme ai test.

Non si avanza all'incremento successivo finché il codice non passa tutti i test.

---

## Unit Testing
Test di unità, dove per unità si intende la più piccola parte di codice che si può testare. 
Un'unità può essere, per esempio:
* funzione
* metodo
* classe

Risulta importante scrivere unità *abbastanza piccole*, per poter facilmente individuare la causa di un test che fallisce e per mantenere i casi di test piccoli e comprensibili.

---

## Integration Testing
Serie di test che verificano che i diversi moduli interagiscano in maniera corretta.

Con unit testing vengono testati i singoli moduli mentre con integration testing viene testata l'interazione tra i moduli.

---

## Code Coverage

> Code coverage: valore che rappresenta quanto (percentuale e/o linee) codice sorgente è testato.

Solitamente vengono utilizzate alcune metriche:
* function coverage: quante funzioni sono state testate
* statement coverage: quante istruzioni sono state testate
* branch coverage: quanti rami (branch) delle strutture di controllo sono stati testati 
* condition coverage: quante espressioni booleane sono state testate per i valori vero e falso

Le metriche vengono solitamente calcolate come `numero elementi testati / numero elementi identificati`.

## Esempio Code Coverage
```python
# funzione didattica - migliorabile
def positivi(x : int, y : int) -> bool:
    if x > 0 and y > 0:
        return True
    else:
        return False
```

* function coverage: 100% se la funzione viene chiamata almeno una volta durante il test
* statement coverage: 100% se la funzione viene chiamata come `positivi(1,1)` e come `positivi(0,1)`. In questo modo vengono testate tutte le istruzioni
* branch coverage: 100% se la funzione viene chiamata, per esempio, sia come `positivi(1,1)` che come `positivi(0,1)`. In questo modo vengono testati tutti i branch
* condition coverage: 100% se la funzione viene chiamata, per esempio, come `positivi(1,0)` (`x > 0` `True` e `y > 0` `False`) e come `positivi(0,1)` (`x > 0` `False` e `y > 0` `True`). In questo modo vengono testati entrambi i valori di verità per le due espressioni (`x > 0` e `y > 0`)
    - da notare che condition coverage non implica branch coverage: con gli input di questo esempio, non vengono testati entrambi i branch, ma solo quello `False` 

In alcuni framework di testing i nomi possono essere leggermente diversi.

---

## Pytest

Utilizziamo `pytest` come framework di testing.
All'interno di un progetto gestito con uv possiamo usare
```
uv add pytest
```

Convenzioni per `pytest`:
* test definiti in funzioni che iniziano con `test_` che contengono `assert` o lanciano errori
* funzioni in file con il nome `test_....py` o `..._test.py` ed eventualmente contenuti in una cartella `tests` che si trova nella root della cartella corrente

Esecuzione test con il comando `pytest` (`uv run pytest` se gestito con `uv`).

**Cosa non Fare**

```python
def test_dummy(self):
    p = 3
    e = 2
    try: # assert dentro try/catch - SBAGLIATO
        assert p == e
    except:
        assert True
```

**Cosa non Fare**
```python
def test_dummy(self):
    p = 3
    e = 2
    if p == e: # meglio fare assert p == e
        assert True
    else:
        assert False
```

# Esempio
Il seguente codice calcola il prezzo di un ordine date alcune regole di business:
- se l'ordine è vuoto, il totale è 0
- il codice promo code "SAVE10" sconta 10 euro, ma solo se il subtotale è almeno 100 euro
- spedizione gratuita per tutti sopra i 50 euro
- i clienti VIP pagano 2 euro di spedizione se spendono meno di 50 euro mentre tutti gli altri 5 euro

```python
class Product:
    def __init__(self, name: str, price: float, quantity: int):
        """
        Classe che contiene un prodotto.
        """
        self.name = name
        self.price = price
        self.quantity = quantity

def calculate_order_total(
        order: 'list[Product]',
        promo_code : str,
        is_vip : bool
    ) -> float:
    """
    Il seguente codice calcola il prezzo di un ordine date alcune regole di business
    - se l'ordine è vuoto, il totale è 0
    - il codice promo code "SAVE10" sconta 10 euro, ma solo se il subtotale è almeno 100 euro
    - spedizione gratuita per tutti sopra i 50 euro
    - i clienti VIP pagano 2 euro di spedizione se spendono meno di 50 euro mentre tutti gli altri 5 euro
    """
    if not order:
        return 0.0

    # compute total
    subtotal = sum(item.price * item.quantity for item in order)

    # discount if applicable
    if promo_code == "SAVE10" and subtotal >= 100.0:
        subtotal -= 10.0

    # shipping cost
    shipping = 0.0
    if subtotal < 50.0:
        if is_vip:
            shipping = 2.0
        else:
            shipping = 5.0

    return subtotal + shipping


def main():
    order : 'list[Product]' = [
        Product("Scarpe", 25.0, 3),
        Product("Cappello", 15.0, 2)
    ]
    total = calculate_order_total(order, promo_code="SAVE10", is_vip=True)
    print(f"Total order cost: {total:.2f} euro")

if __name__ == "__main__":
    main()
```

## Esempio di Test
Test per ordine vuoto.
```Python
def test_prova():
    # Test case 1: Empty order
    assert calculate_order_total([], "SAVE10", False) == 0.0
```

## Calcolo Coverage
Aggiungiamo [`coverage`](https://coverage.readthedocs.io/en/)
```
uv add coverage
```
Eseguo i test salvando il report
```
uv run coverage run -m pytest 
``` 
e visualizzo il [report](https://coverage.readthedocs.io/en/7.13.5/commands/cmd_report.html#cmd-report) con
```
uv run coverage report -m
```
Si può aggiungere il calcolo del [branch coverage](https://coverage.readthedocs.io/en/7.13.5/branch.html) con l'opzione `--branch`
```
uv run coverage run --branch -m pytest
```

## Esercizio
Scrivere i test per il codice mostrato sopra.

## Raggruppamento Test
Utilizzando `pytest` è possibile utilizzare `@pytest.mark.parametrize` per raggruppare più test.
```Python
@pytest.mark.parametrize("orders, promo_code, is_vip, expected",
    [
		([], "SAVE10", False, 0.0),
		([Product("Scarpe", 25.0, 3)], "SAVE10", False, 75.0),
		([Product("Scarpe", 25.0, 4)], "SAVE10", False, 90.0),
		([Product("Scarpe", 25.0, 1)], "SAVE10", False, 30.0),
		([Product("Scarpe", 25.0, 1)], "SAVE10", True, 27.0)
	]
)
def test_ordine(orders, promo_code, is_vip, expected):
    assert calculate_order_total(orders, promo_code, is_vip) == expected
```

<!-- 

 -->
<!-- ## Mocking
Può essere simulato il valore di ritorno di un metodo o di una funzione tramite mocking.

Risulta utile quando:
* Metodi e funzioni non ancora implementati (ottica TDD)
* Metodi e funzioni che richiedono collegamenti ad internet e operazioni lunghe

---
