const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const fs = require('fs');
const { 
  uploadXML, 
  getAllReports, 
  getReportById, 
  deleteReport,
  downloadOriginalFile  
} = require('../controllers/uploadController');

// Main upload route
router.post('/upload', upload.single('xmlFile'), uploadXML);

// Get all reports
router.get('/reports', getAllReports);

// Get report by ID
router.get('/reports/:id', getReportById);

// Delete report
router.delete('/reports/:id', deleteReport);

// Download original file
// router.get('/reports/:id/download', downloadOriginalFile);


router.post('/debug-xml', upload.single('xmlFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const xmlData = fs.readFileSync(req.file.path, 'utf8');
    
    console.log(xmlData.substring(0, 1000));
    
    const xml2js = require('xml2js');
    const parser = new xml2js.Parser({ 
      explicitArray: false, 
      mergeAttrs: true,
      explicitRoot: false 
    });
    
    parser.parseString(xmlData, (err, result) => {
      if (err) {
        // Clean up file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          success: false, 
          message: 'Parse error: ' + err.message 
        });
      }
      
      console.log('Root keys:', Object.keys(result));
      
      // Clean up file
      fs.unlinkSync(req.file.path);
      
      res.json({
        success: true,
        message: 'XML structure analyzed',
        data: {
          rootKeys: Object.keys(result),
          sampleData: result,
          rawDataSample: xmlData.substring(0, 500) + '...'
        }
      });
    });
    
  } catch (error) {
    // Clean up file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Debug error: ' + error.message 
    });
  }
});

// Test upload route
router.post('/test-upload', upload.single('xmlFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const xmlData = fs.readFileSync(req.file.path, 'utf8');
    
    console.log('=== Testing XML File ===');
    console.log('File:', req.file.originalname);
    console.log('Size:', xmlData.length, 'bytes');
    
    // Basic check - kya XML valid hai?
    if (!xmlData.includes('<?xml')) {
      fs.unlinkSync(req.file.path);
      return res.json({ success: false, message: 'Not a valid XML file' });
    }

    // Try to parse
    const xml2js = require('xml2js');
    const parser = new xml2js.Parser({ explicitArray: false });
    
    parser.parseString(xmlData, (err, result) => {
      if (err) {
        fs.unlinkSync(req.file.path);
        return res.json({ 
          success: false, 
          message: 'XML parse error: ' + err.message 
        });
      }

      // Clean up file
      fs.unlinkSync(req.file.path);
      
      // Return simple success
      res.json({
        success: true,
        message: 'XML file is valid and can be processed',
        fileName: req.file.originalname,
        dataFound: true
      });
    });
    
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      success: false, 
      message: 'Test error: ' + error.message 
    });
  }
});

module.exports = router;