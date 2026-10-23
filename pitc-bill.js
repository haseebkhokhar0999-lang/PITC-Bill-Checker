const axios = require("axios");
const cheerio = require("cheerio");
const { HttpsProxyAgent } = require("https-proxy-agent");

/**
 * Supported electricity companies in Pakistan
 */
const COMPANIES = {
  HESCO: {
    name: "Hyderabad Electric Supply Company",
    code: "hesco",
    url: "https://bill.pitc.com.pk/hescobill",
    refPattern: /^\d{10,14}$/,
  },
  LESCO: {
    name: "Lahore Electric Supply Company",
    code: "lesco",
    url: "https://bill.pitc.com.pk/lescobill",
    refPattern: /^\d{10,14}$/,
  },
  FESCO: {
    name: "Faisalabad Electric Supply Company",
    code: "fesco",
    url: "https://bill.pitc.com.pk/fescobill",
    refPattern: /^\d{10,14}$/,
  },
  IESCO: {
    name: "Islamabad Electric Supply Company",
    code: "iesco",
    url: "https://bill.pitc.com.pk/iescobill",
    refPattern: /^\d{10,14}$/,
  },
  MEPCO: {
    name: "Multan Electric Power Company",
    code: "mepco",
    url: "https://bill.pitc.com.pk/mepcobill",
    refPattern: /^\d{10,14}$/,
  },
  GEPCO: {
    name: "Gujranwala Electric Power Company",
    code: "gepco",
    url: "https://bill.pitc.com.pk/gepcobill",
    refPattern: /^\d{10,14}$/,
  },
  PESCO: {
    name: "Peshawar Electric Supply Company",
    code: "pesco",
    url: "https://bill.pitc.com.pk/pescobill",
    refPattern: /^\d{10,14}$/,
  },
  QESCO: {
    name: "Quetta Electric Supply Company",
    code: "qesco",
    url: "https://bill.pitc.com.pk/qescobill",
    refPattern: /^\d{10,14}$/,
  },
  SEPCO: {
    name: "Sukkur Electric Power Company",
    code: "sepco",
    url: "https://bill.pitc.com.pk/sepcobill",
    refPattern: /^\d{10,14}$/,
  },
};

// =============================================================================
// Live PITC CCMS Real-Time Payment Verification System
// =============================================================================
let cachedCCMSCookie = null;
let ccmsCookieExpiry = 0;

/**
 * Retrieves and caches a valid session cookie from PITC CCMS portal
 */
async function getCCMSCookie() {
  const now = Date.now();
  if (cachedCCMSCookie && now < ccmsCookieExpiry) {
    return cachedCCMSCookie;
  }
  try {
    const res = await axios.get("https://ccms.pitc.com.pk/complaint", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      timeout: 5000,
    });
    const setCookie = res.headers["set-cookie"];
    if (setCookie && setCookie.length > 0) {
      cachedCCMSCookie = setCookie.map((c) => c.split(";")[0]).join("; ");
      ccmsCookieExpiry = now + 15 * 60 * 1000; // 15 mins cache
      return cachedCCMSCookie;
    }
  } catch (err) {
    // Continue with empty cookie on network error
  }
  return "";
}

/**
 * Multi-layer payment status verification:
 * 1. PITC CCMS Live API verification (Official real-time bank clearance feed)
 * 2. Exact current billing month payment recorded in history table (Exact Month & Year match)
 * 3. Watermark logo & official stamped marks (.bill-payment-logo)
 * 4. Zero payable with active current charges
 * 5. Barcode PAID status indicators
 */
