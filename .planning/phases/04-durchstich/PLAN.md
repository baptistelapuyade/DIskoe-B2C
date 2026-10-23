---
phase: 04-durchstich
plan: "01"
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - next.config.ts
  - app/**
  - components/**
  - lib/**
  - supabase/migrations/**
  - supabase/tests/**
  - tests/**
  - e2e/**
  - playwright.config.ts
autonomous: false
requirements:
  - ACCESS-01
  - ACCESS-02
  - ACCESS-03
  - PUBLIC-01
  - PUBLIC-02
  - PUBLIC-03
  - PUBLISH-01
  - PUBLISH-02
  - PUBLISH-03
  - PUBLISH-04
  - PUBLISH-05
  - PROFILE-02
  - SHARE-01
  - OPS-01
must_haves:
  truths:
    - "Ein verifizierter Login allein verleiht keine Organizerrechte; nur die explizite Profilzuordnung erlaubt Zugriff auf eigene Entwürfe."
    - "Private Profil- und Eventrevisionen sind über App und direkte Postgres-/REST-Abfragen für Fremde und anonyme Nutzer unzugänglich."
    - "Eine Publikation kopiert atomar genau eine bestätigte, vollständige Draft-Revision in den veröffentlichten Stand; spätere Draft-Änderungen verändern diesen nicht."
    - "Eventabsage wirkt sofort auf den veröffentlichten Status, ohne andere private Änderungen mitzuveröffentlichen; Verschiebung benötigt eine erneute ausdrückliche Publikation."
    - "Profilseite, /e/[slug], Meta-Daten, Sitemap und JSON-LD lesen denselben veröffentlichten Stand; unbekannter Preis wird nie als kostenlos und ein unbekanntes Ende nie als endDate ausgegeben."
    - "Der Durchstich funktioniert vollständig ohne KI, Produkt-E-Mail-Versand, Plus und Besucherfunktionen."
  artifacts:
    - path: "supabase/migrations/*_alpha_core.sql"
      provides: "Typen, Tabellen, Constraints, Publikationsfunktionen und RLS für Zugang, Profil, Event und Medien"
    - path: "supabase/tests/rls_alpha_core.sql"
      provides: "direkt ausführbare Rollen-/Sichtbarkeitstests gegen Postgres"
    - path: "lib/domain/**"
      provides: "Antwortzustände, Publikationslücken, Zeit-/Geldregeln und öffentliche Projektionen"
    - path: "app/(organizer)/**"
      provides: "Login, Profil- und Eventeditor, Vorschau sowie Statusaktionen"
    - path: "app/e/[slug]/page.tsx"
      provides: "öffentliche Eventseite aus published_revision"
    - path: "app/[profileSlug]/page.tsx"
      provides: "öffentliches Veranstalterprofil aus published_revision"
    - path: "app/sitemap.ts"
      provides: "Sitemap ausschließlich veröffentlichter URLs"
    - path: "e2e/**"
      provides: "Playwright-Abnahme des echten Durchstichs"
  key_links:
    - from: "Organizer-Server-Actions"
      to: "Postgres-Publikationsfunktionen"
      via: "auth.uid(), Ownership- und Founder-Prüfung in einer Transaktion"
    - from: "öffentliche Routen und generateMetadata"
      to: "öffentliche Leseprojektionen"
      via: "published_revision_id; nie draft_revision_id"
    - from: "Event-Publish-Dialog"
      to: "lib/domain/event-publication.ts"
      via: "dieselbe Lückenprüfung in UI und Servergrenze"
    - from: "Absage-Aktion"
      to: "published event state"
      via: "eigene status-only Datenbankfunktion ohne Draft-Kopie"
---

<objective>
Den freigegebenen Alpha-Kern als sieben ausführbare vertikale Slices planen: von testbarer Daten- und RLS-Grenze über Login, Profil und manuelles Event bis zu getrenntem Publikationsstand, öffentlichen Seiten und End-to-End-Abnahme.

Purpose: Der kleinste reale Ablauf beweist die zentrale Vertrauensgrenze „privater Entwurf versus bestätigter öffentlicher Stand“, ohne fachlich offene oder ausgeschlossene Teile vorwegzunehmen.

Output: Eine spätere Umsetzung auf Next.js App Router/TypeScript, Supabase Frankfurt und AWS-Amplify-Preview, mit SQL-Migrationen, automatisierten Vitest-/RLS-/Playwright-Prüfungen und einem klaren Abnahmesignal je Slice. Dieser Plan selbst erzeugt keinen Anwendungscode und installiert nichts.
</objective>

<execution_guardrails>
- Dies ist ein Plan, keine Entwicklungsfreigabe innerhalb dieses Auftrags. Nach Erstellung anhalten; `workflow.auto_advance` bleibt `false`.
- Bei Ausführung jeden Slice auf einem eigenen Branch/PR oder als ausdrücklich freigegebenen kleinen Schritt liefern; keine Produktionsbereitstellung und keine echten Organizer- oder Nutzerdaten.
- Quellenrangfolge aus `docs/startpaket/README.md` anwenden. Produktregeln nicht durch technische Normalisierung verändern. Unklare Regeln als `TODO(spec)` blockierend oder nicht blockierend kennzeichnen.
- Keine KI-Erfassung, Produkt-E-Mail/SES, Follow, Merken, Kalenderexport, Plus/Reservierung/Billing, Analytics, Profilgestaltung/Module, Venue-/Artist-/Briefing-Funktionen, Discovery-Suche oder automatische Bildgenerierung bauen.
- Auth-Code-Versand ist als Supabase-Auth-Infrastruktur für Login zulässig; keine Produktmails an Dritte versenden. Tests nutzen lokale Inbucket-/Testmechanik oder vorab angelegte Test-Sessions, niemals echte Adressen.
- Alle Entwurfsdaten bleiben durch RLS privat. `noindex` ist kein Zugriffsschutz. Service-Role-Schlüssel niemals im Browser; Tokens, E-Mail-Adressen und personenbezogene Daten nicht loggen.
</execution_guardrails>

<read_first>
- `AGENTS.md`; `CLAUDE.md`
- `.planning/PROJECT.md`; `.planning/REQUIREMENTS.md`; `.planning/ROADMAP.md`; `.planning/STATE.md`; `.planning/config.json`
- `docs/startpaket/README.md`; `01-architektur.md` bis `07-start-prompt.md`
- `docs/DATA_CONTRACT_B2C_V1.md`; `docs/DATA_CONTRACT_B2C_V1_ADDENDUM_2026-10-15.md`; `docs/DATA_CONTRACT_B2C_V1_V03_ENTWURF_2026-10-15.md`
- `docs/PRODUCT_DECISIONS_DELTA_V04_2026-10-16.md`; `docs/QUESTION_POOL_B2C_V1.md`; `docs/STATUS.md`
- Vor UI-Umsetzung die in `docs/startpaket/03-screens-figma.md` genannten Figma-Knoten lesen, sofern MCP verbunden; andernfalls Dokumentbeschreibung als Referenz nutzen und den fehlenden Live-Abgleich im PR nennen.
</read_first>

## Schritt A — kurzer Abgleich vor Ausführung

### Widersprüche und begrenzte Auflösung

1. `.planning/PROJECT.md`, REQUIREMENTS-Header/Traceability und die alten Phasen 1–3 sagen „Implementierung nicht autorisiert“ beziehungsweise Phase 3 sei nur Planung. `AGENTS.md` und `docs/STATUS.md` vom 23.10.2026 erteilen später und enger die Freigabe für den Durchstich. Für Phase 4 gilt die spätere Freigabe; Phasen 1–3 bleiben offen und werden nicht nachträglich als abgeschlossen markiert.
2. Datenvertrag v0.3 P05 und §8 erlauben Eventpublikation ohne Bild; Delta v0.4 §16 verlangt ein Eventbild. `docs/startpaket/README.md` und `02-durchstich.md` setzen für diesen Durchstich das Bild als Publikationspflicht. Das ist eine begrenzte Scope-/Abnahmeentscheidung des Durchstichs, keine rückwirkende globale Änderung des Produktvertrags. Tests benennen daher `P05-Durchstich` und dokumentieren die Abweichung.
3. v0.3/Q35 beschreibt unabhängige Eventgestaltung; v0.5 lässt Events standardmäßig live dem veröffentlichten Profil folgen. Gestaltung ist im Durchstich ausgeschlossen: ausschließlich DISKOE-Default, kein Theme-Editor und keine Aussage über die spätere Bindung.
4. Delta v0.4 beschreibt Plus-Testzugang; v0.5 ersetzt ihn in der Alpha durch Reservierungstest. Beides liegt außerhalb des Durchstichs.
5. v0.3 nennt Eventbild nur für Discovery, während Discovery selbst später ist. Der Durchstich nutzt das Bild ausschließlich als sein Publikations-Gate; er implementiert keine Discovery-Eignung.
6. ROADMAP behauptet 38 V1-Requirements, `.planning/REQUIREMENTS.md` enthält tatsächlich 37 angekreuzte V1-IDs. Die nachfolgende 38er-Inventur umfasst diese 37 plus `PREMIUM-01` aus „v2 / Later“, weil diese ID in der Requirements-Datei separat geführt und für die Scope-Abgrenzung relevant ist. Keine fehlende 38. V1-ID wird erfunden.

### Requirement-Zuordnung (38/38 Inventur; kein Status wird auf erledigt gesetzt)

| Kategorie | Requirement | Durchstichbezug / Restumfang |
|---|---|---|
| später | OFFER-01 | Angebots-/Aufwandstransparenz besitzt in den sieben Slices keine eigene Task-Abdeckung; Durchstichgrenzen im Plan sind kein erfülltes Produkt-Requirement. |
| später | OFFER-02 | Umfangserklärung und finaler Rechte-/Einwilligungstext sind offen; Medienbestätigung im Durchstich ist technische Vorarbeit, keine Requirement-Abdeckung. |
| später | PLAN-01 | Plus-Reservierungs-/Testmodell ausdrücklich ausgeschlossen. |
| später | PLAN-02 | Entitlement/Downgrade ausdrücklich ausgeschlossen. |
| im Durchstich (Teilumfang) | ACCESS-04 | Gemeinsamer E-Mail-Code technisch, aber nur Organizerpfad; Besucheridentität und Merklistenübernahme später. |
| im Durchstich | ACCESS-01 | E-Mail-Code und private eigene Entwürfe. |
| im Durchstich | ACCESS-02 | Founder-Erstfreigabe, fremde Inhalte unzugänglich. |
| im Durchstich | ACCESS-03 | Freigegebener Owner publiziert/verschiebt/sagt eigene Events ab; Rücknahme nur soweit in Statusmodell vorbereitet. |
| im Durchstich (Teilumfang) | PUBLIC-01 | Veranstalterprofil, kommende Events und ehrlicher Leerzustand; Module/Kuration/Archiv später. |
| im Durchstich (Teilumfang) | PUBLIC-02 | Kerninformationen und scheduled/rescheduled/cancelled; vollständige Herkunfts-/Entfernungs-/Archivzustände später. |
| im Durchstich | PUBLIC-03 | Stabile URLs, Meta, Sitemap und JSON-LD aus bestätigter Revision. |
| im Durchstich (Teilumfang) | PUBLISH-01 | Nur vollständig manuelle Anlage; Text/Flyer/KI später. |
| im Durchstich (Teilumfang) | PUBLISH-02 | Regelbasierte Pflichtlücken und Widersprüche; keine Extraktion/KI; formatabhängige Minimalregeln nur für die erfassten Kernfelder. |
| im Durchstich (Teilumfang) | PUBLISH-03 | Manuelle Korrektur/Vorschau ohne Datenverlust; KI-Fehlerpfad später. |
| im Durchstich | PUBLISH-04 | Atomare Veröffentlichung einer vollständigen bestätigten Revision. |
| im Durchstich (Teilumfang) | PUBLISH-05 | Änderung, Verschiebung und Absage; Entfernung/Archivierung/Löschung später. |
| später | PUBLISH-06 | Duplizieren außerhalb des Durchstichs. |
| später | ASSIST-01 | KI/Assistent ausgeschlossen. |
| später | PROFILE-01 | Profilgestaltung und optionale Module ausgeschlossen. |
| im Durchstich (Teilumfang) | PROFILE-02 | Publikationsminimum und private Änderungen; Offline-Nehmen/Sonderfälle später. |
| später | EVENTDESIGN-01 | Kein Eventdesign-Editor; ausschließlich Default-Theme. |
| später | TPL-01 | Vorlagen ausgeschlossen. |
| später | FOLLOW-01 | Follow/E-Mail ausgeschlossen. |
| später | FOLLOW-02 | Versand ausgeschlossen. |
| später | FOLLOW-03 | Eventänderungsabo ausgeschlossen. |
| im Durchstich (Teilumfang) | SHARE-01 | Stabiler öffentlicher Link und Meta-Vorschau; Nachrichtentext/QR später. |
| später | SHARE-02 | Manuelle Story-Muster sind Alpha-Validierung, aber außerhalb dieses technischen Durchstichs; automatische Generierung bleibt nicht Alpha. |
| später | CURATE-01 | Kuration nicht im Durchstich. |
| später | CURATE-02 | Empfehlungen/Einladungen nicht im Durchstich. |
| später | MSG-01 | Eigene Plus-Nachrichten nicht im Durchstich. |
| später | FEED-01 | Feedback/Befragung nicht im Durchstich. |
| später | VISIT-01 | Besucher/Merken nicht im Durchstich. |
| später | VISIT-02 | Kalenderexport nicht im Durchstich. |
| im Durchstich (Teilumfang) | OPS-01 | Founder-Erstfreigabe und Sperrgrundlage; vollständige interne Prüfseite/D8 später. |
| später | OPS-02 | Messschema und Lernmetriken nicht im Durchstich. |
| später | DIST-01 | Analytics nicht im Durchstich. |
| später | DEL-01 | Aufbewahrung/Löschung ist technische Vorbedingung vor produktiver Verarbeitung, aber ohne Task-Abdeckung kein Requirement des Durchstichs. |
| nicht Alpha | PREMIUM-01 | Pro/Monetarisierung/Billing nicht Alpha; Plus-Reservierung ist separat später. |

## Zielstruktur der späteren Anwendung

```text
app/
  (auth)/login/page.tsx
  auth/callback/route.ts
  (organizer)/layout.tsx
  (organizer)/organizer/page.tsx
  (organizer)/organizer/profiles/setup/page.tsx
  (organizer)/organizer/profiles/[profileId]/edit/page.tsx
  (organizer)/organizer/profiles/[profileId]/preview/page.tsx
  (organizer)/organizer/events/new/page.tsx
  (organizer)/organizer/events/[eventId]/edit/page.tsx
  (organizer)/organizer/events/[eventId]/preview/page.tsx
  (internal)/internal/review/page.tsx
  (internal)/internal/review/actions.ts
  e/[slug]/page.tsx
  [profileSlug]/page.tsx
  sitemap.ts
  robots.ts
  not-found.tsx
components/
  auth/  organizer/  profile/  event/  public/  ui/
lib/
  auth/{server,client,guards}.ts
  db/{types,queries}.ts
  domain/{answers,profile-publication,event-publication,event-status,time,money}.ts
  public/{profiles,events,json-ld,metadata}.ts
  storage/{private,public,media-use}.ts
supabase/
  migrations/*_alpha_core.sql
  tests/rls_alpha_core.sql
tests/
  unit/{answers,profile-publication,event-publication,event-status,time,money,json-ld}.test.ts
e2e/
  auth.spec.ts  profile.spec.ts  event.spec.ts  review.spec.ts  publication.spec.ts  public-pages.spec.ts
```

Ordnernamen sind ausführbare Zielpfade, keine heute anzulegenden Dateien. Next.js-Version bei Gerüstbau fest pinnen und vorab gegen Amplify-Kompatibilität prüfen. Neue Abhängigkeiten je PR begründen.

## SQL-Datenmodell und Zugriffsentwurf

Der SQL-Entwurf normalisiert ausschließlich den Durchstich. Feldnamen aus v0.3 bleiben technische Vorschläge und müssen im Migrations-PR als solche kenntlich sein.

```sql
create type public.answer_state as enum
  ('provided','unknown','not_applicable','skipped','unanswered');
create type public.profile_kind as enum ('veranstalter');
create type public.review_state as enum
  ('draft','in_review','approved','rejected','blocked');
create type public.publication_state as enum
  ('private','published','withdrawn');
create type public.event_status as enum
  ('scheduled','rescheduled','postponed_undated','cancelled');
create type public.primary_format as enum
  ('concert','dj_set','club_night','listening_session','opening','exhibition','screening');
create type public.price_model as enum ('free','fixed','unknown');
create type public.access_kind as enum
  ('walk_in','door','online_ticket','online_registration');
create type public.media_role as enum ('profile_image','event_image');

create table public.app_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_founder boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  kind public.profile_kind not null default 'veranstalter',
  owner_id uuid not null references auth.users(id),
  slug text not null unique,
  draft_revision_id uuid,
  published_revision_id uuid,
  review_state public.review_state not null default 'draft',
  review_reason text,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  publication_state public.publication_state not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profile_revisions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  revision_no integer not null,
  name text,
  short_intro text,
  official_url text,
  public_contact text,
  profile_image_use_id uuid,
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users(id),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(profile_id, revision_no)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.profiles(id),
  slug text not null unique,
  draft_revision_id uuid,
  published_revision_id uuid,
  review_state public.review_state not null default 'draft',
  review_reason text,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  publication_state public.publication_state not null default 'private',
  public_status public.event_status not null default 'scheduled',
  cancelled_at timestamptz,
  cancelled_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_revisions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  revision_no integer not null,
  title_state public.answer_state not null default 'unanswered',
  title text,
  description_state public.answer_state not null default 'unanswered',
  description text,
  format_state public.answer_state not null default 'unanswered',
  primary_format public.primary_format,
  start_state public.answer_state not null default 'unanswered',
  start_at timestamptz,
  timezone text not null default 'Europe/Berlin',
  end_state public.answer_state not null default 'unanswered',
  end_at timestamptz,
  place_state public.answer_state not null default 'unanswered',
  place_name text,
  address_line text,
  postal_code text,
  city text,
  country_code text default 'DE',
  price_state public.answer_state not null default 'unanswered',
  price_model public.price_model,
  price_amount_minor integer,
  currency char(3) default 'EUR',
  access_state public.answer_state not null default 'unanswered',
  access_routes jsonb not null default '[]'::jsonb,
  atmosphere_state public.answer_state not null default 'unanswered',
  atmosphere_tags text[] not null default '{}',
  atmosphere_description text,
  event_image_use_id uuid,
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users(id),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(event_id, revision_no),
  check (timezone = 'Europe/Berlin'),
  check (end_at is null or start_at is null or end_at > start_at),
  check (price_amount_minor is null or price_amount_minor >= 0),
  check (cardinality(atmosphere_tags) <= 3),
  check (price_model <> 'fixed' or price_amount_minor is not null)
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid not null references auth.users(id),
  private_object_path text not null,
  mime_type text not null,
  created_at timestamptz not null default now()
);

create table public.media_uses (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.media_assets(id),
  profile_id uuid references public.profiles(id),
  event_id uuid references public.events(id),
  role public.media_role not null,
  public_object_path text,
  alt_text text,
  crop jsonb,
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users(id),
  check ((profile_id is not null)::int + (event_id is not null)::int = 1)
);

create table public.publication_audit (
  id bigint generated always as identity primary key,
  actor_id uuid not null references auth.users(id),
  entity_type text not null check (entity_type in ('profile','event')),
  entity_id uuid not null,
  revision_id uuid,
  action text not null check (action in
    ('provision_owner','submit_review','approve_first','reject_first','publish','reschedule','cancel','withdraw','block')),
  created_at timestamptz not null default now()
);
```

Nach Anlage der Revisionstabellen werden die zyklischen Fremdschlüssel `profiles.draft_revision_id/published_revision_id` und `events.draft_revision_id/published_revision_id` per `alter table` ergänzt. Zusätzliche Constraints/Trigger stellen sicher, dass referenzierte Revision und Entität zusammengehören. `provided` verlangt einen typgültigen Wert; andere Antwortzustände dürfen keinen Ersatzwert (`''`, `0`, `false`) tragen. Diese Invarianten werden, soweit SQL-tauglich, als `check`/Trigger und zusätzlich in Domain-Tests abgebildet.

### Verbindliche anonyme Lesearchitektur, Grants und RLS

Der Durchstich verwendet **ausschließlich schmale `security_invoker` Views** `public_profiles` und `public_events`; keine Public-Projection-Tabellen und keine öffentlichen Getter-Funktionen als zweite Architektur. Die Views joinen Basiszeile und exakt die über `published_revision_id` referenzierte Revision und filtern `publication_state = 'published'`, Profil zusätzlich `review_state = 'approved'`. Sie exponieren nur sichtbare Felder; niemals `owner_id`, `created_by`, private Objektpfade, interne Notizen oder Draft-IDs. `anon` erhält `SELECT` nur auf diesen Views und die dafür notwendigen, einzeln benannten public-safe Basisspalten; `anon` erhält **kein** Tabellen-`SELECT *` und keinerlei INSERT/UPDATE/DELETE-Rechte. Weil die Views `security_invoker` sind, erzwingen die Basistabellen-RLS zusätzlich die Published-/Approved-Zeilenfilter. Direkte Abfragen derselben freigegebenen Basisspalten liefern höchstens dieselben öffentlichen Zeilen, nie Drafts.

```sql
create view public.public_profiles with (security_invoker = true) as
select p.id, p.slug, r.name, r.short_intro, r.official_url,
       r.public_contact, mu.public_object_path as profile_image_path,
       r.confirmed_at as published_at
from public.profiles p
join public.profile_revisions r on r.id = p.published_revision_id
join public.media_uses mu on mu.id = r.profile_image_use_id and mu.confirmed_at is not null
where p.publication_state = 'published' and p.review_state = 'approved';

create view public.public_events with (security_invoker = true) as
select e.id, e.slug, e.organizer_id, e.public_status,
       r.title, r.description, r.primary_format, r.start_at, r.timezone,
       r.end_state, r.end_at, r.place_name, r.address_line, r.postal_code,
       r.city, r.country_code, r.price_state, r.price_model,
       r.price_amount_minor, r.currency, r.access_routes,
       r.atmosphere_tags, r.atmosphere_description,
       mu.public_object_path as event_image_path, r.confirmed_at as published_at
from public.events e
join public.profiles p on p.id = e.organizer_id
join public.event_revisions r on r.id = e.published_revision_id
join public.media_uses mu on mu.id = r.event_image_use_id and mu.confirmed_at is not null
where e.publication_state = 'published'
  and e.review_state = 'approved'
  and p.publication_state = 'published' and p.review_state = 'approved';

revoke all on public.public_profiles, public.public_events from public;
grant select on public.public_profiles, public.public_events to anon, authenticated;
```

Für die View-Auswertung werden `anon` nur die im jeweiligen `SELECT` tatsächlich referenzierten Basisspalten per `grant select(column, ...)` gewährt; insbesondere niemals `draft_revision_id`, `owner_id`, `created_by`, `private_object_path` oder Auditspalten. Die Migration listet diese Column-Grants explizit statt `grant select on table`. `authenticated` erhält dieselben View-Rechte plus die nachfolgend eng begrenzten Basisrechte für Ownerpfade.

Hilfsprädikate `is_founder()` und `owns_profile(profile_id)` werden als stabile, nicht öffentlich ausführbare interne Funktionen mit festem `search_path = pg_catalog, public` definiert. RLS wird auf jeder Tabelle aktiviert und erzwungen. Konkrete Policies (`USING` = sichtbare vorhandene Zeile, `WITH CHECK` = zulässiger neuer Stand):

| Tabelle | SELECT `USING` | INSERT `WITH CHECK` | UPDATE `USING` / `WITH CHECK` | DELETE `USING` | Grants |
|---|---|---|---|---|---|
| `app_roles` | `auth.uid() = user_id OR is_founder()` | keine Client-Policy | keine Client-Policy | keine Client-Policy | `authenticated`: SELECT eigene erlaubte Spalten; kein anon; Verwaltung nur Migration/Adminpfad. |
| `profiles` | Owner: `owner_id=auth.uid()`; Founder: `is_founder()`; anon/alle: zusätzlich nur `publication_state='published' AND review_state='approved'` | **keine Client-Policy**; ausschließlich Founder-Funktion `provision_profile_owner` | Owner/Founder sieht Zeile; `WITH CHECK` Owner/Slug/Kind unverändert und Owner darf `published_revision_id`, Review-/Publikationszustand nicht direkt setzen; Review nur über Founder-Funktion | **keine Client-Policy im Durchstich** | `authenticated`: SELECT und begrenztes UPDATE, **kein INSERT**; `anon`: SELECT ausschließlich benannte View-Spalten der published/approved Zeilen; kein DELETE. |
| `profile_revisions` | Owner über Parent oder Founder; anon nur `id = profiles.published_revision_id` bei published/approved Parent | Owner, `created_by=auth.uid()`, Revision gehört eigenem Profil, `confirmed_* IS NULL` | Owner/Founder nur wenn `id <> parent.published_revision_id`; `WITH CHECK` Parent/Creator unverändert | **keine Client-Policy im Durchstich** | `authenticated`: SELECT/INSERT/UPDATE auf Draftspalten; `anon`: nur public-safe View-Spalten aktueller Revision; kein DELETE. |
| `events` | Owner über `organizer_id`, Founder oder anon nur published/approved Event mit published/approved Organizer | Owner des bereits provisionierten Organizers; ausschließlich private/scheduled/draft Ausgangswerte | Owner/Founder; `WITH CHECK` Organizer unverändert, `published_revision_id`, `publication_state`, `public_status`, `review_*`, `cancelled_*` nicht direkt clientseitig änderbar | **keine Client-Policy im Durchstich** | `authenticated`: SELECT/INSERT/UPDATE editierbarer Spalten; `anon`: benannte View-Spalten published/approved Zeilen; kein DELETE. |
| `event_revisions` | Owner über Event→Profil, Founder oder anon nur `id=events.published_revision_id` eines öffentlichen Events | Owner, `created_by=auth.uid()`, Revision gehört eigenem Event, unbestätigt | Owner/Founder nur wenn nicht published; Parent/Creator unverändert | **keine Client-Policy im Durchstich** | `authenticated`: SELECT/INSERT/UPDATE Draftspalten; `anon`: public-safe View-Spalten aktueller Revision; kein DELETE. |
| `media_assets` | `uploader_id=auth.uid() OR is_founder()` | `uploader_id=auth.uid()` und privater Pfad im eigenen Storage-Präfix | Uploader nur solange keine bestätigte/publizierte Nutzung; Uploader/Pfad unverändert | **keine Client-Policy im Durchstich** | `authenticated`: SELECT/INSERT/begrenztes UPDATE; kein anon, kein DELETE. Storage-Bucket privat. |
| `media_uses` | Owner des referenzierten Profils/Events oder Founder; anon nur bestätigte Use-ID, die in aktueller öffentlicher Revision referenziert ist | Asset gehört `auth.uid()`, genau ein eigenes Parentobjekt, `confirmed_* IS NULL`, `public_object_path IS NULL` | Owner nur solange nicht veröffentlicht; Parent/Asset unverändert | **keine Client-Policy im Durchstich** | `authenticated`: SELECT/INSERT/begrenztes UPDATE; anon nur `public_object_path`, `alt_text`, `crop`, `role` für öffentlich referenzierte Uses; kein DELETE. |
| `publication_audit` | Owner der referenzierten Entität oder Founder | keine direkte Client-Policy; nur gesicherte Funktionen | keine | keine | `authenticated`: SELECT gemäß Policy; INSERT/UPDATE/DELETE entzogen; kein anon. |

Nach Erstellung: `revoke all on all tables in schema public from anon, authenticated;` und danach nur die oben genannten Tabellen-/Spaltenrechte zurückgeben; `grant select on public_profiles, public_events to anon, authenticated`. Tests prüfen zusätzlich `information_schema.role_column_grants`, damit spätere Migrationen nicht versehentlich breite Rechte ergänzen.

`publish_profile`, `publish_event`, `cancel_event` und `reschedule_event` sind die einzigen privilegierten Mutationspfade. Jede Funktion ist `security definer set search_path = pg_catalog, public`; nach Erstellung gilt `revoke all on function ... from public, anon` und `grant execute ... to authenticated`. Jede Funktion liest `auth.uid()` einmal, verwirft NULL, sperrt die Zielzeile `FOR UPDATE`, prüft Ownerzuordnung und bei Erstpublikation zusätzlich `is_founder()` beziehungsweise einen bereits founder-freigegebenen Reviewstand, validiert Vollständigkeit und `expected_draft_revision_id`, qualifiziert alle Objekte schematisch und schreibt Audit atomar. `cancel_event` ändert ausschließlich `events.public_status/cancelled_*` und Audit, niemals `published_revision_id`; damit bleibt ein neuer privater Flyer/Text privat (P23). Keine Funktion akzeptiert Actor-/Owner-ID vom Client.

Der Alpha-Bootstrap ist ebenfalls eindeutig: `provision_profile_owner(target_user_id uuid, target_slug text)` ist `security definer set search_path = pg_catalog, public`, prüft als erste Operation `is_founder()` und bricht andernfalls ab, prüft danach existierenden `auth.users`-Datensatz und eindeutigen/reservierten Slug, legt genau eine private Veranstalter-Profilhülle mit `owner_id=target_user_id`, `review_state='draft'` an und schreibt `publication_audit(action='provision_owner')`. Optional dürfen Shell-Felder wie ein vorab abgestimmter Name als nullable Parameter mitgegeben werden; sie gelten nie als bestätigt. `revoke all ... from public, anon`; `grant execute ... to authenticated`, wobei die interne Founderprüfung jeden anderen authenticated Aufruf verweigert. Die founder-only Server-Action ruft die Funktion mit der echten Founder-Session auf, niemals mit einem allgemeinen Service-Role-Bypass. Es gibt keine allgemeine `profiles`-INSERT-Policy. Playwright-Seeds provisionieren Owner A/B über diese Funktion im lokalen Founder-Kontext; sie schreiben nie direkt an RLS vorbei. Ein Besucherlogin kann daher weder per UI noch direktem Insert ein Profil erzeugen.

Die Erstfreigabe ist ein eigener Zustandsautomat. Owner-Aktionen `submit_profile_review(profile_id, expected_draft_revision_id)` und `submit_event_review(event_id, expected_draft_revision_id)` erlauben nur `draft|rejected -> in_review`, frieren die eingereichte Revision als Reviewgegenstand ein und auditieren. Founder-only `review_profile(profile_id, decision approved|rejected, reason)` und `review_event(event_id, decision approved|rejected, reason)` erlauben nur `in_review -> approved|rejected`; Ablehnung verlangt einen nichtleeren Grund, Zustimmung setzt `reviewed_by/at`, und Owner dürfen diese Funktionen nicht erfolgreich ausführen. Erst `approved` erlaubt die jeweilige Erstpublikation; spätere valide Revisionen desselben freigegebenen Profils/Events können vom Owner publiziert werden, solange keine Sperre vorliegt. Jede Funktion nutzt dieselben Security-Definer-Härtungen, Row Locks und Auditregeln wie oben.

## Seiten, Routen und öffentliche Daten

| Route | Zugriff | Zweck / Datenquelle |
|---|---|---|
| `/login` | öffentlich | E-Mail-Code anfordern/eingeben; keine Organizerrolle ableiten. |
| `/auth/callback` | öffentlich, token-sicher | Supabase-Callback; Token nicht loggen und sauber aus URL entfernen. |
| `/organizer` | authenticated + provisionierte Zuordnung | Profilwechsel/-übersicht; ohne Founder-Provisionierung neutrale „keine Zuordnung“-Ansicht, niemals Profilanlage. |
| `/organizer/profiles/setup` | Owner einer provisionierten Profilhülle | Vorhandene Veranstalterhülle vervollständigen; keine neue Profilzeile und keine Venue-/Artist-Option. |
| `/organizer/profiles/[profileId]/edit` | Owner | private Revision bearbeiten. |
| `/organizer/profiles/[profileId]/preview` | Owner/Founder | private Vorschau, `no-store`, keine öffentliche URL. |
| `/organizer/events/new` | Owner | manueller Eventdraft. |
| `/organizer/events/[eventId]/edit` | Owner | Draft/Lücken, Publizieren, Verschieben, Absagen. |
| `/organizer/events/[eventId]/preview` | Owner/Founder | private Vorschau, serverseitig autorisiert. |
| `/internal/review` | Founder only | Minimale Liste eingereichter Profil-/Event-Erstfreigaben; approve/reject mit Pflichtgrund bei Ablehnung, keine vollständige D8-Oberfläche. |
| `/e/[slug]` | öffentlich bei published | Eventseite inkl. Status; Draft/unpublished `notFound()`. |
| `/[profileSlug]` | öffentlich bei published | Veranstalterprofil, kommende veröffentlichte Events, nächstes hervorgehoben, sonst „Neue Termine folgen“. Reservierte Top-Level-Slugs sperren. |
| `/sitemap.xml` (`app/sitemap.ts`) | öffentlich | nur veröffentlichte Profile/Events; keine Preview-/Draft-URLs. |
| `/robots.txt` | öffentlich | keine Behauptung als Zugriffsschutz; Organizerpfade zusätzlich auth/RLS. |

`generateMetadata` und JSON-LD verwenden dieselbe Public-DTO-Query wie die sichtbare Seite. JSON-LD `Event` enthält `name`, `startDate` mit Offset, `eventStatus`, `location`, Organizer-URL und nur bestätigte Bild-/Preisfelder. `endDate` entfällt bei unbekanntem Ende. `offers.price = 0` erscheint ausschließlich bei bestätigtem `free`, nie bei `unknown`. Absage setzt `https://schema.org/EventCancelled`; Verschiebung mit bestätigtem Ersatztermin `EventRescheduled`. Die Herkunftszeile zeigt bestätigte Aktualität ohne interne IDs/Notizen.

## Testmatrix und Slice-Abnahmesignale

Test-IDs bleiben auf ihr Quelldokument qualifiziert (`v0.3:Pxx`, `Delta-v0.4:Dxx`, `v0.5:Exx`), da E-IDs zwischen Dokumenten kollidieren können. Nicht genannte Fälle werden nicht als abgedeckt behauptet.

| Slice | Vitest (Domain/Rendering) | Supabase RLS/SQL | Playwright | Abnahmesignal |
|---|---|---|---|---|
| 1 Migrationen + RLS | Antwortzustands-Mapper; Geld/UTC-IANA-Serialisierung | Owner A/B/anonym/founder; authenticated `profiles INSERT` verweigert; Founder-Provisionierung; Reviewtransitionen; Draft vs published | – | Lokale Migration frisch anwendbar; nur Founder kann Profilhülle zuordnen und Erstfreigaben entscheiden. |
| 2 Login | Guard: Session ohne provisionierte Zuordnung → kein Organizerzugriff | User ohne `profiles.owner_id` sieht/erzeugt keine Organizerzeile; Owner sieht nur eigenes Profil | `Delta-v0.4:D01` **teilweise**: keine Organizerrechte; Besucher kann kein Profil erzeugen; lokale Merkliste ausgeschlossen | Login funktioniert, erzeugt aber keine Rolle/Profilhülle; Fremdzugriff endet 403/404. |
| 3 Profil | Publikationsminimum/Slug/Link/Kontakt/Bild (`v0.3:P06`) | Draft privat; submit-review; Founder approve/reject; Owner-Selbstfreigabe verweigert | Provisioniertes Setup vervollständigen, private Vorschau, Founder-Review, Publikation blockiert ohne Approval/Bild | Öffentliche Profil-URL erscheint erst nach vollständiger Founder-Freigabe und Owner-Publikation. |
| 4 Event + Lückenprüfung | Nur die unten ID-genau als vollständig/teilweise geführten P-Fälle; `provided/unknown/...`; Cent/Zeitzone | Eventdraft nur Owner; Revisionen unveränderlich nach Publikation | Manuell anlegen; konkrete Lücken; unbekannter Preis; Onlinezugang ohne URL; Nachttermin | Vollständiger Draft publizierbar vorbereitet; unvollständiger bleibt speicher-/previewbar, aber blockiert. |
| 5 Publizieren/Absagen | `v0.3:P23`; Statusübergänge; stale revision rejected. `P39` ausdrücklich später. | Event submit-review; Founder approve/reject; Owner-Selbstfreigabe verweigert; atomare Publikation und status-only Absage | Founder-Erstfreigabe, Vorschau + Owner-Bestätigung; Draftänderung privat; Absage sofort; Verschiebung erst bestätigt | Erstpublikation ohne Founder-Approval unmöglich; spätere öffentliche Revision stabil; Absage veröffentlicht keine Draftänderung. |
| 6 öffentliche Seiten + JSON-LD | `v0.3:P07`, `P11–P12`; DTO/Meta/JSON-LD/Sitemap-Snapshots | Anonym bekommt nur published projection; private Slugs liefern keine Daten | `/e/[slug]`, `/[profileSlug]`, Meta, Sitemap, Draft 404/403; Statusdarstellung | Sichtseite, Metadata und JSON-LD stimmen mit derselben published Revision überein. |
| 7 Playwright-Flows | – | RLS-Suite erneut als Gate | alle sechs Abnahmen aus `02-durchstich.md`, Desktop + Mobile-Kernbreiten | `lint`, `typecheck`, Vitest, RLS-Suite und Playwright grün; Preview-Deployment nur nach Freigabe und ohne echte Daten. |

Für P05 gilt im Durchstich bewusst: ohne Eventbild sind Draft und private Vorschau möglich, Publikation ist blockiert. Das Testlabel muss die begrenzte Abweichung vom v0.3-Fall nennen.

### P-Fälle Slice 4 — ID-genaue Führungsentscheidung

| ID | Führung | Begründung / Testziel |
|---|---|---|
| v0.3:P01 | vollständig | Titel, Beginn und Adresse werden geführt; konkrete Lücke blockiert nur Publikation. |
| v0.3:P02 | teilweise | Fehlende bestätigte Atmosphäre blockiert; KI-Vorschlagsanteil ist ausgeschlossen. |
| v0.3:P03 | vollständig | Eigener bestätigter Atmosphärensatz erfüllt die Pflicht ohne Tags. |
| v0.3:P04 | vollständig | Mehr als drei Tags wird als Fehler gezeigt, nicht still abgeschnitten. |
| v0.3:P05 | Durchstich-Abweichung | Draft/Preview ohne Bild ja, Publikation nein; begrenztes Gate aus `02-durchstich.md`, keine globale Vertragsänderung. |
| v0.3:P07 | vollständig | `unknown` wird bewusst bestätigt und nie als `free`/0 gerendert. |
| v0.3:P08 | vollständig | Erforderlicher Onlinezugang ohne gültige URL blockiert. |
| v0.3:P09 | teilweise | Mehrere Zugangswege getrennt; vollständige Verfügbarkeitsmodellierung ist nicht Teil des Durchstichs. |
| v0.3:P10 | nicht geführt | `from`, Gebührenmodell und Budgetmatching liegen außerhalb der drei Durchstich-Preismodelle. |
| v0.3:P11 | vollständig | Europe/Berlin-Nachttermin zeigt beide Kalendertage; Ende liegt nach Beginn. |
| v0.3:P12 | vollständig | Unbekanntes Ende erzeugt kein öffentliches Ende/JSON-LD-`endDate`; Cutoff bleibt intern. |
| v0.3:P13 | vollständig | Nicht existente/mehrdeutige DST-Ortszeit blockiert bis zur Klärung. |
| v0.3:P14 | nicht geführt | `last_entry` ist kein Durchstich-Eingabefeld. |
| v0.3:P15 | nicht geführt | Geocoding/Distanzsuche ist nicht im Durchstich. |
| v0.3:P17 | nicht geführt | Zugänglichkeitsdetailmodell ist nicht Bestandteil der manuellen Kernfelder. |
| v0.3:P18 | nicht geführt | Film-Sprach-/Untertitelantwort ist im Durchstich nicht als Eingabefeld zugesagt. |
| v0.3:P49 | nicht geführt | Musikalisches Konzept/Besuchsmodus der Listening-Session bleibt außerhalb der expliziten Kernfelder; vor Erweiterung `TODO(spec)` und PUBLISH-02-Restumfang. |
| v0.3:P50 | vollständig | Enum bietet kein universelles „Sonstiges“; Workshop bleibt nicht publizierbarer Klärungsfall. |

Slice-4-Done darf ausschließlich `P01`, `P03`, `P04`, `P07`, `P08`, `P11`, `P12`, `P13` und `P50` als vollständig grün nennen; `P02`/`P09` nur als Teilabdeckung und P05 nur als qualifizierte Durchstich-Abweichung.

### D-/E-Fallinventar mit Quellenqualifikation

| Quelle und IDs | Einstufung im Durchstich | Grund |
|---|---|---|
| Delta v0.4 `D01` | teilweise | Login ohne Organizerzuordnung wird geprüft; lokale Merklistenübernahme/Deduplizierung ist Besucherfunktion und ausgeschlossen. |
| Delta v0.4 `D02`, `D03`, `D04`, `D05` | ausgeschlossen | Assistentenkontingent/Plus. |
| Delta v0.4 `D06`, `D07`, `D08`, `D09` | ausgeschlossen | Feedback/Befragung/Plus. |
| Delta v0.4 `D10`, `D11` | ausgeschlossen | Eventabo beziehungsweise Merken/Besucher. |
| Delta v0.4 `D12`, `D13`, `D14`, `D15` | ausgeschlossen | Billing/Anfrage/Testende/Downgrade. |
| Delta-v0.4-Fallregister `E01`, `E02`, `E03`, `E04`, `E05`, `E06`, `E07`, `E08`, `E09`, `E10`, `E11`, `E12`, `E13`, `E14`, `E15`, `E16`, `E17`, `E18`, `E19`, `E20`, `E21`, `E22` | nicht als Test geführt | `docs/startpaket/06` nennt nur den ID-Bereich; die im Repo vorliegende Delta-v0.4-Lesefassung definiert D01–D15, nicht die E-Falltexte. Ohne autoritative Falltexte keine erfundene Voll-/Teilabdeckung. Vor Ausführung gezielter Notion-Abgleich oder Export nötig. |
| Alpha-Featurematrix `E23`, `E24`, `E25`, `E26`, `E27`, `E28`, `E29`, `E30`, `E31`, `E32`, `E33`, `E34`, `E35`, `E36` | nicht als Test geführt | Featurematrix ist laut README nicht im Repo; ID-Texte fehlen. Keine Zuordnung raten. Soweit sie Plus, Follow, Besucher oder Netzwerk betreffen, sind diese Funktionen ohnehin ausgeschlossen. |
| Delta v0.5 `E37`, `E38`, `E39`, `E40`, `E41`, `E42`, `E43`, `E44`, `E45`, `E46`, `E47` | nicht als Test geführt | Lesefassung nennt nur den Bereich, nicht die Einzelfälle. Venue, Person, Briefing, Einladungen und Versand sind ausgeschlossen; mögliche Kernüberschneidungen erst nach Lesen der Vollquelle klassifizieren. |

Damit wird kein E-Fall still als abgedeckt oder ausgeschlossen behauptet, dessen Text im Repo fehlt. Der fehlende Vollquellenabgleich ist ein sichtbares Plan-Gate, kein Anlass für erfundene Testsemantik.

<tasks>

<task type="auto" tdd="true">
  <name>Slice 1: Migrationen, Publikationsmodell und direkt testbare RLS-Grenzen</name>
  <files>supabase/migrations/*_alpha_core.sql, supabase/tests/rls_alpha_core.sql, lib/db/types.ts</files>
  <objective>Das Datenmodell, seine Invarianten und die Entwurf/Öffentlich-Grenze vor jeder UI herstellen.</objective>
  <read_first>ADR-004/005/008; Datenvertrag v0.3 §§1–8, 11, 13–18; AGENTS.md technische Regeln.</read_first>
  <action>SQL-Typen, Tabellen, zyklische Revision-FKs, Indizes, Storage-Policies, RLS und transaktionale Funktionen gemäß obigem Entwurf implementieren. `profiles` hat keine authenticated INSERT-Policy; `provision_profile_owner` ist der einzige Alpha-Bootstrap. Submit-/Founder-Reviewfunktionen für Profil und Event samt Zustandsübergängen und Audit anlegen. Für jede Nutzerdatentabelle RLS explizit aktivieren und Grants minimieren. Seed-/Testhelfer ausschließlich im Testschema halten und Profilhüllen über den echten Founder-Funktionspfad provisionieren. SQL-RLS-Tests mit anonym, Besucher ohne Zuordnung, Owner A, Owner B und Founder schreiben; positive wie negative Direktabfragen und Mutationen prüfen. Generierte DB-Typen erst nach erfolgreicher lokaler Migration erzeugen.</action>
  <acceptance_criteria>Draft und published Revision sind getrennt; Besucher/authenticated kann kein Profil inserten; nur Founder provisioniert; Owner kann Review einreichen, aber nie selbst entscheiden; publizierte Revisionen sind unveränderlich und öffentliche Views kennen keine privaten Spalten.</acceptance_criteria>
  <verify><automated>supabase db reset &amp;&amp; supabase test db supabase/tests/rls_alpha_core.sql</automated></verify>
  <done>Frische Datenbank migriert; jede RLS-Matrixzeile ist mit mindestens einem erlaubten und einem verweigerten Test belegt.</done>
</task>

<task type="auto">
  <name>Slice 2: E-Mail-Code-Login und explizite Organizerzuordnung</name>
  <files>app/(auth)/login/page.tsx, app/auth/callback/route.ts, app/(organizer)/layout.tsx, app/(organizer)/organizer/page.tsx, lib/auth/server.ts, lib/auth/guards.ts, tests/unit/auth-guards.test.ts, e2e/auth.spec.ts</files>
  <objective>Authentifizierung von Autorisierung trennen und den Organizerbereich serverseitig schützen.</objective>
  <read_first>ADR-003; Delta v0.4 §13/14.1 und D01; `02-durchstich.md` Punkt 1.</read_first>
  <action>Supabase SSR-Session mit E-Mail-Code anbinden, Callback tokensicher behandeln und Organizerlayout serverseitig gegen eine durch `provision_profile_owner` bestehende Profilzuordnung schützen. Keine Rechte aus E-Mail-Domain/-Gleichheit ableiten. Reiner Login zeigt eine neutrale „keine Zuordnung“-Ansicht ohne Create-Profile-CTA. Founder-Allowlist serverseitig auflösen. Playwright Owner A/B über den realen Founder-Provisionierungspfad seeden; Besucher bleibt unprovisioniert. Tests ohne echte E-Mail über lokale Auth-Testmechanik.</action>
  <acceptance_criteria>Unauthenticated wird zum Login geleitet; authenticated ohne Provisionierung sieht keine privaten Organizerdaten und kann kein Profil erzeugen; Owner A kann kein Profil/Event von B laden.</acceptance_criteria>
  <verify><automated>npm run test -- auth-guards &amp;&amp; npm run test:e2e -- auth.spec.ts</automated></verify>
  <done>D01-Teilpfad ist automatisiert belegt; Login erzeugt weder Profil noch Organizerrecht.</done>
</task>

<task type="auto" tdd="true">
  <name>Slice 3: Veranstalterprofil als privater und bestätigter Stand</name>
  <files>lib/domain/profile-publication.ts, app/(organizer)/organizer/profiles/setup/page.tsx, app/(organizer)/organizer/profiles/[profileId]/edit/page.tsx, app/(organizer)/organizer/profiles/[profileId]/preview/page.tsx, app/(internal)/internal/review/page.tsx, app/(internal)/internal/review/actions.ts, components/profile/**, tests/unit/profile-publication.test.ts, e2e/profile.spec.ts, e2e/review.spec.ts</files>
  <objective>Ein minimales Veranstalterprofil speichern, prüfen, erstmals freigeben und ausdrücklich veröffentlichen.</objective>
  <read_first>Datenvertrag v0.3 §3 und P06; Delta v0.4 §17.7; v0.5 §4.1; `02-durchstich.md` Punkt 2.</read_first>
  <action>Nur die bereits Founder-provisionierte Veranstalter-Profilhülle vervollständigen; keine Profilanlage durch den Owner. Name, Kurzvorstellung, eindeutigen Slug, mindestens offiziellen Link oder öffentlichen Kontakt und bestätigte Profilbild-Nutzung erfassen. Unvollständige Drafts speichern; private Preview mit `no-store`. Owner reicht vollständige Revision zur Prüfung ein. Minimale `/internal/review`-Route founder-only bauen: eingereichte Profile anzeigen und per Server Action `review_profile(approved|rejected, reason)` entscheiden; Ablehnungsgrund Pflicht, Owner-Selbstfreigabe abweisen, Audit sichtbar. Nach Approval publiziert der Owner ausdrücklich; spätere valide Revisionen benötigen keine neue Erstfreigabe. Keine Module oder Gestaltungssteuerung.</action>
  <acceptance_criteria>P06 blockiert öffentlich, nicht privat; unprovisionierter Login kann Setup nicht öffnen; `draft/rejected -> in_review -> approved/rejected` ist erzwungen; nur Founder entscheidet; veröffentlichter Stand ändert sich nicht beim weiteren Editieren.</acceptance_criteria>
  <verify><automated>npm run test -- profile-publication &amp;&amp; npm run test:e2e -- profile.spec.ts</automated></verify>
  <done>Vollständiges freigegebenes Profil wird öffentlich; fehlendes Bild oder fehlender Link/Kontakt bleibt privater Draft.</done>
</task>

<task type="auto" tdd="true">
  <name>Slice 4: Manueller Evententwurf mit konkreter Pflichtlückenprüfung</name>
  <files>lib/domain/answers.ts, lib/domain/event-publication.ts, lib/domain/time.ts, lib/domain/money.ts, app/(organizer)/organizer/events/new/page.tsx, app/(organizer)/organizer/events/[eventId]/edit/page.tsx, components/event/**, tests/unit/event-publication.test.ts, tests/unit/time.test.ts, tests/unit/money.test.ts, e2e/event.spec.ts</files>
  <objective>Den manuellen Kernvertrag mit bewussten Antwortzuständen, Zeit, Geld, Zugang, Bild und Atmosphäre ohne KI umsetzen.</objective>
  <read_first>v0.3 §§1–8, 14, 16–17; Fragenpool B01–B13 und formatabhängige Fragen; `02-durchstich.md` Punkt 3.</read_first>
  <action>Sieben Hauptformate, Titel, Beschreibung, Start als lokales Europe/Berlin-Datum plus UTC-Instant, optionales Ende, Textort samt Adresse, Preis free/fixed/unknown, mindestens einen Zugangsweg, bestätigte Eventbild-Nutzung und Atmosphäre mit 1–3 Tags oder eigener bestätigter Beschreibung erfassen. `A(T)` nie mit leer/0/false simulieren. Jede Lücke adressiert Feld und Grund. Bei DST-Ambiguität blockieren. Musikalisches Konzept/Besuchsmodus für Listening-Session sowie Film-Sprache/Untertitel nicht still ergänzen: Sie bleiben als PUBLISH-02-Restumfang `TODO(spec)`, weil `02-durchstich.md` diese Felder nicht in die manuelle Kernliste aufnimmt.</action>
  <acceptance_criteria>Unvollständiger Draft bleibt speicherbar; Veröffentlichungsvorbereitung liefert deterministische Feldfehler; Preis unknown bleibt eigener Zustand; Cent statt Float; Bildpflicht nur als Durchstich-Gate dokumentiert.</acceptance_criteria>
  <verify><automated>npm run test -- answers event-publication time money &amp;&amp; npm run test:e2e -- event.spec.ts</automated></verify>
  <done>Vollständig grün: P01, P03, P04, P07, P08, P11, P12, P13 und P50. Teilweise und entsprechend benannt: P02 und P09. P05 ist nur als Durchstich-Abweichung getestet; P10, P14, P15, P17, P18 und P49 werden ausdrücklich nicht geführt.</done>
</task>

<task type="auto" tdd="true">
  <name>Slice 5: Vorschau, atomare Veröffentlichung, Verschiebung und sofortige Absage</name>
  <files>app/(organizer)/organizer/events/[eventId]/preview/page.tsx, app/(internal)/internal/review/page.tsx, app/(internal)/internal/review/actions.ts, lib/domain/event-status.ts, components/event/publish-dialog.tsx, components/event/status-actions.tsx, tests/unit/event-status.test.ts, e2e/review.spec.ts, e2e/publication.spec.ts</files>
  <objective>Bestätigung und Statuswechsel so verdrahten, dass kein privater Inhalt still öffentlich wird.</objective>
  <read_first>v0.3 §§4, 11 und P23; `02-durchstich.md` Punkte 4/7 und Abnahmen. P39 bleibt später, da Draft-Löschung nicht im Durchstich steht.</read_first>
  <action>Private Vorschau, Review-Einreichung, expliziten Publish-Dialog und Server-Action mit expected revision implementieren. `/internal/review` um eingereichte Event-Erstfreigaben erweitern und `review_event(approved|rejected, reason)` ausschließlich founder-only aufrufen; Owner-Selbstfreigabe und ungültige Transitionen ablehnen und auditieren. Erst nach Approval kann der Owner die Erstpublikation ausdrücklich auslösen. Absage als separate Bestätigung an `cancel_event`, Ticketaktion ausblenden und Draft unangetastet lassen. Verschiebung erzeugt/ändert einen Draft und wird erst mit eigener Bestätigung veröffentlicht; bei Ersatztermin Status rescheduled.</action>
  <acceptance_criteria>Erstpublikation ohne Founder-Approval scheitert; Ablehnung benötigt Grund; stale Draft kann nicht publiziert werden; Absage zeigt sofort den Status der bisherigen published Revision; privates Bild/Text bleibt privat.</acceptance_criteria>
  <verify><automated>npm run test -- event-status &amp;&amp; npm run test:e2e -- publication.spec.ts</automated></verify>
  <done>P23 sowie Absage-/Verschiebungsabnahmen sind grün; Audit enthält Akteur, Aktion, Revision und Zeitpunkt. P39 bleibt ausdrücklich später und wird nicht als abgedeckt gemeldet.</done>
</task>

<task type="auto" tdd="true">
  <name>Slice 6: Öffentliche Profil-/Eventseiten, Meta, JSON-LD und Sitemap</name>
  <files>lib/public/profiles.ts, lib/public/events.ts, lib/public/json-ld.ts, lib/public/metadata.ts, app/e/[slug]/page.tsx, app/[profileSlug]/page.tsx, app/sitemap.ts, app/robots.ts, components/public/**, tests/unit/json-ld.test.ts, e2e/public-pages.spec.ts</files>
  <objective>Alle öffentlichen Darstellungen deterministisch aus demselben bestätigten Stand rendern.</objective>
  <read_first>`02-durchstich.md` Punkte 5/6; v0.3 §§4–7; v0.5 §6.7/6.8; Figma-Screen-Index.</read_first>
  <action>Mobile-first Eventseite mit Format-Tag, Faktenblock, relevanten „Gut zu wissen“-Balken, Beschreibung, Atmosphäre, Organizerlink und Herkunftszeile bauen. Profilseite zeigt kommende veröffentlichte, nicht abgesagte Events, nächstes hervorgehoben, sonst exakten Leertext. Metadata/OG, sitemap und schema.org Event aus Public DTO ableiten. Unpublished/withdrawn/blocked und private Preview-Slugs nie listen oder rendern. Standard-Theme/Tokens verwenden; kein Theme-Editor.</action>
  <acceptance_criteria>P07 unknown zeigt „Preis noch offen“, niemals „Frei“/0; P11 korrekt über Mitternacht; P12 ohne endDate; Sitemap enthält nur öffentliche URLs; abgesagt korrekt markiert und ohne Ticketaktion.</acceptance_criteria>
  <verify><automated>npm run test -- json-ld &amp;&amp; npm run test:e2e -- public-pages.spec.ts</automated></verify>
  <done>Sichtseite, Meta und JSON-LD teilen eine DTO-Quelle; Draftzugriffe ergeben 404/403 statt nur noindex.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Slice 7: Playwright-Gesamtabnahme und Founder-Review</name>
  <files>e2e/auth.spec.ts, e2e/profile.spec.ts, e2e/event.spec.ts, e2e/review.spec.ts, e2e/publication.spec.ts, e2e/public-pages.spec.ts, playwright.config.ts</files>
  <objective>Den vollständigen Durchstich automatisiert prüfen und die visuelle/fachliche Abnahme einholen, ohne automatisch weiterzugehen.</objective>
  <read_first>`02-durchstich.md` Abnahme; Figma-Knoten aus `03-screens-figma.md`; alle Slice-Summaries.</read_first>
  <action>Playwright-Flows für unprovisionierten Besucherlogin, Founder-Provisionierung, Owner-Setup, Profil-/Event-Einreichung, Founder-Approve/Reject, Owner-Publikation, öffentliche Seiten, Verschiebung und Absage konsolidieren. Owner-Selbstfreigabe als negativen Pfad führen. Die sechs Abnahmen aus 02 exakt benennen. Desktop und Mobile testen; Screenshots/Traces nur mit synthetischen Daten. CI-Gates lint/typecheck/Vitest/RLS/Playwright ausführen. Development-/Preview-Deployment erst bei gesonderter Ausführungsfreigabe und innerhalb Gratis-/Guthabenrahmen.</action>
  <acceptance_criteria>Alle automatisierten Gates grün; keine ausgeschlossene Funktion im Build; visuelle Prüfung gegen Figma-Referenzen und deutsche UI-Texte dokumentiert.</acceptance_criteria>
  <verify><automated>npm run lint &amp;&amp; npm run typecheck &amp;&amp; npm run test &amp;&amp; supabase test db supabase/tests/rls_alpha_core.sql &amp;&amp; npm run test:e2e</automated></verify>
  <done>Founder bestätigt den lokalen/Preview-Durchstich oder dokumentiert konkrete Abweichungen; keine automatische nächste Phase und kein Merge/Production-Deploy.</done>
</task>

</tasks>

## Offene Fragen und `TODO(spec)`

1. **Schriftpaare:** Die sechs kuratierten Paare sind nicht konkretisiert. Durchstich nutzt Space Grotesk/Default; keine Platzhalter-Auswahl als Produktentscheidung bauen.
2. **Radiuswerte:** `sharp/soft/round` haben keine finalen Pixelwerte. Durchstich nutzt bestehende Plattformtokens; kein Profil-/Event-Radiuseditor.
3. **KI-Datenschutzhinweis:** Wortlaut, EU-Verarbeitung und konkretes Google-Modell offen. KI ist ausgeschlossen; vor KI-Slice rechtlich/fachlich klären.
4. **Monitoring/Sentry:** Anbieter, Datenregion, PII-Scrubbing, Sampling und 30-Tage-Fehlerlogfrist offen. Keine Sentry-Abhängigkeit im Durchstich ohne Entscheidung; minimale strukturierte, PII-freie Serverlogs.
5. **Backups:** Supabase-PITR/Free-Plan-Fähigkeit, höchstens 30 Tage Rotation und Wiederanwendung von Lösch-/Abmeldevorgängen nach Restore sind offen. Kein Produktionsbetrieb vor Nachweis.
6. **Umgebungen:** Grenze zwischen Branch-Preview, staging und production, getrennte Supabase-Projekte/Secrets und Seed-Regeln entscheiden. Plan erlaubt nur development/preview; production bleibt gesperrt.
7. **Founder-Identitätsquelle:** Die Provisionierungs- und Reviewfunktionen sind festgelegt; offen bleibt nur, ob `is_founder()` in Preview über serverseitige Allowlist oder unveränderliche Custom Claims gespeist wird. Keine E-Mail-Gleichheit und keine Client-Selbstvergabe.
8. **Vollständige D8-UX:** Der Durchstich enthält die minimale `/internal/review`-Route mit Approve/Reject und Pflichtgrund. Filter, Rückfragen, Sperrworkflow und redaktionelle Komfortfunktionen bleiben später.
9. **Medienrechtstexte und Limits:** Bestätigungstext, MIME-/Größenlimits, Crop/Ableitungen, Alttextpflicht und öffentliche Bucket-Promotion finalisieren.
10. **v0.3-Feldtypisierung:** Datenvertrag ist nicht gesamt abgenommen. Nur explizite Durchstichfelder normalisieren; jede darüber hinausgehende Enum-/Längenentscheidung bleibt `TODO(spec)`.
11. **Eventende und Verschiebung ohne Termin:** Durchstich-Abnahme fordert Nachtende und Verschiebung. Exakte UI für `postponed_undated` nur bauen, wenn im Slice freigegeben; sonst Schema vorbereiten und UI als `TODO(spec)` markieren.
12. **Öffentliche Herkunftszeile:** finaler deutscher Wortlaut/Aktualitätsformat offen; keine internen Bestätigungsdaten oder E-Mail zeigen.

## Risiken und Reihenfolge

1. **RLS zuerst:** Ein UI-first-Ansatz kann private Revisionen leaken. Slice 1 ist harte Voraussetzung für alle folgenden Slices.
2. **Auth ≠ Rolle:** Supabase-Session darf nie Organizerzugriff implizieren. Slice 2 vor allen Editoren.
3. **Revision-FK-Zyklus und Atomizität:** Falsche Constraints können published/draft vermischen. Transaktionen, row locks und expected revision zwingend vor Publikations-UI.
4. **Schemaentwurf versus offener Vertrag:** Nur Durchstichfelder implementieren und Migrationen erweiterbar halten; keine offene Produktspezifikation still fixieren.
5. **Zeit/DST/JSON-LD:** UTC plus IANA-Zone zentralisieren; Browser-/DB-Datumsparsing nicht duplizieren.
6. **Storage-Leak:** Private Upload-URL nicht als öffentliche URL wiederverwenden; bestätigte `media_use` und kontrollierte Kopie/Transformation.
7. **Top-Level-Profilslug:** Kollision mit Systemrouten früh durch Reserved-Slug-Constraint/Validator vermeiden.
8. **Absage-Pfad:** Separate status-only Funktion, sonst riskiert eine Absage die ungewollte Veröffentlichung privater Änderungen.
9. **Testdaten und E-Mail:** ausschließlich synthetisch/lokal; keine echten Empfänger, keine Live-Produktmails.
10. **Betrieb:** Preview ist kein Produktionsnachweis; Monitoring, Backup, Datenschutz und Umgebungsisolation bleiben vor echtem Betrieb blockierend.

<verification>
Vor späterer Ausführung muss jeder Slice sein eigenes automatisiertes Abnahmesignal erfüllen. Phase 4 ist erst technisch verifiziert, wenn Migration auf leerer DB, RLS-Matrix, Unit-/Domain-Tests und alle Playwright-Flows grün sind und der Founder die UI gegen die referenzierten Screens geprüft hat. Eine PLAN-Datei, ein Preview-Build oder ein grüner UI-Test allein erfüllt kein Requirement.
</verification>

<success_criteria>
- Sieben Slices liefern in der festgelegten Reihenfolge einen durchgehenden synthetischen Ablauf Login → privates Profil → privates Event → bestätigte Publikation → öffentliche Seiten → Verschiebung/Absage.
- Direkte Datenbanktests beweisen, dass anonyme/fremde Nutzer keine Drafts lesen oder ändern können.
- Kein Requirement wird durch diesen Plan oder einen Teil-Slice als vollständig/validiert markiert; Teilumfang und Rest bleiben nachvollziehbar.
- Alle sechs Abnahmen aus `docs/startpaket/02-durchstich.md` sind benannte Playwright-Flows.
- `auto_advance` bleibt `false`; nach Plan beziehungsweise nach jedem späteren Slice erfolgt ein bewusster Review-Stopp.
</success_criteria>

<output>
Bei späterer Ausführung je Slice eine GSD-Summary im Phase-Ordner erzeugen, tatsächliche Dateien/Tests/Abweichungen dokumentieren und `docs/STATUS.md` nur als kurze Übergabe aktualisieren. Keine zweite Aufgabenliste außerhalb `.planning/` anlegen.
</output>
