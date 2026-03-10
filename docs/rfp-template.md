# RFP Template: Energy B2B Portal & Grid Integration

## 1. Company background

We operate a **B2B energy and utilities SaaS platform** for wholesale energy trading, multi-utility (power, gas, water) customer self-service, and grid integration. Our system supports day-ahead market bids, bilateral contracts, real-time ISO/grid status, and ERP/CRM integrations for inventory, pricing, and orders. We require secure, scalable solutions that align with industry protocols and compliance (PCI/GDPR, NEMA/UL where applicable).

---

## 2. Project scope

- **B2B portal integration**: Customer self-service for account management, service requests, and usage monitoring; multi-service billing (power, gas, water).
- **Energy trading**: Day-ahead market bids, bilateral contracts, and real-time ISO connections for grid status.
- **Operations**: ERP/CRM integrations, usage ingest from IoT/meters, billing runs, and predictive maintenance / demand response foundations.
- **Security & compliance**: Role-based access, encryption, audit logs, anomaly detection, 24/7 authentication.

---

## 3. Technical requirements

### 3.1 Grid and field integration

- Support for **Modbus TCP**, **IEC 60870**, **DNP3**, and **Ethernet/RS485 I/O** for grid integration and data logging.
- Data flow: field devices / gateways push or expose data; backend consumes via HTTP/WebSocket or dedicated protocol adapters (edge services). This RFP assumes gateway/edge components handle protocol stacks; the central platform receives structured payloads (e.g. usage, grid snapshots).

### 3.2 Application and deployment

- **Web**: Low-latency web interfaces (e.g. HMI, Power Pages) with mobile access.
- **Real-time analytics**: Live dashboards, usage charts, grid status, and alerting (e.g. Socket.io or equivalent).
- **SaaS**: Multi-tenant readiness, horizontal scalability, and clear deployment and ops documentation.

### 3.3 Environment (field devices)

- **Operating environment** (for gateway/devices in the field): **-10°C to 75°C**, **5–95% humidity**.
- **Compliance**: NEMA/UL standards as applicable to hardware and enclosures. (Application servers are standard data-center or cloud.)

---

## 4. Security and compliance

- **Access control**: Role-based access (RBAC); 24/7 authentication with MFA (e.g. email OTP) for admin/personnel.
- **Data**: Encryption in transit (HTTPS) and at rest; no storage of PAN/card data; use of payment tokens and last4 only.
- **Audit**: Full audit logs for auth, billing, trading, and data access; anomaly detection (usage spikes, unusual access) with flags and review workflows.
- **Compliance**: PCI and GDPR considerations for financial and PII data; vendor must describe how their solution supports these.

---

## 5. Timelines and evaluation criteria

| Criterion            | Weight | Notes                                                |
|----------------------|--------|------------------------------------------------------|
| Technical fit        | 30%    | Protocols, APIs, scalability, real-time capability   |
| Security & compliance| 25%    | RBAC, encryption, audit, anomaly detection           |
| Delivery timeline    | 20%    | Phased delivery and milestones                       |
| Cost and licensing   | 15%    | TCO, SaaS vs on-prem, support                        |
| References & experience | 10% | Similar energy/utility or B2B portal projects       |

**Suggested timeline**: Define phases (e.g. discovery, MVP portal + one protocol, full trading and grid integration, hardening) with milestones and go-live targets.

---

*This template can be used as the basis for vendor RFPs. Adjust sections and weights to match your procurement process.*