async function verifyPaymentStatus(refNo, billData, $result) {
  let isPaid = false;
  let paymentDate = "";
  let amountPaid = 0;
  let source = "STATIC_ANALYSIS";

  // Layer 1: Check Official PITC CCMS API (Live Bank Settlement Feed)
  try {
    const cookie = await getCCMSCookie();
    const cleanRef = String(refNo).replace(/[^0-9]/g, "");
    const res = await axios.get(
      `https://ccms.pitc.com.pk/api/details/bill?reference=${cleanRef}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://ccms.pitc.com.pk/complaint",
          "X-Requested-With": "XMLHttpRequest",
          Cookie: cookie || "",
        },
        timeout: 5000,
      }
    );

    if (res.data && res.data.bill && res.data.bill.basicInfo) {
      const basic = res.data.bill.basicInfo;
      const hist = res.data.bill.histInfo || {};

      const currPayment = Number(
        String(basic.currMonthPayment || "0").replace(/[^0-9.]/g, "")
      );
      const netAfter = Number(
        String(basic.netBillAfterPayment || "").replace(/[^0-9.]/g, "")
      );
      const netBill = Number(
        String(basic.netBill || "0").replace(/[^0-9.]/g, "")
      );
      const pDate = basic.curMonthPaymentDate
        ? String(basic.curMonthPaymentDate).trim()
        : "";
      const p13 = Number(
        String(hist.payment13 || "0").replace(/[^0-9.]/g, "")
      );

      // If bank settlement cleared or payment recorded
      if (
        currPayment > 0 ||
        (netBill > 0 && netAfter === 0) ||
        Boolean(pDate) ||
        (p13 > 0 && p13 >= netBill)
      ) {
        isPaid = true;
        paymentDate = pDate || "Online Verified";
        amountPaid = currPayment > 0 ? currPayment : netBill;
        source = "PITC_CCMS_LIVE";
      }
    }
  } catch (err) {
    // CCMS fallback continues below
  }

  // Layer 2: Check Bill History Table for current billing month match (Exact Month & Year)
  if (!isPaid && billData.billDetails?.billMonth && billData.history?.length) {
    const curMonthNorm = billData.billDetails.billMonth
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    for (const h of billData.history) {
      const hMonthNorm = String(h.month || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
      if (hMonthNorm === curMonthNorm && Number(h.paymentAmount) > 0) {
        isPaid = true;
        amountPaid = Number(h.paymentAmount);
        source = "BILL_HISTORY_CURRENT_MONTH";
        break;
      }
    }
  }

  // Layer 3: Official PITC payment watermark element
  if (!isPaid && $result) {
    if ($result(".bill-payment-logo").length > 0) {
      isPaid = true;
      source = "PITC_WATERMARK_LOGO";
    }
  }

  // Layer 4: Explicit paid text in the page
  if (!isPaid && $result) {
    const rawText = $result("body").text().replace(/\s+/g, " ");
    if (
      /\b(bill\s+paid|payment\s+received|paid\s+online|paid\s+at\s+bank|cleared\s+by\s+bank)\b/i.test(
        rawText
      )
    ) {
      isPaid = true;
      source = "EXPLICIT_PAID_TEXT";
    }
  }

  // Layer 5: Current payable amount is 0 while electricity charges were billed
  if (!isPaid && billData.charges) {
    const payableNum = Number(
      String(billData.charges.payableWithinDueDate || "").replace(/[^0-9.]/g, "")
    );
    const chargesNum = Number(
      String(
        billData.charges.electricityCharges || billData.charges.totalAmount || ""
      ).replace(/[^0-9.]/g, "")
    );
    if (chargesNum > 0 && payableNum === 0) {
      isPaid = true;
      source = "ZERO_PAYABLE_CLEARED";
    }
  }

  // Layer 6: Barcode caption contains PAID status
  if (!isPaid && billData.billDetails?.barcodeText) {
    const barcodeText = String(billData.billDetails.barcodeText).toUpperCase();
    if (barcodeText.includes("PAID")) {
      isPaid = true;
      source = "BARCODE_PAID_STATUS";
    }
  }

  return {
    isPaid: Boolean(isPaid),
    status: isPaid ? "PAID" : "UNPAID",
    statusUrdu: isPaid ? "ادا شدہ" : "غیر ادا شدہ",
    paymentDate: paymentDate,
    amountPaid: amountPaid,
    source: source,
    paidWatermark: isPaid,
    payableAmount:
      billData.charges?.payableWithinDueDate ||
      billData.charges?.totalAmount ||
      "0",
    dueDate: billData.billDetails?.dueDate || "N/A",
  };
}

/**
 * Fetches electricity bill from PITC portal for any supported company
 *
 * @param {string} refNo - 10-14 digit reference number from electricity bill
 * @param {string} companyCode - Company code (hesco, lesco, fesco, etc.)
 * @returns {Promise<Object>} Bill data or error
 *
 * @example
 * const result = await getPITCBill("06113530462901", "lesco");
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 */
async function getPITCBill(refNo, companyCode, ruCode = "U") {
  try {
    // Validate company
    const company = getCompanyByCode(companyCode);
    if (!company) {
      return {
        success: false,
        error: `Invalid company code. Supported: ${Object.keys(COMPANIES)
          .map((k) => k.toLowerCase())
          .join(", ")}`,
      };
    }

    const baseUrl = company.url;

    // -------------------------------------------------------------------------
    // Configure proxy if PROXY_URL environment variable is set
    // This helps bypass geo-restrictions when deploying outside Pakistan
    // -------------------------------------------------------------------------
    const proxyUrl = process.env.PROXY_URL;
    const axiosConfig = {
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    };

    // Add proxy agent if proxy URL is configured
    if (proxyUrl) {
      axiosConfig.httpsAgent = new HttpsProxyAgent(proxyUrl);
      axiosConfig.proxy = false; // Disable axios default proxy handling
    }

    // -------------------------------------------------------------------------
    // STEP 1: Fetch the page to extract ViewState tokens
    // ASP.NET WebForms requires these tokens for form submission
    // -------------------------------------------------------------------------
    const getResponse = await axios.get(baseUrl, axiosConfig);

    // -------------------------------------------------------------------------
    // STEP 2: Parse HTML and extract hidden fields required for form submission
    // -------------------------------------------------------------------------
    const $ = cheerio.load(getResponse.data);

    const viewState = $("#__VIEWSTATE").val();
    const viewStateGenerator = $("#__VIEWSTATEGENERATOR").val();
    const eventValidation = $("#__EVENTVALIDATION").val();
    const requestVerificationToken = $(
      'input[name="__RequestVerificationToken"]'
    ).val();

    // Validate tokens were extracted
    if (!viewState || !viewStateGenerator || !eventValidation) {
      return {
        success: false,
        error: "Failed to extract required tokens from PITC portal",
      };
    }

    // -------------------------------------------------------------------------
    // STEP 3: Submit form with reference number and all required tokens
    // -------------------------------------------------------------------------
    // PITC ASP.NET form uses value '' for Urban (U) and value 'R' for Rural (R)
    const effectiveRuValue =
      ruCode && String(ruCode).trim().toUpperCase() === "R" ? "R" : "";

    const formData = new URLSearchParams({
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: viewState,
      __VIEWSTATEGENERATOR: viewStateGenerator,
      __EVENTVALIDATION: eventValidation,
      __RequestVerificationToken: requestVerificationToken || "",
      rbSearchByList: "refno",
      searchTextBox: refNo,
      ruCodeTextBox: effectiveRuValue,
      btnSearch: "Search",
    });

    const postConfig = {
      timeout: 30000,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Referer: baseUrl,
        Cookie: getResponse.headers["set-cookie"]?.join("; ") || "",
      },
      maxRedirects: 5,
    };

    // Add proxy agent for POST request too
    if (proxyUrl) {
      postConfig.httpsAgent = new HttpsProxyAgent(proxyUrl);
      postConfig.proxy = false;
    }

    const postResponse = await axios.post(baseUrl, formData.toString(), postConfig);

    // -------------------------------------------------------------------------
    // STEP 4: Parse the response and check for errors or maintenance
    // -------------------------------------------------------------------------
    if (postResponse.data.includes("Website Under Maintenance")) {
      return {
        success: false,
        error: `${company.name} portal is currently under maintenance or temporarily unavailable.`,
        refNo: refNo,
        company: company.code,
      };
    }

    const $result = cheerio.load(postResponse.data);

    // Check for error message in div#ua
    const errorDiv = $result("#ua").text().trim();
    if (errorDiv) {
      return {
        success: false,
        error: errorDiv,
        refNo: refNo,
        company: company.code,
      };
    }

    // -------------------------------------------------------------------------
    // STEP 5: Parse bill details, payment status, and validate content
    // -------------------------------------------------------------------------
    const billData = parseBillDetails($result, refNo, company.code);

    const hasValidData =
      Boolean(billData.consumerDetails?.name) ||
      Boolean(billData.consumerDetails?.customerId) ||
      Boolean(billData.charges?.payableWithinDueDate) ||
      Boolean(billData.charges?.totalAmount) ||
      Boolean(billData.billDetails?.dueDate);

    if (!hasValidData) {
      return {
        success: false,
        error: `No bill record found for reference number ${refNo} in ${company.name}.`,
        refNo: refNo,
        company: company.code,
      };
    }

    // Attach rawHtml for original bill printing / viewing
    billData.rawHtml = postResponse.data;

    // Multi-layer payment status verification (PITC CCMS Live bank feed + document analysis)
    billData.paymentStatus = await verifyPaymentStatus(refNo, billData, $result);

    return {
      success: true,
      refNo: refNo,
      company: company.code,
      companyName: company.name,
      data: billData,
    };
  } catch (error) {
    // Handle specific error types
    if (
      error.code === "ECONNABORTED" ||
      error.code === "UND_ERR_CONNECT_TIMEOUT"
    ) {
      return {
        success: false,
        error: "Connection timeout - PITC server may be geo-restricted or down",
      };
    }

    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      return {
        success: false,
        error: "Unable to connect to PITC server",
      };
    }

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Parses bill details from the HTML response
 *
 * @param {CheerioStatic} $ - Cheerio object loaded with HTML
 * @param {string} refNo - Reference number
 * @param {string} companyCode - Company code
 * @returns {Object} Parsed bill data
 *
 * Note: This function extracts specific fields from the bill HTML.
 * The selectors may need adjustment based on actual bill structure.
 */
function parseBillDetails($, refNo, companyCode) {
  // Initialize bill data object
  const billData = {
    referenceNumber: refNo,
    company: companyCode,
    consumerDetails: {},
    billDetails: {},
    charges: {},
    history: [],
    rawHtml: null,
  };

  try {
    // -------------------------------------------------------------------------
    // 1. Modern PITC Portal Layout (Grid & Class-based structure)
    // -------------------------------------------------------------------------
    // Label-row and adjacent value pairs
    $(".label-row, .right-panel-label-row").each((index, element) => {
      const enLabel = $(element)
        .find(".en-lbl, .right-panel-en")
        .first()
        .text()
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();
      const val = $(element).next().text().replace(/\s+/g, " ").trim();

      if (!enLabel || !val) return;

      if (enLabel.includes("CONSUMER ID")) {
        billData.consumerDetails.customerId = val;
      } else if (enLabel.includes("FEEDER")) {
        billData.consumerDetails.feeder = val;
      } else if (enLabel.includes("SUB DIVISION")) {
        billData.consumerDetails.subDivision = val;
      } else if (enLabel.includes("CATEGORY") && !enLabel.includes("TARIFF")) {
        billData.consumerDetails.category = val;
      } else if (enLabel.includes("TARIFF CATEGORY")) {
        billData.consumerDetails.tariffCategory = val;
      } else if (enLabel.includes("SAN LOAD")) {
        billData.consumerDetails.sanctionedLoad = val;
      } else if (enLabel.includes("TARIFF") && !enLabel.includes("CATEGORY")) {
        billData.billDetails.tariff = val;
      } else if (enLabel.includes("METER NO")) {
        billData.billDetails.meterNo = val;
      } else if (enLabel.includes("MF")) {
        billData.billDetails.multiplyingFactor = val;
      } else if (enLabel.includes("PREVIOUS READING")) {
        billData.billDetails.previousReading = val;
      } else if (enLabel.includes("PRESENT READING")) {
        billData.billDetails.presentReading = val;
      } else if (enLabel.includes("UNITS")) {
        billData.billDetails.unitsConsumed = val;
      } else if (enLabel.includes("BILL MONTH")) {
        billData.billDetails.billMonth = val;
      } else if (enLabel.includes("DUE DATE")) {
        billData.billDetails.dueDate = val;
      }
    });

    // Name & Address
    const nameAddr = $(".val-space--address").text().replace(/\s+/g, " ").trim();
    if (nameAddr) {
      billData.consumerDetails.nameAndAddress = nameAddr;
      const parts = nameAddr.split(",");
      billData.consumerDetails.name = parts[0].trim();
      if (parts.length > 1) {
        billData.consumerDetails.address = parts.slice(1).join(",").trim();
      }
    }

    // Reading Date & Issue Date from date cells
    $(".right-grid-cell").each((index, element) => {
      const lbl = $(element).find(".right-panel-en").text().trim().toUpperCase();
      const val = $(element).find(".right-panel-date-val").text().trim();
      if (lbl.includes("READING DATE") && val) {
        billData.billDetails.readingDate = val;
      } else if (lbl.includes("ISSUE DATE") && val) {
        billData.billDetails.issueDate = val;
      }
    });

    // Due Date fallback
    const dueDateVal = $(".right-main-val--due").text().replace(/\s+/g, " ").trim();
    if (dueDateVal && !billData.billDetails.dueDate) {
      billData.billDetails.dueDate = dueDateVal;
    }

    // Charges breakdown from modern breakdown rows
    $(".charges-bd-row").each((index, element) => {
      const label = $(element)
        .find(".charges-bd-en")
        .text()
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
      const val = $(element).find(".charges-bd-val").text().replace(/\s+/g, " ").trim();
      if (label && val) {
        if (label.includes("total electricity charges")) {
          billData.charges.electricityCharges = val;
        } else if (label.includes("subsidies")) {
          billData.charges.subsidies = val;
        } else if (label.includes("net electricity charges")) {
          billData.charges.netElectricityCharges = val;
        } else if (label.includes("taxes")) {
          billData.charges.taxes = val;
        } else if (label.includes("current bill")) {
          billData.charges.currentBill = val;
        } else if (label.includes("arrears")) {
          billData.charges.arrears = val;
        } else if (label.includes("installment")) {
          billData.charges.installment = val;
        } else if (label.includes("total fpa")) {
          billData.charges.fpa = val;
        } else if (label.includes("grand total")) {
          billData.charges.totalAmount = val;
        }
      }
    });

    // Payable amounts
    const payableWithin = $(".payable-card-amount").first().text().replace(/\s+/g, " ").trim();
    if (payableWithin) {
      billData.charges.payableWithinDueDate = payableWithin;
      if (!billData.charges.totalAmount) {
        billData.charges.totalAmount = payableWithin;
      }
    }

    // Late payment surcharge and amount after due date
    const lateSurcharge = $(".lp-surcharge-top-val").first().text().replace(/\s+/g, " ").trim();
    if (lateSurcharge) {
      billData.charges.lateSurcharge = lateSurcharge;
    }

    const afterDue = $(".lp-surcharge-bottom-val").first().text().replace(/\s+/g, " ").trim();
    if (afterDue) {
      billData.charges.amountAfterDueDate = afterDue;
    }

    // 12-Month History Extraction
    $(".history-row").each((index, element) => {
      const cells = $(element).find(".history-cell");
      if (cells.length >= 5) {
        const month = $(cells[0]).text().trim();
        const status = $(cells[1]).text().trim();
        const units = $(cells[2]).text().trim();
        const billAmount = $(cells[3]).text().trim();
        const paymentAmount = $(cells[4]).text().trim();
        if (month) {
          billData.history.push({
            month,
            status,
            units: Number(units) || 0,
            billAmount: Number(billAmount) || 0,
            paymentAmount: Number(paymentAmount) || 0,
          });
        }
      }
    });

    // Barcode Caption
    const barcodeText = $(".barcode-caption").first().text().trim();
    if (barcodeText) {
      billData.billDetails.barcodeText = barcodeText;
    }

    // -------------------------------------------------------------------------
    // 2. Legacy Table Format (Fallback for older DISCO pages)
    // -------------------------------------------------------------------------
    const tableRows = $("table tr");
    tableRows.each((index, element) => {
      const cells = $(element).find("td");
      if (cells.length >= 2) {
        const label = $(cells[0]).text().trim().toLowerCase();
        const value = $(cells[1]).text().trim();

        if ((label.includes("consumer") || label.includes("name")) && !billData.consumerDetails.name) {
          billData.consumerDetails.name = value;
        } else if (label.includes("address") && !billData.consumerDetails.address) {
          billData.consumerDetails.address = value;
        } else if ((label.includes("customer") || label.includes("id")) && !billData.consumerDetails.customerId) {
          billData.consumerDetails.customerId = value;
        } else if (label.includes("tariff") && !billData.billDetails.tariff) {
          billData.billDetails.tariff = value;
        } else if (label.includes("due date") && !billData.billDetails.dueDate) {
          billData.billDetails.dueDate = value;
        } else if ((label.includes("issue date") || label.includes("bill date")) && !billData.billDetails.issueDate) {
          billData.billDetails.issueDate = value;
        } else if (label.includes("reading date") && !billData.billDetails.readingDate) {
          billData.billDetails.readingDate = value;
        } else if (label.includes("current reading") && !billData.billDetails.currentReading) {
          billData.billDetails.currentReading = value;
        } else if (label.includes("previous reading") && !billData.billDetails.previousReading) {
          billData.billDetails.previousReading = value;
        } else if ((label.includes("units") || label.includes("consumption")) && !billData.billDetails.unitsConsumed) {
          billData.billDetails.unitsConsumed = value;
        } else if ((label.includes("amount payable") || label.includes("total amount")) && !billData.charges.totalAmount) {
          billData.charges.totalAmount = value;
        } else if (label.includes("after due date") && !billData.charges.amountAfterDueDate) {
          billData.charges.amountAfterDueDate = value;
        } else if (label.includes("electricity charges") && !billData.charges.electricityCharges) {
          billData.charges.electricityCharges = value;
        } else if ((label.includes("gst") || label.includes("tax")) && !billData.charges.gst) {
          billData.charges.gst = value;
        }
      }
    });

    // General fallback for displayAmount
    if (!billData.charges.totalAmount) {
      const billAmountElement = $('[id*="amount"], [class*="amount"]').first();
      if (billAmountElement.length) {
        billData.charges.displayAmount = billAmountElement.text().trim();
      }
    }

    // Store raw HTML for debugging or manual parsing
    billData.rawHtml = $.html();
  } catch (parseError) {
    console.error("Error parsing bill details:", parseError.message);
    billData.parseError = parseError.message;
  }

  return billData;
}

/**
 * Validates reference number format
 *
 * @param {string} refNo - Reference number to validate
 * @returns {Object} Validation result
 */
function validateReferenceNumber(refNo) {
  if (!refNo) {
    return {
      valid: false,
      error: "Reference number is required",
    };
  }

  // Sanitize: uppercase, strip spaces and hyphens
  const rawStr = String(refNo).trim().toUpperCase();
  let ruCode = "U";
  if (rawStr.endsWith("R")) {
    ruCode = "R";
  } else if (rawStr.endsWith("U")) {
    ruCode = "U";
  }

  // Extract all digits
  const digitsOnly = rawStr.replace(/\D/g, "");

  if (digitsOnly.length < 10 || digitsOnly.length > 14) {
    return {
      valid: false,
      error: "Reference number must be 10-14 digits (e.g. 06113530462901)",
    };
  }

  return {
    valid: true,
    refNo: digitsOnly,
    ruCode: ruCode,
  };
}

/**
 * Gets company object by code (case-insensitive)
 *
 * @param {string} code - Company code (hesco, lesco, etc.)
 * @returns {Object|null} Company object or null if not found
 */
function getCompanyByCode(code) {
  const upperCode = code.toUpperCase();
  return COMPANIES[upperCode] || null;
}

/**
 * Gets list of all supported companies
 *
 * @returns {Array<Object>} Array of company objects
 */
function getSupportedCompanies() {
  return Object.keys(COMPANIES).map((key) => ({
    code: COMPANIES[key].code,
    name: COMPANIES[key].name,
  }));
}

/**
 * Formats original PITC HTML with base href, print toolbar, and optional paid watermark
 *
 * @param {string} rawHtml - Original HTML from PITC
 * @param {string} companyName - Full company name (e.g. Lahore Electric Supply Company)
 * @param {string} refNo - Reference number
 * @param {boolean} isPaid - Payment status flag
 * @param {boolean} autoPrint - Whether to auto-trigger window.print()
 * @returns {string} Formatted HTML ready to view/print
 */
function formatOriginalBillHtml(rawHtml, companyName = 'Electricity Distribution Company', refNo = '', isPaid = false, autoPrint = false) {
  let html = rawHtml || '';

  // 1. Remove disable inspect element script
  html = html.replace(/<script[^>]*disable_inspect_element\.js[^>]*><\/script>/gi, '');

  // 2. Inject base href and print helper styles
  const baseAndStyles = `
    <base href="https://bill.pitc.com.pk/">
    <style>
      /* Top Print Toolbar (Hidden during print) */
      .original-bill-toolbar {
        background: #0f172a;
        color: #ffffff;
        padding: 10px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        position: sticky;
        top: 0;
        z-index: 99999;
      }
      .toolbar-left {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .toolbar-back-btn {
        background: rgba(255, 255, 255, 0.15);
        color: #ffffff;
        text-decoration: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        transition: background 0.15s;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .toolbar-back-btn:hover {
        background: rgba(255, 255, 255, 0.25);
      }
      .toolbar-title {
        font-size: 14px;
        font-weight: 700;
      }
      .toolbar-status {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .toolbar-status.paid {
        background: #059669;
        color: #ffffff;
      }
      .toolbar-status.unpaid {
        background: #d97706;
        color: #ffffff;
      }
      .toolbar-right {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .toolbar-print-btn {
        background: #0066ff;
        color: #ffffff;
        border: none;
        padding: 8px 18px;
        border-radius: 6px;
        font-size: 13.5px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: background 0.15s;
      }
      .toolbar-print-btn:hover {
        background: #0052cc;
      }
      
      /* OFFICIAL PAID WATERMARK */
      .official-paid-watermark {
        position: fixed;
        top: 48%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-25deg);
        border: 6px double #16a34a;
        color: #16a34a;
        padding: 12px 36px;
        font-family: 'Arial Black', Impact, sans-serif;
        font-size: 52px;
        font-weight: 900;
        letter-spacing: 5px;
        text-transform: uppercase;
        border-radius: 14px;
        opacity: 0.85;
        pointer-events: none;
        z-index: 9999;
        background: rgba(255, 255, 255, 0.7);
        text-shadow: 1px 1px 0 rgba(22, 163, 74, 0.2);
        box-shadow: 0 0 20px rgba(22, 163, 74, 0.15);
      }
      .official-paid-watermark .sub {
        font-size: 16px;
        letter-spacing: 2px;
        display: block;
        text-align: center;
        margin-top: -4px;
        font-weight: 700;
      }

      @media print {
        .original-bill-toolbar, .noprint {
          display: none !important;
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
        }
        .gbn-app-shell {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      }
    </style>
    ${autoPrint ? '<script>window.addEventListener("load", function() { setTimeout(function() { window.print(); }, 400); });</script>' : ''}
  `;

  if (html.includes('<head>')) {
    html = html.replace('<head>', `<head>${baseAndStyles}`);
  } else {
    html = `${baseAndStyles}${html}`;
  }

  // 3. Toolbar HTML
  const toolbarHtml = `
    <div class="original-bill-toolbar noprint">
      <div class="toolbar-left">
        <a href="/" class="toolbar-back-btn">&larr; Back to App</a>
        <span class="toolbar-title">${companyName} Official Electricity Bill</span>
        <span class="toolbar-status ${isPaid ? 'paid' : 'unpaid'}">
          ${isPaid ? '✓ PAID (ادا شدہ)' : '⚠️ UNPAID (غیر ادا شدہ)'}
        </span>
      </div>
      <div class="toolbar-right">
        <button onclick="window.print()" class="toolbar-print-btn">
          🖨️ Print Original Bill (پرنٹ نکالیں)
        </button>
      </div>
    </div>
  `;

  // 4. Paid Stamp HTML if paid
  const paidStampHtml = isPaid ? `
    <div class="official-paid-watermark">
      PAID
      <span class="sub">ONLINE VERIFIED &bull; ادا شدہ</span>
    </div>
  ` : '';

  if (html.includes('<body')) {
    html = html.replace(/<body[^>]*>/i, `$&${toolbarHtml}${paidStampHtml}`);
  } else {
    html = `${toolbarHtml}${paidStampHtml}${html}`;
  }

  return html;
}

module.exports = {
  getPITCBill,
  verifyPaymentStatus,
  parseBillDetails,
  formatOriginalBillHtml,
  validateReferenceNumber,
  getCompanyByCode,
  getSupportedCompanies,
  COMPANIES,
};
