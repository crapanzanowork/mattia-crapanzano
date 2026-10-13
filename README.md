# Mattia Crapanzano · sito curriculum

Sito statico (HTML, CSS, JavaScript, nessuna libreria) pubblicato con GitHub Pages, in italiano e in inglese.
Una home con il cartellino e i tre settori, e una pagina-curriculum per ciascun mestiere.

| Indirizzo (dopo la pubblicazione) | Pagina | Da mandare a… |
|---|---|---|
| `crapanzanowork.github.io/mattia-crapanzano/` | Home: cartellino, tre settori, chi sono, LinkedIn | chiunque |
| `…/quota/` · `…/en/quota/` | **In quota / At height** · IRATA L1, Modulo A, ITRA, soccorso, scheda candidato | aziende rope access e cantieri |
| `…/luce/` · `…/en/luce/` | **In luce / In focus** · foto, video, comunicazione | aziende, agenzie, eventi |
| `…/cura/` · `…/en/cura/` | **In cura / In care** · OSS e soccorritore | cooperative, RSA, famiglie |

Ogni pagina ha **Scarica CV**, che scarica il PDF del curriculum di quel settore (in `assets/cv/`, italiano e inglese).
Anche la chat lo offre a chi chiede il CV. I PDF si rigenerano dalle pagine a ogni aggiornamento dei contenuti.

## Struttura
```
mattia-crapanzano/
├── index.html                home (italiano)
├── quota/ luce/ cura/        le tre pagine in italiano
├── en/                       la stessa struttura in inglese
├── assets/
│   ├── css/style.css         tutto lo stile (colori e materiali in cima al file)
│   ├── js/main.js            effetti, chat, transizioni, età, salva contatto
│   ├── img/                  icone, favicon, logo M
│   └── foto/                 ← LE TUE FOTO (leggi foto/LEGGIMI.txt)
├── Logo/                     sorgenti del logo (non pubblicati)
└── _privato/                 documenti personali (non pubblicati)
```

## Cambiare una foto
Apri `assets/foto/`, sostituisci il file con una tua foto **con lo stesso nome**. Fatto.
L'elenco completo è in `assets/foto/LEGGIMI.txt`.

## Anteprima sul computer
```bash
python3 -m http.server 5520
```
poi apri http://localhost:5520

## Pubblicare con GitHub Desktop
1. **File → Add Local Repository…** → scegli la cartella `mattia-crapanzano` → **create a repository** → **Create repository**.
2. Controlla che nella lista dei file **non** ci siano `_privato` e `Logo` (sono esclusi apposta).
3. In basso a sinistra scrivi "Prima versione" → **Commit to main**.
4. In alto **Publish repository** → togli la spunta *Keep this code private* → **Publish**.
5. Su github.com apri il repository → **Settings → Pages** → Source: *Deploy from a branch*, Branch: **main** / **(root)** → **Save**.
6. Dopo 1-2 minuti il sito è online su **https://crapanzanowork.github.io/mattia-crapanzano/**

Per gli aggiornamenti: GitHub Desktop → messaggio → **Commit to main** → **Push origin**.

## Chat
Il numero è in `assets/js/main.js` (`CONTACT`). La chat non salva nulla: quando il visitatore preme Invia
si apre WhatsApp con il messaggio già scritto e l'indicazione della pagina da cui arriva.
