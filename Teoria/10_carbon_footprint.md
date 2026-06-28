# Ingegneria del Software Avanzata A.A. 2025/2026
## Engineering Carbon-Aware LLM Services
### From Lifecycle Modeling to Adaptive Optimisation

Testimonianza d'aula tenuta da [Dott. Stefano Forti](https://www.unipi.it/ateneo/organizzazione/persone/stefano-forti-147669/) (Unipi)

Docente: Damiano Azzolini - Università di Ferrara

---

## 1. Introduzione

L'impatto ambientale dell'ICT è oggi significativo e in continua crescita. Entro il 2025 si stimano circa **180 ZB di dati prodotti, trasmessi e consumati**, con un consumo energetico pari al **6–9% della domanda globale** e circa il **2% delle emissioni globali di CO2**.

Questo scenario rende fondamentale ripensare il modo in cui progettiamo e gestiamo i servizi software, in particolare quelli basati su modelli di machine learning di grandi dimensioni (LLM).

---

## 2. Limiti dell'Evoluzione Hardware

Storicamente, la crescita delle prestazioni e dell'efficienza energetica è stata guidata da:

- **Legge di Moore**: il numero di transistor raddoppia ogni ~18 mesi
- **Dennard scaling**: la densità di potenza resta costante

Tuttavia, entrambe queste leggi stanno rallentando dall'inizio degli anni 2000. Questo implica che i miglioramenti automatici in termini di efficienza energetica non sono più garantiti, rendendo necessario intervenire anche a livello software.

---

## 3. Fondamenti Fisici

Un sistema possiede energia se ha la capacità di compiere lavoro.

- Energia: misurata in Joule (J) o Wattora (Wh)
- Potenza: tasso di trasferimento di energia, misurata in Watt (W)

La relazione tra energia e potenza è:

\[ E = \int P(t) \, dt \]

---

## 4. Power Usage Effectiveness (PUE)

Il PUE misura l'efficienza energetica di un data center:

\[ PUE = \frac{P_{IT} + P_{non-IT}}{P_{IT}} = 1 + \frac{P_{non-IT}}{P_{IT}} \]

Un valore di PUE maggiore di 1 indica consumo aggiuntivo dovuto a raffreddamento, alimentazione e infrastruttura.

---

## 5. Carbonio Incorporato (Embodied Carbon)

Il carbonio incorporato rappresenta le emissioni associate alla produzione e al trasporto dell'hardware.

- Un server moderno: **1000–2000 kg CO2-eq**

Questo contributo è spesso dominante nel ciclo di vita complessivo.

---

## 6. Modello di Consumo Energetico

Il consumo energetico totale di un sistema ICT è:

\[ E = E_i + E_u + E_f \]

Dove:

- \(E_i\): energia iniziale (produzione, trasporto)
- \(E_u\): energia d'uso
- \(E_f\): energia di fine vita

Espandendo:

\[ E = E_p + E_m + E_{ti} + \int_0^{T} P_u(t) dt + E_{tf} + E_r \]

---

## 7. Energia di Utilizzo

Una stima annuale dell'energia di utilizzo è:

\[ E_u \approx PUE \sum_{i \in S} P_i h_i \]

Dove:

- \(P_i\): potenza media del componente
- \(h_i\): ore di utilizzo annuali

---

## 8. Emissioni di Carbonio

Le emissioni complessive sono:

\[ C = C_i + C_u + C_f \]

Esplicitando:

\[ C = (\alpha_p E_p + \alpha_m E_m + \alpha_{ti} E_{ti}) + \alpha_u \int P_u(t) dt + (\alpha_{tf} E_{tf} + \alpha_r E_r) \]

Una versione semplificata:

\[ C = \alpha_i E_i + \alpha_u E_u + \alpha_f E_f \]

---

## 9. Costo di Trasporto dell'Energia

Si introduce un fattore \(\tau\):

\[ C = \sum_{s \in \{i,u,f\}} \frac{\alpha_s}{\tau_s} E_s \]

Per l'Europa: \(\tau \approx 0.95\).

---

## 10. Deep Neural Networks

