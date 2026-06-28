# Ingegneria del Software Avanzata A.A. 2025/2026
## Mocking

Docente: Damiano Azzolini - Università di Ferrara

---

## Mock
L'operazione di *mock* ci permette di simulare il funzionamento di metodi e funzioni non accessibili, difficilmente accessibili o non ancora implementate (durante la fase di test).


Utilizziamo `unittest` che ci fornisce la classe [`Mock`](https://docs.python.org/3/library/unittest.mock.html).
Con pytest abbiamo a disposizione [`monkeypatch`](https://docs.pytest.org/en/stable/how-to/monkeypatch.html).

Esempio di utilizzo con `unittest`:
```Python
from unittest.mock import Mock

class MyClass:
    def ottieni(self, s : str) -> str:
        return s

    def ottieni_2(self, s : str) -> str:
        return s + s
    
def mia_funzione():
    obj = MyClass()
    obj.compute = Mock(return_value="Mocked value")
    print(obj.compute())

if __name__ == "__main__":
    mia_funzione()
```

> Durante la fase di test si può utilizzare mock per simulare l'interazione con componenti che non possono essere direttamente o facilmente acceduti (per esempio, componenti che richiedono accesso ad internet).

## Patch

unittest fornisce anche il decoratore [`@patch`](https://docs.python.org/3/library/unittest.mock.html#the-patchers) che permette di sostituire temporaneamente un argomento di un metodo/funzione (per esempio).

Dal [manuale di unitteest](https://docs.python.org/3/library/unittest.mock.html#where-to-patch):

> The basic principle is that you patch where an object is looked up, which is not necessarily the same place as where it is defined.

```Python
from unittest.mock import patch

@patch('__main__.MyClass.ottieni_2')
def mocked_ottieni(to_mock):
    obj = MyClass()
    to_mock.return_value = "Metodo mock"
    print(obj.ottieni_2("prova"))
    
if __name__ == "__main__":
    mocked_ottieni()
```

Ci sono [molti metodi](https://docs.python.org/3/library/unittest.mock.html#the-mock-class) a disposizione per controllare se un mock è stato, per esempio, chiamato almeno una volta.

Considerando la classe `Product` (vedi `07_testing.md` e successivi) come si potrebbe estenderla per poi utilizzare il mocking in fase di test? 

Per esempio, possiamo aggiungere una metodo `check_availability` che controlla se il prodotto è effettivamente disponibile tramite chiamata API ad un server.
Durante la fase di test, possiamo simulare la chiamata e provare diversi codici di errore.

```Python

def check_availability(self) -> int:
    # chiamata ad API per disponibilità - non implementata per brevità ma supponiamo ci sia
    return 200

# nei test poi, supponendo che la classe Product si trovi nel file main.py
# e che venga importata come
# from main import Product

@patch('main.Product.check_availability')
def test_checkout(mock_check_availability):
    mock_check_availability.return_value = 300

    product = Product("Widget", 25.0, 3)
    availability = product.check_availability()

    assert availability == 300
```

> Nota: questo è solamente un esempio didattico per mostrare l'utilizzo di `@patch`. In pratica, non serve testare che una funzione della quale è stata fatta un mock restituisca effettivamente il valore impostato.
