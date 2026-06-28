# Ingegneria del Software Avanzata A.A. 2025/2026
## Metodi Agili

Docente: Damiano Azzolini - Università di Ferrara

---

### Riferimenti Libro
* **Introduzione all'ingegneria del software moderna: ingegnerizzare prodotti software** - Ian Sommerville - A cura di Daniela Micucci:
    * Capitolo 2 
    * Sezione 3.3 
    * Sezione 8.1.3 
    * Sezioni 9.1 e 9.2 

---

### Processo Software
Insieme di attività strutturate per lo sviluppo del software. Le principali sono:
* **Specifica**: cosa il sistema dovrebbe fare 
* **Progettazione**: definizione della struttura del sistema 
* **Implementazione**: programmazione 
* **Testing**: valutazione della correttezza del sistema (verifica mancanza di errori e rispetto delle specifiche) 
* **Evoluzione**: mantenimento ed aggiornamento del software in base alle richieste del cliente 

---

### Sviluppo Rapido
Oggigiorno, lo sviluppo rapido del software è un requisito chiave perché:
* Un concorrente potrebbe già aver catturato il mercato con una soluzione simile a quella che vogliamo sviluppare
* Un cliente, una volta scelto un sistema, difficilmente lo cambierà
* Le aziende operano in ambienti che cambiano velocemente, rendendo difficile produrre requisiti stabili; il software deve adattarsi velocemente

---

### Sviluppo Guidato dal Piano
Tra la fine del 1980 ed inizio 1990, l'idea più comune per un corretto sviluppo richiedeva un processo rigoroso:
* Notevole sforzo (overhead) per la pianificazione, progettazione e documentazione del sistema
* Per software medio-piccoli (es. app mobile), l'overhead rischia di diventare dominante, togliendo tempo alla programmazione
* Specifiche molto dettagliate che probabilmente non verranno mai lette
* Errori nelle specifiche scopribili solo in fase di implementazione, richiedendo modifiche che sottraggono altro tempo alla programmazione

**Evoluzione**: all'inizio degli anni '90 nascono i **metodi agili**.

---

### Metodi Agili
Caratteristiche principali:
* La specifica e lo sviluppo sono intrecciati
* Il software è visto come un insieme di funzionalità
* Lo sviluppo avviene in maniera incrementale con rapida consegna al cliente (settimane)
* Il cliente può proporre o suggerire modifiche per versioni successive
* Interazione costante con clienti e utilizzatori
* Utilizzo di strumenti di supporto per lo sviluppo (es. testing automatizzato)
* Documentazione minima, eventualmente generata in maniera automatica

---

### Sviluppo Guidato dal Piano vs Metodi Agili



* **Sviluppo Guidato dal Piano**:
    * Stadi di sviluppo separati con output pianificati e documenti formali
    * L'output di uno stadio viene usato per la pianificazione dello stadio successivo (sviluppo a cascata)
* **Metodi Agili**:
    * Tutte le operazioni sono intrecciate tra loro
    * Focus sul codice invece che sul design

---

### Motivazioni e Obiettivi Agili
* **Motivazioni**: eccessivo overhead dello sviluppo guidato dal piano
    * Sviluppo incrementale del software
    * Velocità di sviluppo ed adattamento
* **Obiettivo**: riduzione overhead e rapido adattamento ad un cambiamento di specifiche senza troppa difficoltà
* **Fondamenta**: tutti i metodi agili condividono i principi del **Manifesto Agile**

> Ci concentriamo su **Extreme Programming** e **Scrum**.

<!-- --- -->
<!-- 
### Manifesto per lo Sviluppo Agile
Stiamo scoprendo modi migliori di creare software, sviluppandolo e aiutando gli altri a fare lo stesso. Grazie a questa attività siamo arrivati a considerare importanti:
* **Gli individui e le interazioni** più che i processi e gli strumenti 
* **Il software funzionante** più che la documentazione esaustiva 
* **La collaborazione col cliente** più che la negoziazione dei contratti 
* **Rispondere al cambiamento** più che seguire un piano 

*Fermo restando il valore delle voci a destra, consideriamo più importanti le voci a sinistra*. -->

---

### Principi di Sviluppo Agili
* **Coinvolgere il cliente**: stretto contatto per fornire priorità e valutare ogni modifica
* **Accogliere il cambiamento**: adattare il software per gestire cambiamenti durante la programmazione
* **Sviluppare e consegnare per incrementi**: testare e valutare ogni incremento
* **Mantenere la semplicità**: limitare la complessità del sistema sia in sviluppo che in progettazione
* **Persone, non processo di sviluppo**: lasciare libertà agli sviluppatori senza limitarli con processi prestabiliti

---

### Sviluppo Incrementale



