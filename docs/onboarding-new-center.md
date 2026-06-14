# Onboarding a New Center

Step-by-step guide for adding a new TM center to the platform. Takes ~30 minutes, mostly waiting for DNS propagation.

---

## 1. Find the TMW Center IDs

Run the lookup script locally from the repo root:

```bash
npx tsx scripts/find-tmw-center.ts <Stadt>
# Example:
npx tsx scripts/find-tmw-center.ts Berlin
# Output:
# ID 42   Berlin (10115)   3 Vorträge
# ID 43   Berlin-Mitte (10117)   0 Vorträge
```

Note the IDs you want. Use the TMW test button in the next step to confirm.

---

## 2. Create the Tenant in Super-Admin

Go to `tm-muenchen.de/super-admin` (or `localhost:3000/super-admin` locally).

Click **+ Neuer Tenant** and fill in:

| Field | Example | Notes |
|---|---|---|
| Slug | `berlin` | Lowercase, no spaces, permanent — becomes Supabase PK |
| Hostname | `tm-berlin.de` | The domain the center will use |
| Stadt | `Berlin` | Display name shown in CenterBanner |
| Passwort | `...` | Center admin's login password for `/admin` |
| Aktive Sprachen | `DE` | Add EN/FR/ES once center wants multi-language |
| Center IDs | `42, 43` | From step 1 — hit **Verbindung testen** to confirm |
| Kontakt E-Mail | `info@tm-berlin.de` | Shown on public site |
| Kontakt Telefon | `+49 30 ...` | Shown on public site |
| Absender-E-Mail | `info@tm-berlin.de` | Resend sender — must match verified domain (step 4) |
| Instagram | `https://www.instagram.com/...` | Leave blank for national fallback |
| WhatsApp | enable + link | Optional — only if center has a community |
| Impressum | paste legal text | Required — varies per center (Verein vs. individual) |

Save → tenant appears in the list.

---

## 3. Configure the Domain in Vercel

1. Go to [vercel.com](https://vercel.com) → **tm-muenchen** project → **Settings → Domains**
2. Click **Add** → enter the domain (e.g. `tm-berlin.de`)
3. Also add `www.tm-berlin.de` if needed (redirect to apex)
4. Vercel shows the DNS records to set — keep this tab open for step 4

---

## 4. Set DNS at the Registrar

Log in to wherever the center's domain is registered (EMVX, IONOS, Strato, etc.).

Set the records Vercel provided in step 3. Usually:

| Type | Name | Value |
|---|---|---|
| `A` | `@` | `76.76.21.21` (Vercel IP) |
| `CNAME` | `www` | `cname.vercel-dns.com` |

DNS propagation: typically 5–30 minutes, sometimes up to 24h.

Verify in Vercel once the domain shows a green checkmark.

---

## 5. Verify the Sender Domain in Resend

The center's emails (registration confirmations, reminders) come from `from_email`. Resend must verify that domain.

1. Go to [resend.com](https://resend.com) → **Domains** → **Add Domain**
2. Enter the domain (e.g. `tm-berlin.de`)
3. Resend shows SPF, DKIM, and DMARC DNS records
4. Add these at the registrar (same place as step 4)
5. Click **Verify** in Resend — takes a few minutes

Until verified, emails will not send from that address.

---

## 6. Smoke Test

Once DNS is live and Resend is verified:

1. Open `tm-berlin.de` in a browser — should load the landing page with Berlin's events and teachers
2. Open `tm-berlin.de/admin` — login with the password from step 2
3. Submit a test registration on the landing page — confirm confirmation email arrives from `info@tm-berlin.de`
4. In super-admin, hit **Verbindung testen** again — confirm lecture count looks right

---

## 7. Optional: Upload Center Image

In the center's admin at `tm-berlin.de/admin` → **Einstellungen** tab → upload a center photo.

Falls back to the München default image if left empty.

---

## Summary Checklist

- [ ] TMW center IDs found and verified
- [ ] Tenant created in `/super-admin`
- [ ] Domain added in Vercel
- [ ] DNS records set at registrar
- [ ] Resend sender domain verified
- [ ] Smoke test passed (site loads, admin works, email sends)
- [ ] Center image uploaded (optional)
