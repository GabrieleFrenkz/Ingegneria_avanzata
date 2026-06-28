# Ingegneria del Software Avanzata A.A. 2025/2026
## Git Pratica

Docente: Damiano Azzolini - Università di Ferrara

---

## 1. Installazione Git
* **Linux**: `sudo apt install git` (può essere già installato) o `sudo yum install git` o simili.
* **Mac**: [http://git-scm.com/download/mac](http://git-scm.com/download/mac).
* **Windows**: [http://git-scm.com/download/win](http://git-scm.com/download/win) o WSL.

---

## 2. Configurazione
### Identità
Configurazione globale necessaria (basta eseguirla un'unica volta) per identificare l'autore dei commit:
```bash
git config --global user.name "Nome Cognome"
git config --global user.email mioindirizzo@dominio.com
```

Per controllare le configurazioni attive: `git config --list`.

### Editor
Si può impostare un editor per la gestione dei messaggi di commit exportando la variabile d'ambiente `GIT_EDITOR`.
Per esempio, se si vuole impostare vim:
```
export GIT_EDITOR=vim
```

### Creazione - Inizializzazione Repository Locale
> File risultato della compilazione e/o file temporanei non devono essere tracciati da git.

File `.gitignore`: file che contiene l'elenco dei file che non devono essere tracciati.
Esempio di generatore: https://www.toptal.com/developers/gitignore/.

## 3.Comandi Principali
| Operazione | Comando |
| :--- | :--- |
| Creazione di un repository git | `git init` |
| Controllo stato file / working tree | `git status` |
| Aggiunta di un file nella staging area | `git add <nome_file>` |
| Elenco cambiamenti non ancora in staging | `git diff` |
| Elenco cambiamenti già in staging area | `git diff --staged` (o `--cached`) |
| Commit dei cambiamenti | `git commit -m "Messaggio"` |
| Storia dei commit (log) | `git log` |
| Rimozione tracciamento file (mantenendolo) | `git rm --cached <file>` |
| Rimozione tracciamento file (eliminandolo) | `git rm <file>` |
| Elenco cambiamenti di un commit specifico | `git show <id_commit>` |
| Elenco cambiamenti tra due commit | `git diff <hash0> <hash1>` |
| Individuare chi ha fatto modifiche in un file | `git blame <file>` |

## 4. Annullare Modifiche e Stashing
- Ripristinare un file: `git restore <file>` (elimina le modifiche che non sono state inserite in un commit nel working tree)
- Salvataggio temporaneo: `git stash push` (permette di mettere da parte le modifiche attuali senza fare commit)
- Recupero salvataggio: `git stash pop`
- Cancellazione ultimo commit: `git reset <option> HEAD~1`, con `<option>`
- - `--soft`: inserisce le modifiche nella staging area
- - `--mixed`: non inserisce le modifiche nella staging area 
- - `--hard`: **cancella** le modifiche 

## 5. Gestione Branch
- Creazione nuovo branch: `git branch <branch_name>`
- Spostamento su un branch: `git checkout <branch_name>` o `git switch <branch_name>`
- Creazione e spostamento su un branch: `git checkout -b <branch_name>`
- Elenco dei branch: `git branch`
- Cancellazione branch: `git branch -d <branch_name>`
- Merge (Unione): `git merge <branch>` (unisce il branch specificato in quello corrente)

## 6. Modificare Commit
- Modifica ultimo commit: `git commit --amend` (per cambiare il messaggio o aggiungere file dimenticati con `git add`)
- Operazioni avanzate: `git rebase` per riorganizzare o eliminare commit più vecchi

## 7. Comandi per Repository Remoti
- Clonazione: `git clone <url_repository>`
- Aggiunta repository remoto: `git remote add origin <url>`
- Invio modifiche: `git push origin <branch_name>`
- Recupero dati (senza merge): `git fetch`
- Unione remota: `git merge origin/<branch_name>`
- Aggiornamento completo: `git pull (esegue fetch + merge)`

## 8. Maggiori Informazioni
- Sito: https://git-scm.com/Git 
- Cheat sheet: https://github.github.com/training-kit/

