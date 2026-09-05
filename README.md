# ProchyAuto — web

Statický web s administrací. Běží na Cloudflare Pages, bez build kroku.
Texty, ceny, balíčky, alba i fotky se mění v `sprava.html` po zadání hesla.

## Nahrání na GitHub z mobilu

Všechny soubory kromě jednoho patří přímo do kořene repozitáře.

**1. Fotky, stránky a skripty**
V repozitáři: **Add file → Upload files**. Vyber všechny soubory z rozbaleného
zipu kromě složky `functions`. Dole **Commit changes**.

**2. Serverová část**
V repozitáři: **Add file → Create new file**. Do políčka s názvem napiš přesně:

```
functions/api/[[path]].js
```

Jakmile napíšeš lomítko, GitHub složku vytvoří sám. Do těla souboru vlož
obsah `functions/api/[[path]].js` ze zipu a dej **Commit changes**.

Hotovo, jiná složka v projektu není.

## Nasazení na Cloudflare

**3. Databáze**
Cloudflare → Storage & Databases → D1 → **Create database**, název `prochyauto`.
Otevři Console, vlož obsah `schema.sql` a spusť.

**4. Úložiště fotek**
Cloudflare → R2 → **Create bucket**, název `prochyauto-foto`.

**5. Web**
Workers & Pages → **Create** → Pages → Connect to Git → vyber repozitář.

- Framework preset: **None**
- Build command: **nechat prázdné**
- Build output directory: **/**

**6. Propojení a heslo**
V projektu → Settings:

- Bindings → **D1 database**: proměnná `DB`, databáze `prochyauto`
- Bindings → **R2 bucket**: proměnná `BUCKET`, bucket `prochyauto-foto`
- Variables and Secrets: `ADMIN_PASSWORD` = heslo do správy, ulož jako **Secret**

Pak **Retry deployment**, aby se nastavení projevilo.

**7. Doména**
Settings → Custom domains → přidat doménu a nastavit DNS podle pokynů.

## Provoz

Správa je na adrese `tvuj-web.cz/sprava.html`.
Po přihlášení jde měnit texty, ceny, balíčky, kontakty, zakládat auta v galerii
a nahrávat či mazat fotky. Změny se projeví po kliknutí na **Uložit změny**.

Poptávky včetně přiložené fotky chodí do záložky Poptávky.

Obsah se ukládá do databáze D1, nahrané fotky do R2. Dokud správce nic neuloží,
web jede z `content.json` a fotek v repozitáři — ty zůstávají jako záloha.

Heslo se mění v Cloudflare → Settings → Variables and Secrets → `ADMIN_PASSWORD`.
Změna hesla odhlásí všechna zařízení.
