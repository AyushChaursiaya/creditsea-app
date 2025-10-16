const xmlParserService = require('../services/xmlParser');
const CreditReport = require('../models/CreditReport');

// Upload XML file and process it
const uploadXML = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please select an XML file to upload' 
      });
    }

    console.log('File received:', {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Convert file buffer to text
    const xmlData = req.file.buffer.toString('utf8');
    console.log('File converted to text, size:', xmlData.length, 'bytes');

    // Process XML and save to database
    const savedReport = await xmlParserService.processAndSaveXML(
      xmlData, 
      req.file.originalname,
      {
        fileData: req.file.buffer,
        fileSize: req.file.size,
        fileType: req.file.mimetype
      }
    );

    // Send success response
    res.status(201).json({
      success: true,
      message: 'XML file processed successfully',
      data: {
        reportId: savedReport._id,
        fileName: savedReport.fileName,
        name: savedReport.basicDetails.name,
        creditScore: savedReport.basicDetails.creditScore,
        fileSize: savedReport.fileSize
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process XML file'
    });
  }
};

// Download original XML file
// const downloadOriginalFile = async (req, res) => {
//   try {
//     const report = await CreditReport.findById(req.params.id);
    
//     // Check if report exists and has file data
//     if (!report || !report.fileData) {
//       return res.status(404).json({
//         success: false,
//         message: 'Report or file not found'
//       });
//     }

//     // Set download headers
//     res.setHeader('Content-Type', 'application/xml');
//     res.setHeader('Content-Disposition', `attachment; filename="${report.originalFileName}"`);
//     res.setHeader('Content-Length', report.fileData.length);

//     // Send file to user
//     res.send(report.fileData);

//   } catch (error) {
//     console.error('Download error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to download file'
//     });
//   }
// };

// Get all credit reports
const getAllReports = async (req, res) => {
  try {
    // Get all reports sorted by newest first
    const reports = await CreditReport.find()
      .sort({ uploadDate: -1 })
      .select('fileName uploadDate basicDetails reportSummary fileSize');

    console.log(`Found ${reports.length} reports`);

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load reports'
    });
  }
};

// Get single report by ID
const getReportById = async (req, res) => {
  try {
    const report = await CreditReport.findById(req.params.id);
    
    // Check if report exists
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load report'
    });
  }
};

// Delete a report
const deleteReport = async (req, res) => {
  try {
    const report = await CreditReport.findByIdAndDelete(req.params.id);
    
    // Check if report was found and deleted
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report'
    });
  }
};

module.exports = {
  uploadXML,
  getAllReports,
  getReportById,
  deleteReport,
  // downloadOriginalFile
};