# MarketPilot

Jednoduchá webová aplikácia pre workshop: návrh AI marketingového nástroja.

## Čo stránka robí

- Audit landing page podľa URL alebo stručného popisu obsahu
- Marketingový rozhodovač podľa rozpočtu, typu podnikania a cieľa
- Generuje reálne odpovede cez OpenAI Responses API
- Výstup sa dá kopírovať alebo stiahnuť ako `.txt`

## Dôležité

API kľúč nesmie byť v `index.html` ani v `script.js`. Frontend volá endpoint
`/api/generate` a backend číta kľúč z environment variable `OPENAI_API_KEY`.

GitHub Pages samotný backend nespustí. Na reálne ChatGPT odpovede použi napríklad
Vercel, Netlify alebo iný hosting so serverless funkciami.

## Nasadenie cez Vercel

1. Importuj GitHub repozitár do Vercelu.
2. V nastaveniach projektu otvor `Environment Variables`.
3. Pridaj:
   - `OPENAI_API_KEY` = tvoj OpenAI API kľúč
   - `OPENAI_MODEL` = `gpt-5.4-mini` alebo iný dostupný model
4. Deployni projekt.

Frontend potom bude volať `/api/generate` a odpovede budú generované cez ChatGPT.

## Lokálna kontrola syntaxe

```bash
npm run check
```
