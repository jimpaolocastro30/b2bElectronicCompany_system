/**
 * Seed script: creates sample data to simulate the full end-to-end process.
 *
 * End-to-end flows you can run after seeding:
 * 1. Client: Login as acme@client.com → Portal → Service points, Usage, Bills (issued/paid/overdue), submit Service request.
 * 2. Operations: Login as personnel@b2b.example.com → Service points, Usage ingest (optional), run Billing for current month → new bills appear; Anomalies → run Anomaly scan.
 * 3. Trading: Contracts and Market bids (draft/submitted); Grid status for dashboards.
 *
 * All seed users share password: Password123!
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { connectMongo } = require("../src/lib/mongo");
const { User } = require("../src/models/User");
const { ServicePoint } = require("../src/models/ServicePoint");
const { UsageReading } = require("../src/models/UsageReading");
const { Tariff } = require("../src/models/Tariff");
const { Bill } = require("../src/models/Bill");
const { TradeContract } = require("../src/models/TradeContract");
const { MarketBid } = require("../src/models/MarketBid");
const { GridStatusSnapshot } = require("../src/models/GridStatusSnapshot");
const { DeviceEndpoint } = require("../src/models/DeviceEndpoint");
const { AnomalyFlag } = require("../src/models/AnomalyFlag");
const { AuditLog } = require("../src/models/AuditLog");

const SEED_PASSWORD = "Password123!";

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI in environment (.env)");
    process.exit(1);
  }

  await connectMongo(uri);
  console.log("[seed] Connected to MongoDB");

  // Clear existing seed data (energy portal + legacy)
  await AnomalyFlag.deleteMany({});
  await DeviceEndpoint.deleteMany({});
  await GridStatusSnapshot.deleteMany({});
  await MarketBid.deleteMany({});
  await TradeContract.deleteMany({});
  await Bill.deleteMany({});
  await UsageReading.deleteMany({});
  await ServicePoint.deleteMany({});
  await Tariff.deleteMany({});
  await AuditLog.deleteMany({});
  const { Order } = require("../src/models/Order");
  const { InventoryItem } = require("../src/models/InventoryItem");
  const { Pricing } = require("../src/models/Pricing");
  await Order.deleteMany({});
  await InventoryItem.deleteMany({});
  await Pricing.deleteMany({});
  await User.deleteMany({});
  console.log("[seed] Cleared existing seed data");

  const passwordHash = await hashPassword(SEED_PASSWORD);

  // ----- Users -----
  const admin = await User.create({
    email: "admin@b2b.example.com",
    name: "System Admin",
    role: "admin",
    passwordHash,
  });
  const personnel1 = await User.create({
    email: "personnel@b2b.example.com",
    name: "Warehouse Personnel",
    role: "personnel",
    passwordHash,
  });
  const personnel2 = await User.create({
    email: "ops@b2b.example.com",
    name: "Operations Staff",
    role: "personnel",
    passwordHash,
  });

  const clients = await User.insertMany([
    { email: "acme@client.com", name: "Acme Corp", role: "client", passwordHash },
    { email: "globex@client.com", name: "Globex Inc", role: "client", passwordHash },
    { email: "initech@client.com", name: "Initech LLC", role: "client", passwordHash },
    { email: "umbrella@client.com", name: "Umbrella Corp", role: "client", passwordHash },
    { email: "wayne@client.com", name: "Wayne Enterprises", role: "client", passwordHash },
    { email: "stark@client.com", name: "Stark Industries", role: "client", passwordHash },
  ]);

  console.log("[seed] Users created: 1 admin, 2 personnel, 6 clients");

  // ----- Tariffs -----
  await Tariff.insertMany([
    { serviceType: "power", name: "Standard Power", currency: "USD", rateType: "flat", unitPrice: 0.12, effectiveFrom: new Date() },
    { serviceType: "gas", name: "Standard Gas", currency: "USD", rateType: "flat", unitPrice: 0.08, effectiveFrom: new Date() },
    { serviceType: "water", name: "Standard Water", currency: "USD", rateType: "flat", unitPrice: 0.002, effectiveFrom: new Date() },
  ]);
  console.log("[seed] Tariffs created (power, gas, water)");

  // ----- Service points (2–3 per client) -----
  const servicePointSpecs = [];
  const clientNames = ["Acme", "Globex", "Initech", "Umbrella", "Wayne", "Stark"];
  for (let c = 0; c < clients.length; c++) {
    const types = ["power", "gas", "water"];
    for (let t = 0; t < types.length; t++) {
      servicePointSpecs.push({
        customerId: clients[c]._id,
        serviceType: types[t],
        accountNumber: `ACC-${clientNames[c].toUpperCase().slice(0, 4)}-${types[t].toUpperCase().slice(0, 1)}${t + 1}`,
        companyName: clients[c].name,
        location: { city: "Metropolis", region: "NE", country: "US" },
        meterId: `M-${clients[c]._id.toString().slice(-6)}-${types[t]}-${t + 1}`,
        contractId: `CON-${c}-${t}`,
        gridZone: c % 2 === 0 ? "NE-1" : "NE-2",
        isActive: true,
      });
    }
  }
  const servicePoints = await ServicePoint.insertMany(servicePointSpecs);
  console.log("[seed] Service points created:", servicePoints.length);

  // ----- Usage readings: current month (for billing run e2e) + previous 3 full months -----
  const now = new Date();
  const readingDocs = [];
  const tariffMap = { power: 0.12, gas: 0.08, water: 0.002 };
  const units = { power: "kWh", gas: "therms", water: "m3" };

  for (const sp of servicePoints) {
    const unit = units[sp.serviceType];
    const seed = sp._id.toString().slice(-4).replace(/\D/g, "0") || "1000";
    const baseDaily = 30 + (parseInt(seed, 16) % 40);

    // Current month: from 1st to today (so "run billing" for this period creates bills)
    const curMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    for (let d = 0; d <= now.getDate(); d++) {
      const ts = new Date(curMonthStart);
      ts.setDate(ts.getDate() + d);
      if (ts > now) break;
      ts.setHours(12, 0, 0, 0);
      const value = baseDaily + Math.floor((Math.sin(d) * 0.3 + 1) * 15);
      readingDocs.push({
        servicePointId: sp._id,
        timestamp: ts,
        value,
        unit,
        qualityFlag: "actual",
      });
    }

    // Previous 3 full months (so client sees history and bills match usage)
    for (let m = 1; m <= 3; m++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
      for (let d = 0; d < daysInMonth; d++) {
        const ts = new Date(monthStart);
        ts.setDate(ts.getDate() + d);
        ts.setHours(12, 0, 0, 0);
        const value = baseDaily + Math.floor((Math.sin(d + m) * 0.3 + 1) * 12);
        readingDocs.push({
          servicePointId: sp._id,
          timestamp: ts,
          value,
          unit,
          qualityFlag: "actual",
        });
      }
    }
  }
  await UsageReading.insertMany(readingDocs);
  console.log("[seed] Usage readings created:", readingDocs.length, "(current month + 3 months)");

  // ----- Bills: past 3 months only (NOT current month — run Billing for current month to create them) -----
  const billDocs = [];
  for (const sp of servicePoints) {
    for (let m = 1; m <= 3; m++) {
      const periodEnd = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth() - 1, 1);
      const periodReadings = readingDocs.filter(
        (r) =>
          r.servicePointId.toString() === sp._id.toString() &&
          new Date(r.timestamp) >= periodStart &&
          new Date(r.timestamp) < periodEnd
      );
      const usage = periodReadings.length ? periodReadings.reduce((s, r) => s + r.value, 0) : 800 + Math.floor(Math.random() * 400);
      const unitPrice = tariffMap[sp.serviceType];
      const amount = Math.round(usage * unitPrice * 100) / 100;
      const isFirstClient = sp.customerId.toString() === clients[0]._id.toString();
      const isSecondClient = sp.customerId.toString() === clients[1]._id.toString();
      let status = "issued";
      let paidAt = null;
      if (m >= 2) status = "paid";
      paidAt = m >= 2 ? new Date(periodEnd.getTime() + 86400000 * 14) : null;
      if (m === 1 && isFirstClient) status = "overdue";
      if (m === 1 && isSecondClient && sp.serviceType === "power") status = "draft";
      billDocs.push({
        customerId: sp.customerId,
        servicePointId: sp._id,
        periodStart,
        periodEnd,
        services: [{ serviceType: sp.serviceType, usage, unit: units[sp.serviceType], unitPrice, amount }],
        totalAmount: amount,
        currency: "USD",
        status,
        issuedAt: status === "draft" ? null : periodEnd,
        paidAt,
      });
    }
  }
  const insertedBills = await Bill.insertMany(billDocs);
  console.log("[seed] Bills created:", insertedBills.length, "(past 3 months; run Billing for current month to demo e2e)");

  // ----- Trade contracts -----
  const contractDocs = [
    { counterpartyName: "North Power Co", productType: "base-load", volume: 100, price: 45, currency: "USD", startDate: new Date(now.getTime() - 60 * 86400000), endDate: new Date(now.getTime() + 300 * 86400000), status: "active" },
    { counterpartyName: "Peak Energy LLC", productType: "peak", volume: 50, price: 72, currency: "USD", startDate: new Date(now.getTime() - 30 * 86400000), endDate: new Date(now.getTime() + 90 * 86400000), status: "active" },
    { counterpartyName: "Green Grid Inc", productType: "renewable", volume: 200, price: 38, currency: "USD", startDate: new Date(now.getTime() - 90 * 86400000), endDate: new Date(now.getTime() + 180 * 86400000), status: "active" },
  ];
  await TradeContract.insertMany(contractDocs);
  console.log("[seed] Trade contracts created:", contractDocs.length);

  // ----- Market bids -----
  const bidDocs = [];
  for (let i = 0; i < 10; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    bidDocs.push({
      market: "ISO-NE",
      deliveryDate: d,
      hourBlock: "1-24",
      volume: 20 + Math.floor(Math.random() * 80),
      price: 40 + Math.random() * 40,
      currency: "USD",
      status: i % 3 === 0 ? "submitted" : "draft",
    });
  }
  await MarketBid.insertMany(bidDocs);
  console.log("[seed] Market bids created:", bidDocs.length);

  // ----- Grid status snapshots -----
  const gridDocs = [];
  for (let i = 0; i < 72; i++) {
    const ts = new Date(now);
    ts.setHours(ts.getHours() - i, 0, 0, 0);
    gridDocs.push({
      timestamp: ts,
      region: i % 2 === 0 ? "NE-1" : "NE-2",
      frequency: 59.98 + Math.random() * 0.04,
      load: 12000 + Math.floor(Math.random() * 4000),
      renewablesShare: 25 + Math.floor(Math.random() * 30),
      alerts: i % 10 === 0 ? ["Low reserve"] : [],
    });
  }
  await GridStatusSnapshot.insertMany(gridDocs);
  console.log("[seed] Grid status snapshots created:", gridDocs.length);

  // ----- Device endpoints (for protocol integration story) -----
  await DeviceEndpoint.insertMany([
    { servicePointId: servicePoints[0]._id, protocol: "ModbusTCP", host: "192.168.1.10", port: 502, unitId: 1, lastSeenAt: new Date(), status: "online" },
    { servicePointId: servicePoints[1]._id, protocol: "DNP3", gridZone: "NE-1", rtuAddress: "1", lastSeenAt: new Date(now.getTime() - 3600000), status: "online" },
    { gridZone: "NE-2", protocol: "IEC60870", host: "10.0.0.5", port: 2404, lastSeenAt: new Date(), status: "online" },
  ]);
  console.log("[seed] Device endpoints created (3)");

  // ----- Anomaly flags (so Anomalies page and scan have data) -----
  await AnomalyFlag.insertMany([
    { relatedType: "usage", relatedId: String(servicePoints[0]._id), detectedAt: new Date(now.getTime() - 2 * 86400000), severity: "medium", description: "Usage spike vs 30-day average", resolvedAt: null },
    { relatedType: "access", relatedId: "login", detectedAt: new Date(now.getTime() - 5 * 86400000), severity: "low", description: "Unusual login hour", resolvedAt: null },
    { relatedType: "billing", relatedId: "overdue", detectedAt: new Date(now.getTime() - 10 * 86400000), severity: "low", description: "Overdue bill for account ACC-ACME-P1", resolvedAt: null },
  ]);
  console.log("[seed] Anomaly flags created");

  // ----- Audit log (full e2e story: login, service request, ingest, billing, trading, anomaly scan) -----
  const firstContract = await TradeContract.findOne();
  const firstBid = await MarketBid.findOne();
  await AuditLog.insertMany([
    { actorId: clients[0]._id, action: "portal.login", target: "", meta: {} },
    { actorId: clients[0]._id, action: "portal.service_request", target: "", meta: { type: "Meter reading question", preferredDate: null } },
    { actorId: personnel1._id, action: "usage.ingest", target: "", meta: { count: 45 } },
    { actorId: personnel1._id, action: "billing.run", target: "", meta: { periodStart: new Date(now.getFullYear(), now.getMonth() - 2, 1), periodEnd: new Date(now.getFullYear(), now.getMonth() - 1, 0), billsCreated: 18 } },
    { actorId: admin._id, action: "billing.bill_issued", target: insertedBills[0] ? String(insertedBills[0]._id) : "", meta: { serviceType: "power", totalAmount: 120 } },
    { actorId: admin._id, action: "trading.contract_signed", target: firstContract ? String(firstContract._id) : "", meta: { counterpartyName: "North Power Co" } },
    { actorId: personnel2._id, action: "trading.bid_placed", target: firstBid ? String(firstBid._id) : "", meta: { market: "ISO-NE" } },
    { actorId: admin._id, action: "security.anomaly_scan", target: "", meta: { flagsCreated: 2 } },
  ]);
  console.log("[seed] Audit log entries created (e2e flow)");

  console.log("\n[seed] Done. Sample credentials (password for all):", SEED_PASSWORD);
  console.log("  Admin:     admin@b2b.example.com");
  console.log("  Personnel: personnel@b2b.example.com, ops@b2b.example.com");
  console.log("  Clients:   acme@client.com, globex@client.com, initech@client.com, umbrella@client.com, wayne@client.com, stark@client.com");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("[seed] Error:", err);
  process.exit(1);
});
