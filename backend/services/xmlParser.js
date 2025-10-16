const xml2js = require("xml2js");
const CreditReport = require("../models/CreditReport");

class XMLParserService {
  constructor() {
    this.parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      explicitRoot: false,
      trim: true,
      normalize: true,
      ignoreAttrs: false,
    });
  }

  async parseXML(xmlData) {
    return new Promise((resolve, reject) => {
      this.parser.parseString(xmlData, (err, result) => {
        if (err) {
          console.error("XML Parse Error:", err);
          reject(new Error("Failed to parse XML file: " + err.message));
        } else {
          console.log("XML Parsed Successfully");
          resolve(result);
        }
      });
    });
  }

  extractBasicDetails(xmlData) {
    try {
      console.log("Extracting basic details...");

      const applicant =
        xmlData.Current_Application?.Current_Application_Details
          ?.Current_Applicant_Details;

      let finalName = "N/A";
      if (applicant) {
        const firstName = applicant.First_Name || "";
        const lastName = applicant.Last_Name || "";
        finalName = `${firstName} ${lastName}`.trim() || "N/A";
      }

      // Mobile phone extraction
      let finalMobile = "0";
      if (applicant && applicant.MobilePhoneNumber) {
        finalMobile = applicant.MobilePhoneNumber;
      } else {
        const phoneDetails =
          xmlData.CAIS_Account?.CAIS_Account_DETAILS?.[0]
            ?.CAIS_Holder_Phone_Details;
        if (phoneDetails && phoneDetails.Telephone_Number) {
          finalMobile = phoneDetails.Telephone_Number;
        }
      }

      // PAN extraction
      let finalPAN = "N/A";
      const panData =
        xmlData.CAIS_Account?.CAIS_Account_DETAILS?.[0]?.CAIS_Holder_Details
          ?.Income_TAX_PAN;
      if (panData) {
        finalPAN = panData;
      } else if (applicant && applicant.IncomeTaxPan) {
        finalPAN = applicant.IncomeTaxPan;
      }

      // Credit score extraction
      let finalScore = 0;
      if (xmlData.SCORE && xmlData.SCORE.BureauScore) {
        finalScore = parseInt(xmlData.SCORE.BureauScore) || 0;
      }

      const basicDetails = {
        name: finalName,
        mobilePhone: finalMobile,
        pan: finalPAN,
        creditScore: finalScore,
      };

      console.log("Extracted Basic Details:", basicDetails);
      return basicDetails;
    } catch (error) {
      console.error("Error extracting basic details:", error);
      return {
        name: "N/A",
        mobilePhone: "N/A",
        pan: "N/A",
        creditScore: 0,
      };
    }
  }

  extractReportSummary(xmlData) {
    try {
      console.log("Extracting report summary...");

      const caisSummary = xmlData.CAIS_Account?.CAIS_Summary;
      const creditAccount = caisSummary?.Credit_Account;
      const outstandingBalance = caisSummary?.Total_Outstanding_Balance;

      const accountsData = xmlData.CAIS_Account?.CAIS_Account_DETAILS;
      const accountArray = Array.isArray(accountsData)
        ? accountsData
        : accountsData
        ? [accountsData]
        : [];

      // Calculate account statistics
      let activeAccounts = 0;
      let closedAccounts = 0;
      let currentBalanceAmount = 0;
      let securedAccounts = 0;
      let unsecuredAccounts = 0;

      accountArray.forEach((account) => {
        // Check account status
        const status = account.Account_Status;
        if (status === "11" || status === "53" || status === "71") {
          // Active status codes
          activeAccounts++;
        } else if (status === "13") {
          // Closed status code
          closedAccounts++;
        }

        // Add current balance
        const balance = parseFloat(account.Current_Balance) || 0;
        currentBalanceAmount += balance;

        // Check portfolio secured/unsecured
        const portfolioType = account.Portfolio_Type;
        if (portfolioType === "R") {
          // Secured
          securedAccounts++;
        } else if (portfolioType === "I") {
          // Unsecured
          unsecuredAccounts++;
        }
      });

      // Get enquiries data
      const capsSummary = xmlData.TotalCAPS_Summary;
      const last7DaysEnquiries = parseInt(capsSummary?.TotalCAPSLast7Days) || 0;

      const reportSummary = {
        totalAccounts: creditAccount?.CreditAccountTotal
          ? parseInt(creditAccount.CreditAccountTotal)
          : accountArray.length,
        activeAccounts: creditAccount?.CreditAccountActive
          ? parseInt(creditAccount.CreditAccountActive)
          : activeAccounts,
        closedAccounts: creditAccount?.CreditAccountClosed
          ? parseInt(creditAccount.CreditAccountClosed)
          : closedAccounts,
        currentBalanceAmount: outstandingBalance?.Outstanding_Balance_All
          ? parseInt(outstandingBalance.Outstanding_Balance_All)
          : currentBalanceAmount,
        securedAccountsAmount: securedAccounts,
        unsecuredAccountsAmount: unsecuredAccounts,
        last7DaysEnquiries: last7DaysEnquiries,
      };

      console.log("Extracted Report Summary:", reportSummary);
      return reportSummary;
    } catch (error) {
      console.error("Error extracting report summary:", error);
      return {
        totalAccounts: 0,
        activeAccounts: 0,
        closedAccounts: 0,
        currentBalanceAmount: 0,
        securedAccountsAmount: 0,
        unsecuredAccountsAmount: 0,
        last7DaysEnquiries: 0,
      };
    }
  }

  extractCreditAccounts(xmlData) {
    try {
      console.log("Extracting credit accounts...");

      const accountsData = xmlData.CAIS_Account?.CAIS_Account_DETAILS;
      const accountArray = Array.isArray(accountsData)
        ? accountsData
        : accountsData
        ? [accountsData]
        : [];

      const creditAccounts = accountArray.map((account, index) => {
        // Map account type codes to readable names
        const accountTypeMap = {
          10: "Credit Card",
          51: "Personal Loan",
          52: "Auto Loan",
          53: "Home Loan",
        };

        const typeCode = account.Account_Type;
        const type = accountTypeMap[typeCode] || `Type ${typeCode}`;

        // Bank name
        const bank = account.Subscriber_Name?.trim() || "N/A";

        // Address
        const addressDetails = account.CAIS_Holder_Address_Details;
        const address = addressDetails
          ? `${addressDetails.First_Line_Of_Address_non_normalized || ""} ${
              addressDetails.Second_Line_Of_Address_non_normalized || ""
            } ${addressDetails.City_non_normalized || ""}`.trim()
          : "N/A";

        // Account number
        const accountNumber = account.Account_Number || `ACC-${index + 1}`;

        // Amounts
        const amountOverdue = parseFloat(account.Amount_Past_Due) || 0;
        const currentBalance = parseFloat(account.Current_Balance) || 0;

        // Account status
        const statusMap = {
          11: "Active",
          13: "Closed",
          53: "Active",
          71: "Active",
        };
        const status = statusMap[account.Account_Status] || "Unknown";

        return {
          type,
          bank,
          address,
          accountNumber,
          amountOverdue,
          currentBalance,
          status: status,
          openDate: account.Open_Date,
          creditLimit: account.Credit_Limit_Amount
            ? parseInt(account.Credit_Limit_Amount)
            : null,
        };
      });

      console.log(`Extracted ${creditAccounts.length} credit accounts`);
      return creditAccounts;
    } catch (error) {
      console.error("Error extracting credit accounts:", error);
      return [];
    }
  }

  // New method to extract additional useful information
  extractAdditionalDetails(xmlData) {
    try {
      console.log("Extracting additional details...");

      const applicant =
        xmlData.Current_Application?.Current_Application_Details
          ?.Current_Applicant_Details;
      const matchResult = xmlData.Match_result;

      const additionalDetails = {
        dateOfBirth: applicant?.Date_Of_Birth_Applicant || "N/A",
        exactMatch: matchResult?.Exact_match === "Y",
        reportDate: xmlData.Header?.ReportDate || "N/A",
        reportTime: xmlData.Header?.ReportTime || "N/A",
        enquiryUsername: xmlData.CreditProfileHeader?.Enquiry_Username || "N/A",
      };

      console.log("Extracted Additional Details:", additionalDetails);
      return additionalDetails;
    } catch (error) {
      console.error("Error extracting additional details:", error);
      return {};
    }
  }

  async processAndSaveXML(xmlData, fileName, fileInfo = {}) {
    try {
      console.log("Processing XML file:", fileName);

      const parsedXML = await this.parseXML(xmlData);

      // Debug: Log main sections found
      console.log("Main sections found:", Object.keys(parsedXML));

      const basicDetails = this.extractBasicDetails(parsedXML);
      const reportSummary = this.extractReportSummary(parsedXML);
      const creditAccounts = this.extractCreditAccounts(parsedXML);
      const additionalDetails = this.extractAdditionalDetails(parsedXML);

      // Create credit report data
      const creditReportData = {
        fileName: `credit-report-${Date.now()}`,
        originalFileName: fileName,
        basicDetails,
        reportSummary,
        creditAccounts,
        additionalDetails,
        rawData: parsedXML, 
      };

      
      if (fileInfo.fileData) {
        creditReportData.fileData = fileInfo.fileData;
        creditReportData.fileSize = fileInfo.fileSize;
        creditReportData.fileType = fileInfo.fileType;
      }

      const creditReport = new CreditReport(creditReportData);

      const savedReport = await creditReport.save();
      console.log("Report saved successfully with ID:", savedReport._id);

      return savedReport;
    } catch (error) {
      console.error("Failed to process and save XML data:", error);
      throw new Error("Failed to process and save XML data: " + error.message);
    }
  }
}

module.exports = new XMLParserService();