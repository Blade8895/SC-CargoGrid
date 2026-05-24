# SC-CargoGrid

SC-CargoGrid ist eine kleine React/Vite-Anwendung zum Planen und Verwalten von Frachtaufträgen mit einem visuellen Schiffs-Grid (Drag & Drop).

## Voraussetzungen

- **Node.js** (empfohlen: aktuelle LTS-Version, z. B. 20.x)
- **npm** (wird mit Node.js installiert)

## Installation

1. Repository klonen:
   ```bash
   git clone <REPO-URL>
   cd SC-CargoGrid
   ```
2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```

## Anwendung starten (Entwicklung)

```bash
npm run dev
```

- Vite zeigt danach im Terminal die lokale URL an (meist `http://localhost:5173`).
- Öffne die URL im Browser.

## Bedienung

### 1) Auftrag anlegen

- Klicke links auf **„Neuer Auftrag“**.
- Fülle die Felder aus:
  - Auftragsname
  - Abholort
  - Lieferort
  - Belohnung (aUEC)
  - optionale Notiz
- Klicke auf **„Auftrag anlegen“**.

### 2) Auftrag auswählen

- In der linken Spalte werden alle Aufträge angezeigt.
- Mit Klick auf einen Auftrag wird er aktiv und rechts bearbeitbar.

### 3) Container hinzufügen

- Rechts im Bereich **„Fracht“** kannst du Container für den ausgewählten Auftrag hinzufügen.
- Wähle:
  - Größe (z. B. `1x1x1`, `2x2x2`, `8x2x2`)
  - Anzahl
  - optionaler Anzeigename
- Klicke auf **„Container hinzufügen“**.

### 4) Container verladen (Drag & Drop)

- Ziehe Container aus der rechten Spalte auf das **Ship Grid** in der Mitte.
- Beim Ablegen prüft die App automatisch, ob die Platzierung gültig ist.
- Bereits platzierte Fracht kann innerhalb des Grids verschoben werden.

### 5) Container entladen

- Ziehe eine bereits platzierte Fracht in die **Unload-Zone** unter dem Grid.

### 6) Status & Belohnung

- Geladene Aufträge werden als **loaded** markiert.
- Die geladene Gesamtbelohnung wird rechts unten als **„Geladene Belohnung“** angezeigt.

## Nützliche Skripte

```bash
npm run dev      # Entwicklungsserver starten
npm run build    # TypeScript-Check + Produktionsbuild
npm run preview  # Gebauten Stand lokal testen
```

## Datenhaltung

Der App-Zustand wird lokal im Browser gespeichert (Local Storage). Dadurch bleiben Aufträge und Platzierungen zwischen Seiten-Reloads erhalten.