Le reti neurali profonde:

- trasformano input in vettori di feature
- applicano funzioni di attivazione
- apprendono da grandi dataset

---

## 11. Training e Deployment

### Training

- distribuito su GPU/TPU
- può durare settimane
- elevato consumo energetico

### Deployment

- modelli distribuiti come servizi cloud
- accesso continuo da parte degli utenti

---

## 12. Fattori che Influenzano il Consumo

- complessità del modello
- numero di parametri
- hardware utilizzato
- PUE del data center
- intensità carbonica dell'energia

---

## 13. Caso Studio: GPT-3

- 175 miliardi di parametri
- 10000 GPU
- training distribuito

---

## 14. Risultati del Caso Studio: GPT 3

- Energia totale: \( E = 14331 \) MWh
- Training: ~9%
- Deployment: ~91%

Emissioni:

- Emissioni totali: 16026 tCO2-eq
- Embodied: ~62%
- Training: ~3%
- Deployment: ~35%

---

## 15. Considerazioni

- Il deployment domina il consumo energetico
- Il carbonio incorporato è spesso sottovalutato
- Serve maggiore trasparenza dai produttori

---

## 16. Fallacie Comuni

- i datacenter non sono sempre saturi
- le rinnovabili possono crescere
- il training può essere spostato
- non ci sono motivazioni aziendali per ridurre le emissioni di carbonio

---

## 17. Le 4M di Google

- **Model**: modelli più efficienti
- **Machine**: hardware più efficiente
- **Mechanisation**: uso del cloud (economia di scala)
- **Map**: localizzazione intelligente, dove l'energia è più pulita

---

## 18. Osservazione Chiave

L'impatto ambientale dipende più dall'intensità carbonica che dal consumo energetico puro.

Strategie:

- time shifting
- spatial shifting
- adaptation

---

## 19. Servizi Software Carbon-Aware

Un servizio può essere implementato in più versioni (strategie):

- stessa funzionalità
- costi energetici diversi

Selezione dinamica in base al contesto.

---

## 20. Esempio

Tre strategie:

- HighPower: massima qualità (es. molto tempo CPU, errore 0%)
- MediumPower: compromesso
- LowPower: minima energia (es. poco tempo CPU, errore 13%)

Trade-off tra errore e consumo.

---

## 21. Carbonstat

Input:

- previsioni di carbon intensity
- richieste
- strategie disponibili

Output:

- assegnazione strategia per timeslot

Obiettivo:

- minimizzare emissioni
- rispettare qualità media

---

## 22. Metodologia DevOps

### Design

- definizione metriche qualità
- simulazione

### Implementazione

- sviluppo strategie
- API REST

### Operazione

- previsione carico e carbon
- adattamento dinamico

---

## 23. Valutazione Sperimentale

- riduzione emissioni: **8%–50%**
- rispetto dei vincoli di qualità

---

## 24. Messaggi Chiave

- Deployment domina il consumo
- Carbon intensity è critica
- Design software è leva fondamentale

---

## 25. Conclusioni

La progettazione di servizi carbon-aware richiede:

- modelli di lifecycle
- ottimizzazione
- adattamento dinamico

Direzioni future:

- riconfigurazione continua
- integrazione con time-shifting
- applicazioni NLP complesse

---

## 26. Riferimenti

- Patterson et al. (2021), *Carbon Emissions and Large Neural Network Training*  
  https://arxiv.org/abs/2104.10350

- Patterson et al. (2022), *The Carbon Footprint of Machine Learning Training Will Plateau, Then Shrink*  
  https://arxiv.org/abs/2204.05149

- Luccioni et al. (2022), *Estimating the Carbon Footprint of BLOOM, a 176B Parameter Language Model*  
  https://arxiv.org/abs/2211.02001

- Faiz et al. (2024), *LLMCarbon: Modeling the End-to-End Carbon Footprint of Large Language Models*  
  https://arxiv.org/abs/2309.14393

- Forti et al. (2026), *Engineering Carbon-Aware Software Services*  
  https://www.researchsquare.com/article/rs-8000616/v1

