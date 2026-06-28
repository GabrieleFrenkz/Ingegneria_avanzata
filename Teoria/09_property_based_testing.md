
# Ingegneria del Software Avanzata A.A. 2025/2026
## Property Based Testing

Docente: Damiano Azzolini - Università di Ferrara

---

## Property Based Testing
L'obiettivo di Property Based Testing (PBD) è quello di generare una serie di input casuali per metodi e funzioni e verificare che alcune *proprietà* siano sempre verificate.

> Un proprietà è una regola che un sistema non deve (dovrebbe) mai violare, indipendentemente dall'input.

Uno dei primi framework sviluppati è stato `quickcheck` per haskell, poi esteso a molti altri linguaggi.

Componenti principali:
* generatore di input casuali
* *shrinking*: ridurre la complessità di un'istanza che genera un fallimento per rendere il test più interpretabile

In python possiamo usare [`hypothesis`](https://hypothesis.readthedocs.io/en/latest/): `uv add hypothesis`

Per utlizzare PBD, ci basta definire funzioni di test (come visto in `07_testing.md`) ed aggiungere
- decoratore `@given`
- strategia di generazione dell'input come argomento del decoratore

I test poi possono essere lanciati con `uv run pytest`.


## Esempio
Consideriamo il piccolo progetto descritto in `06_python_repository.md` e `07_testing.md`.

Quali possono essere delle proprietà da verificare?
Per esempio:
- il totale non può essere mai negativo
- un codice promozionale valido non può mai far aumentare il prezzo
- la differenza di prezzo tra un ordine con sconto e lo stesso ordine ma senza sconto deve essere 10 euro o 0 euro 

Provare a generare delle istanze di `Product` in maniera casuale da inserire dentro al decoratore `@given`.
Suggerimento: utilizzare 
- [`lists`](https://hypothesis.readthedocs.io/en/latest/reference/strategies.html#hypothesis.strategies.lists) per generare una lista di elementi
- [`builds`](https://hypothesis.readthedocs.io/en/latest/reference/strategies.html#hypothesis.strategies.builds) per generare `Product`

```Python
@given(
    orders = st.lists(
        st.builds(
            Product,
            name=st.text(),
            price=st.floats(0.01, 1000.0),
            quantity=st.integers(1, 10)
        ),
        max_size=10
    ),
    promo_code = st.sampled_from(["SAVE10", ""]),
    is_vip = st.booleans()
)
def test_ordine(orders, promo_code, is_vip):
    assert calculate_order_total(orders, promo_code, is_vip) >= 0
```