Fasi del ciclo:
1. **Scelta delle feature**: selezionare le prossime funzionalità da includere nella release
2. **Perfezionamento descrizione**: inserimento di dettagli sufficienti per allineare il team
3. **Implementazione e testing**: sviluppo della funzionalità e di test automatici che ne dimostrino il corretto funzionamento
4. **Integrazione**: integrazione nel sistema esistente e test
5. **Consegna**: consegna del prodotto al cliente
6. **Release**: rilascio di una nuova versione se sono state sviluppate abbastanza funzionalità

---

### Extreme Programming (XP)
Metodo sviluppato alla fine degli anni '90
* **Pratiche estreme**: sviluppo iterativo dove il software viene integrato più volte al giorno, appena terminano i test
* **Pratiche fondamentali**: include TDD, refactoring, small release, simple design, on-site customer, sustainable pace, pair programming, collective code ownership e user story

#### Principi Chiave:
* **Incremental planning e user story**: i requisiti sono discussi incrementalmente con un rappresentante del cliente
* **Small release**: rilasci frequenti partendo da un insieme minimo di funzionalità
* **Test-first development**: scrivere i test prima del codice per chiarire l'algoritmo da implementare
* **Continuous integration**: integrazione immediata del codice pronto; i test di unità devono avere successo per l'accettazione
* **Refactoring**: miglioramento costante della struttura per agevolare la manutenzione
* **Pair programming**: programmatori lavorano a coppie controllandosi a vicenda
* **Sustainable pace**: ritmo di lavoro sostenibile

---

### User Story
Narrazioni strutturate di un singolo aspetto desiderato da un utente
* **Formato standard**: *Come [ruolo], io [voglio/ho bisogno] di [fare qualcosa]*
* **Variante**: *...in modo che [motivo]*
* **Scopo**: strumenti per pensare al sistema e identificare le funzionalità, non sono specifiche rigide
* **User story negative**: utili come vincoli assoluti, spesso traducibili in positive per il controllo dei dati

---

### Funzionalità (Feature)
Le funzionalità identificate dovrebbero essere:
* **Indipendenti**: non dipendere dal modo in cui sono implementate le altre
* **Coese**: legate a una singola funzione
* **Pertinenti**: non offrire funzionalità "oscure"

**Feature creep**: aumento eccessivo di funzionalità che causa bachi, vulnerabilità e menù troppo complessi

---

### Refactoring
Ridurre la complessità di un programma senza cambiarne il comportamento esterno
* **Code smell**: segnali come classi grandi, metodi lunghi, codice duplicato o nomi senza significato
* **Strumenti**: eliminare il codice duplicato invece di commentarlo (usare strumenti come Git)
* **Tipi di complessità**: di lettura, strutturale, dei dati e decisionale (if-else annidati)

---

### Testing in XP
Il programma è testato ad ogni cambiamento
* **TDD**: Scrivere il test prima del codice chiarisce la funzionalità
* **Automazione**: uso di framework (es. JUnit per Java, Pytest per Python)
* **Tipologie**:
    * **Funzionale**: verifica l'intero sistema
    * **Utente**: include *alpha testing* (sviluppatori + utenti) e *beta testing* (rilascio a utenti esterni per usabilità)
    * **Prestazioni e carico**: identifica i colli di bottiglia
    * **Sicurezza**: verifica l'integrità del sistema

**Criticità**: i programmatori possono scrivere test incompleti; difficoltà con interfacce grafiche e casi limite.

---

### Scrum
Fornisce un riferimento per l'organizzazione e la gestione agile di un progetto
* **Fasi**: iniziale (obiettivi/architettura), serie di sprint, analisi dello sprint
* **Termini Specifici**:
    * **Product Owner**: responsabile dell'individuazione di funzionalità
    * **Product Backlog**: elenco prioritizzato di operazioni da eseguire
    * **Sprint**: ciclo di 2-4 settimane per implementare miglioramenti
    * **Daily Scrum**: incontri quotidiani di allineamento
    * **Sprint Backlog**: lavoro selezionato per lo sprint corrente


#### Componenti Principali:
1. **Product Backlog**: Item (PBI) analizzati e stimati (backlog grooming)
2. **Sprint Timeboxed**: lo sprint finisce allo scadere del tempo indipendentemente dal completamento dei task
3. **Team Autogestiti**: 5-8 persone, preferibilmente co-locate per favorire la comunicazione informale

---

### Concetti Fondamentali
I metodi agile sono basati su:
* Sviluppo incrementale, rilasci frequenti e riduzione overhead
* Pratiche come User story, test-first development e partecipazione del cliente
* **Scrum** come metodo di gestione basato su Backlog, Sprint e Team autogestiti