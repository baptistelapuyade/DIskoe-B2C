# Runbook: Founder-Rolle je Supabase-Projekt einrichten

Stand: 2026-10-23. Gilt für jedes Supabase-Projekt einzeln (Preview und Production). Preview und Production werden nie durch kopierte Nutzerdaten angeglichen.

## Warum

Die Founder-Rolle ist die einzige Instanz, die Profile provisioniert (`provision_profile_owner`) und Erstfreigaben erteilt (`approve_first_profile`, `approve_first_event`). Sie wird bewusst **nicht** aus E-Mail-Adresse, Client-Metadaten oder frei setzbaren Claims abgeleitet, sondern steht in `public.app_roles`. Clients haben keinen Schreibzugriff auf diese Tabelle. Eine Rollenverwaltungsfunktion gehört nicht zum Durchstich.

## Schritte

1. Der Founder meldet sich einmal per E-Mail-Code an. Dadurch entsteht sein Eintrag in `auth.users`.
2. Im geschützten Supabase-Dashboard (Authentication → Users) die UUID dieses Nutzers nachsehen und mit dem erwarteten Konto abgleichen.
3. Im SQL-Editor des Dashboards (Rolle `postgres`) genau einmal ausführen. `<AUTH-UUID>` durch die UUID aus Schritt 2 ersetzen:

   ```sql
   insert into public.app_roles (user_id, is_founder)
   values ('<AUTH-UUID>', true);
   ```

4. Read-back: Es muss genau eine Zeile geben.

   ```sql
   select user_id, is_founder from public.app_roles;
   ```

5. Notiere Datum, Projekt und Durchführenden außerhalb des Repositories (zum Beispiel im Betriebsprotokoll des Founders).

## Regeln

- UUID und E-Mail-Adresse **nie** ins Repository, in Logs oder in Chats schreiben.
- Lokale Tests verwenden eine synthetische Founder-UUID (`supabase/tests/rls_alpha_core.sql`).
- Weitere Founder gibt es erst nach einer eigenen Entscheidung und Rollenverwaltung.

## Offen

- Der Plan sieht für den Bootstrap einen Audit-Eintrag vor (`PLAN.md`, Founder-Bootstrap Schritt 4). `public.publication_audit` kennt nur Profil- und Event-Aktionen und passt dafür nicht. Bis zur Entscheidung (eigene Tabelle oder erweiterte Aktionsliste) gilt Schritt 5 als manuelle Protokollierung.
