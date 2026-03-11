# Energy B2B Portal — Pitch Deck

**One platform for wholesale energy trading, multi-utility self-service, and grid-ready operations.**

---

## The problem

- **Fragmented tools:** Utilities and traders juggle separate systems for billing, trading, and grid data.
- **Limited self-service:** B2B customers can’t easily see usage, pay bills, or submit requests in one place.
- **Integration gaps:** Meter and grid data live in silos; protocols (Modbus, DNP3, IEC 60870) rarely connect to a single portal.
- **Compliance risk:** Audit trails, access control, and anomaly detection are often afterthoughts.

---

## Our solution

**Energy B2B Portal** is a unified SaaS platform that:

1. **Puts customers in control** — Service points, usage, bills, and service requests in one portal.
2. **Unifies operations** — Billing runs, usage ingest, trading, and grid status in one operations dashboard.
3. **Connects to the grid** — Designed for day-ahead bids, bilateral contracts, and real-time grid snapshots; ready for protocol gateways (Modbus TCP, IEC 60870, DNP3).
4. **Stays secure and compliant** — Role-based access, MFA, full audit logs, and anomaly detection built in.

---

## Product overview

| Pillar | Who uses it | What they get |
|--------|-------------|----------------|
| **Customer portal** | B2B clients (retailers, C&I) | Service points, usage charts, bills (issued/paid/overdue), service requests |
| **Operations** | Admin & personnel | Service point search, bulk usage ingest, billing run by period, anomaly list and scan |
| **Trading** | Ops / traders | Bilateral contracts, day-ahead market bids, grid status dashboards |
| **Security** | Ops / compliance | Audit log, anomaly flags (usage, billing, access, trading), on-demand anomaly scan |

---

## Customer portal (self-service)

- **Service points** — View all power, gas, and water meter points; filter by type, account, or meter.
- **Usage** — Historical usage with date range and service-type filters; **line charts** and tables (Recharts).
- **Bills** — List and detail view; statuses: draft, issued, paid, overdue.
- **Service requests** — Submit requests (e.g. meter issue, tariff change) with type, description, and preferred date.

*One login, one place for account management and usage monitoring.*

---

## Operations dashboard

- **Service points** — Search and filter all points; see customer, meter, grid zone, status.
- **Usage ingest** — Bulk upload usage readings (e.g. from IoT gateways) via JSON; supports thousands of readings per run.
- **Billing run** — Generate bills for any period from usage + tariffs; no duplicate bills for same period.
- **Anomalies** — View flags (usage spike, billing overdue, access, trading); trigger **anomaly scan** to detect new issues (e.g. usage vs 30-day average).

*End-to-end flow: ingest → run billing → review anomalies.*

---

## Trading & grid

- **Bilateral contracts** — Create and list contracts (counterparty, product type, volume, price, dates, status).
- **Market bids** — Day-ahead bids (market, delivery date, hour block, volume, price); placeholder for ISO/RTO integration.
- **Grid status** — View snapshots (region, frequency, load, renewables %, alerts); charts for real-time dashboards.

*Foundation for ISO connections and demand-response use cases.*

---

## Technical edge

- **Real-time** — Socket.io for live updates (usage, bills, grid); low-latency web and mobile-ready UI.
- **Protocol-ready** — Device endpoint metadata (Modbus TCP, IEC 60870, DNP3, Ethernet I/O); gateways push data via HTTP/WebSockets; no protocol stacks in the core app — scalable and vendor-agnostic.
- **SaaS-ready** — Stateless API, horizontal scaling; multi-tenant and deployment docs (RFP template, protocol integration guide).
- **Environment** — Field device specs (-10°C to 75°C, 5–95% humidity, NEMA/UL) documented for gateway procurement.

---

## Security & compliance

- **Access** — Role-based access (client vs admin/personnel); 24/7 auth with **MFA** (email OTP) for admin/personnel.
- **Data** — HTTPS and secure cookies; no PAN/card storage (payment tokens + last4 only); encryption at rest where applicable.
- **Audit** — Every sensitive action logged (login, service request, usage ingest, billing run, bill issued, contract signed, bid placed, anomaly scan).
- **Anomaly detection** — Usage spikes, unusual access; findings stored as flags and exposed to ops for review.

*Designed for PCI/GDPR narratives and utility compliance.*

---

## How it works (end-to-end)

1. **Client** logs in → sees service points, usage charts, bills → submits a service request.
2. **Operations** runs usage ingest (or receives data from gateways) → runs **billing** for a period → new bills appear for clients; reviews **anomalies** and runs **anomaly scan**.
3. **Trading** manages contracts and bids; **grid status** feeds dashboards and alerts.

*Seeded demo data supports this full flow out of the box.*

---

## Why now

- **Decarbonization and markets** — More renewables and market participation increase need for transparent usage, billing, and trading in one place.
- **Digital expectations** — B2B customers expect self-service and real-time visibility; legacy systems rarely offer both.
- **Grid edge** — IoT and protocol gateways are commoditizing; the gap is a **central platform** that ingests, bills, and exposes data securely.

---

## Demo & traction

- **Live stack** — Node/Express API + MongoDB + React SPA; JWT + refresh rotation + MFA; Socket.io for real-time.
- **Seeded scenarios** — Sample users (clients, admin, personnel), service points, usage (current month + 3 months), bills (including overdue/draft), contracts, bids, grid snapshots, device endpoints, anomalies, and audit log so you can **run the full e2e flow** in minutes.
- **Documentation** — RFP template, protocol integration guide, and seed README for evaluators and implementers.

*Ready for pilot deployment and gateway integration.*

---

## Roadmap (optional)

| Phase | Focus |
|-------|--------|
| **Now** | Customer portal, operations (billing, ingest, anomalies), trading placeholders, grid status, audit & anomaly scan |
| **Next** | Live ISO/RTO API integration for bids; payment gateway (tokenized); demand-response signals |
| **Later** | Predictive maintenance hooks; multi-tenant SaaS; additional protocols and HMI integrations |

---

## Ask

- **Pilots** — Deploy the platform for a single utility or trader; integrate one gateway (Modbus or DNP3) and validate e2e.
- **Partnerships** — Work with gateway vendors and ISOs to standardize payloads and security for portal ingestion.
- **Feedback** — Use the RFP template and docs to align with procurement and technical requirements.

---

## Contact

**Energy B2B Portal**  
Documentation: `docs/` (RFP template, protocol integration, pitch deck)  
Repo: monorepo (backend API + frontend SPA); run with `npm run dev` and `npm run seed` for full demo.

---

*Pitch deck based on system functionality. Use as a slide outline (each `---` section = one slide) or narrative for investors, partners, or procurement.*
