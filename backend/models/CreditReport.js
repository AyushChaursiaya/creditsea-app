const mongoose = require("mongoose");

const creditAccountSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  bank: {
    type: String,
  },
  address: {
    type: String,
  },
  accountNumber: {
    type: String,
  },
  amountOverdue: {
    type: Number,
    default: 0,
  },
  currentBalance: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
  },
  openDate: {
    type: String,
  },
  creditLimit: {
    type: Number,
  },
});

const creditReportSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    fileData: {
      type: Buffer, 
    },
    fileSize: {
      type: Number,
    },
    fileType: {
      type: String,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },

    basicDetails: {
      name: {
        type: String,
        required: true,
      },
      mobilePhone: {
        type: Number,
      },
      pan: {
        type: String,
        required: true,
      },
      creditScore: { 
        type: Number 
      },
    },

    reportSummary: {
      totalAccounts: {
        type: Number,
        default: 0,
      },
      activeAccounts: {
        type: Number,
        default: 0,
      },
      closedAccounts: {
        type: Number,
        default: 0,
      },
      currentBalanceAmount: {
        type: Number,
        default: 0,
      },
      securedAccountsAmount: {
        type: Number,
        default: 0,
      },
      unsecuredAccountsAmount: {
        type: Number,
        default: 0,
      },
      last7DaysEnquiries: {
        type: Number,
        default: 0,
      },
    },

    creditAccounts: [creditAccountSchema],

    additionalDetails: {
      type: mongoose.Schema.Types.Mixed,
    },

    rawData: {
      type: mongoose.Schema.Types.Mixed,
    }
  },
  {
    timestamps: true, 
  }
);


module.exports = mongoose.model("CreditReport", creditReportSchema);