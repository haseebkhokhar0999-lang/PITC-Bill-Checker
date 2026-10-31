const path = require("path");
const express = require("express");
const {
  getPITCBill,
  formatOriginalBillHtml,
  validateReferenceNumber,
  getSupportedCompanies,
  COMPANIES,
} = require("./pitc-bill");
const { getHESCOBill } = require("./hesco-bill");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "public")));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

/**
 * API Info endpoint
 */
app.get("/api", (req, res) => {
  res.json({
    status: "online",
    service: "PITC Bill Checker API",
    version: "2.0.0",
    description: "Check electricity bills from all major Pakistani DISCOs",
    supportedCompanies: getSupportedCompanies(),
    endpoints: {
      checkBill:
        "/api/check-bill?refNo={reference-number}&company={company-code}",
      checkBillLegacy: "/api/check-bill?refNo={reference-number} (HESCO only)",
      companies: "/api/companies",
      health: "/health",
    },
  });
});

/**
 * Health check endpoint
 */
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get list of supported companies
 *
 * GET /api/companies
 */
app.get("/api/companies", (req, res) => {
  res.json({
    success: true,
    companies: getSupportedCompanies(),
  });
});

/**
 * Main endpoint to fetch electricity bill
 *
 * GET /api/check-bill?refNo=06113530462901&company=lesco
 *
 * @query {string} refNo - 10-14 digit reference number
 * @query {string} company - Company code (hesco, lesco, fesco, etc.) - defaults to hesco for backward compatibility
 * @returns {Object} Bill data or error
 */
app.get("/api/check-bill", async (req, res) => {
  const { refNo, company = "lesco", ruCode, includeHtml } = req.query;
  const companyCode = String(company || "lesco").toLowerCase().trim();

  // Validate reference number
  const validation = validateReferenceNumber(refNo);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.error,
    });
  }

  const effectiveRuCode = ruCode || validation.ruCode || "U";

  try {
    // 1. Fetch bill from target company
    let result = await getPITCBill(validation.refNo, companyCode, effectiveRuCode);

    // 2. If not found in target company, automatically search all other DISCOs in parallel
    if (!result.success && result.error && (
        result.error.toLowerCase().includes("not belong") || 
        result.error.toLowerCase().includes("not found") ||
        result.error.toLowerCase().includes("no bill record") ||
        result.error.toLowerCase().includes("invalid reference")
    )) {
      const otherCompanies = Object.keys(COMPANIES)
        .map((k) => k.toLowerCase())
        .filter((c) => c !== companyCode);

      const searchPromises = otherCompanies.map((c) =>
        getPITCBill(validation.refNo, c, effectiveRuCode)
          .then((r) => (r.success ? { company: c, result: r } : null))
          .catch(() => null)
      );

      const searchResults = await Promise.all(searchPromises);
      const foundMatch = searchResults.find((r) => r && r.result && r.result.success);

      if (foundMatch) {
        result = foundMatch.result;
        result.autoDiscovered = true;
        result.originalTarget = companyCode;
      }
    }

    if (result.success) {
      if (includeHtml !== "true" && result.data && result.data.rawHtml) {
        const { rawHtml, ...cleanData } = result.data;
        return res.json({
          ...result,
          data: cleanData,
        });
      }
      return res.json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * POST endpoint (alternative to GET)
 *
 * POST /api/check-bill
 * Body: { "refNo": "06113530462901", "company": "lesco" }
 */
app.post("/api/check-bill", async (req, res) => {
  const { refNo, company = "lesco", includeHtml } = req.body;
  const companyCode = String(company || "lesco").toLowerCase().trim();

  // Validate reference number
  const validation = validateReferenceNumber(refNo);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.error,
    });
  }

  try {
    // Fetch bill from PITC portal
    const result = await getPITCBill(validation.refNo, companyCode);

    if (result.success) {
      if (includeHtml !== "true" && result.data && result.data.rawHtml) {
        const { rawHtml, ...cleanData } = result.data;
        return res.json({
          ...result,
          data: cleanData,
        });
      }
      return res.json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * Original Bill HTML View & Print endpoint
 * Renders the 100% authentic PITC bill layout with company logos, barcodes, and print stylesheet
 *
 * GET /api/original-bill?refNo=06113530462901&company=lesco&autoPrint=true
 */
app.get("/api/original-bill", async (req, res) => {
  const { refNo, company = "lesco", ruCode, autoPrint, forcePaid } = req.query;
  const companyCode = String(company || "lesco").toLowerCase().trim();

  // Validate reference number
  const validation = validateReferenceNumber(refNo);
  if (!validation.valid) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Invalid Reference Number</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>Invalid Reference Number</h2>
          <p>${validation.error}</p>
          <a href="/">Return to Home</a>
        </body>
      </html>
    `);
  }

  const effectiveRuCode = ruCode || validation.ruCode || "U";

  try {
    let result = await getPITCBill(validation.refNo, companyCode, effectiveRuCode);

    // If not found in target company, try auto-discovery
    if (!result.success && result.error && (
        result.error.toLowerCase().includes("not belong") || 
        result.error.toLowerCase().includes("not found") ||
        result.error.toLowerCase().includes("no bill record") ||
        result.error.toLowerCase().includes("invalid reference")
    )) {
      const otherCompanies = Object.keys(COMPANIES)
        .map((k) => k.toLowerCase())
        .filter((c) => c !== companyCode);

      const searchPromises = otherCompanies.map((c) =>
        getPITCBill(validation.refNo, c, effectiveRuCode)
          .then((r) => (r.success ? { company: c, result: r } : null))
          .catch(() => null)
      );

      const searchResults = await Promise.all(searchPromises);
      const foundMatch = searchResults.find((r) => r && r.result && r.result.success);

      if (foundMatch) {
        result = foundMatch.result;
      }
    }

    if (!result.success || !result.data || !result.data.rawHtml) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Bill Not Found</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2>Bill Not Found</h2>
            <p>${result.error || "Could not fetch bill from distribution company portal."}</p>
            <a href="/">Return to Home</a>
          </body>
        </html>
      `);
    }

    const isPaid = forcePaid === "true" || Boolean(result.data.paymentStatus?.isPaid);
    const shouldAutoPrint = autoPrint === "true";

    const formattedHtml = formatOriginalBillHtml(
      result.data.rawHtml,
      result.companyName || companyCode.toUpperCase(),
      validation.refNo,
      isPaid,
      shouldAutoPrint
    );

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(formattedHtml);
  } catch (err) {
    console.error("Error generating original bill:", err);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Server Error</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>Server Error</h2>
          <p>${err.message}</p>
          <a href="/">Return to Home</a>
        </body>
      </html>
    `);
  }
});

// Static Information Pages
app.get("/terms", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "terms.html"));
});

app.get("/privacy", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "privacy.html"));
});

app.get("/faq", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "faq.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "about.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "contact.html"));
});

// Dedicated DISCO Pages
const discoPages = [
  "mepco-bill",
  "lesco-bill",
  "fesco-bill",
  "iesco-bill",
  "gepco-bill",
  "pesco-bill",
  "hesco-bill",
  "sepco-bill",
  "qesco-bill",
];

discoPages.forEach((page) => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, "public", `${page}.html`));
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    availableEndpoints: [
      "GET /api/check-bill?refNo={reference-number}&company={company-code}",
      "POST /api/check-bill with body: { refNo: '...', company: '...' }",
      "GET /api/companies - Get list of supported companies",
    ],
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PITC Bill Checker API server running on port ${PORT}`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api/check-bill`);
  console.log(`🏢 Supported companies: http://localhost:${PORT}/api/companies`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
