# Mattia Crapanzano · www.crapanzano.work

Sito statico pubblicato con GitHub Pages, in italiano e in inglese.

| Indirizzo | Pagina |
|---|---|
| `/` | **Laboratorio 3D**: la pagina predefinita, un capannone da esplorare con le tre zone (contiene anche la versione testo, `/?testo`) |
| `/classico/` · `/en/` | **Sito classico**: home con cartellino, tre settori, chi sono |
| `/quota/` · `/en/quota/` | In quota / At height · IRATA L1, Modulo A, ITRA, soccorso, scheda candidato |
| `/luce/` · `/en/luce/` | In luce / In focus · foto, video, drone, siti web |
| `/cura/` · `/en/cura/` | In cura / In care · OSS, soccorritore, vigile del fuoco volontario |
| `/privacy/` · `/en/privacy/` | Informativa privacy e cookie (il sito non usa cookie) |
| `/note-legali/` · `/en/legal/` | Note legali, crediti, accessibilità |

Curriculum in PDF in `assets/cv/`. Statistiche anonime senza cookie con Umami Cloud.

## Struttura
```
index.html, css/, js/, modelli/, modelli-mobile/, tex/, tex-mobile/, foto/, video/, yt/, hdri/   laboratorio 3D
classico/, quota/, luce/, cura/, en/                                                         sito classico
privacy/, note-legali/, en/privacy/, en/legal/, 404.html                                      pagine legali e di errore
assets/   stile e script del sito classico, font, immagini di anteprima (img/og), foto, CV
robots.txt, sitemap.xml, llms.txt                                                            motori di ricerca e assistenti AI
```
I sorgenti (laboratorio, modelli Blender, archivio del sito classico, testi legali) e i documenti personali
restano sul computer, nella cartella esclusa dalla pubblicazione.

## Aggiornare il sito
1. Lancia lo script di pubblicazione: rigenera tutte le pagine e copia i file del laboratorio.
2. GitHub Desktop → scrivi un messaggio → **Commit to main** → **Push origin**.
3. Dopo 1-2 minuti le modifiche sono online.

## Dominio (GoDaddy)
- Il file `CNAME` contiene `www.crapanzano.work`: non cancellarlo.
- DNS: quattro record **A** `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  e un record **CNAME** `www` → `crapanzanowork.github.io`. Su GitHub: **Settings → Pages → Enforce HTTPS** attivo.
- Rinnovo del dominio: ottobre di ogni anno.
