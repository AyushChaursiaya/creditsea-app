import React, { useState } from "react";
import { uploadService } from "../services/api";

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        selectedFile.type === "text/xml" ||
        selectedFile.type === "application/xml" ||
        selectedFile.name.toLowerCase().endsWith(".xml")
      ) {
        setFile(selectedFile);
        setMessage({ type: "", text: "" });
      } else {
        setMessage({ type: "error", text: "Please select an XML file" });
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a file first" });
      return;
    }

    setUploading(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await uploadService.uploadXML(file);

      setMessage({
        type: "success",
      });

      setFile(null);
      document.getElementById("file-input").value = "";

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Upload failed. Please try again.";

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (
        droppedFile.type === "text/xml" ||
        droppedFile.type === "application/xml" ||
        droppedFile.name.toLowerCase().endsWith(".xml")
      ) {
        setFile(droppedFile);
        setMessage({ type: "", text: "" });
      } else {
        setMessage({ type: "error", text: "Please drop an XML file" });
      }
    }
  };

  return (
    <div className="card p-6 mb-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Experian XML File
        </h2>
        <p className="text-gray-600">
          Upload your Experian soft credit pull XML file for analysis
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          file
            ? "border-primary-500 bg-primary-50"
            : "border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-25"
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          id="file-input"
          type="file"
          accept=".xml,text/xml,application/xml"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />

        <div className="space-y-4">
          {file ? (
            <div className="flex items-center justify-center space-x-4 p-4 bg-white rounded-lg border">
              <div className="text-3xl">📄</div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">{file.name}</div>
                <div className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-5xl mb-2">📤</div>
              <div>
                <p className="font-medium text-gray-900">
                  Drag & drop your XML file here
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  or click to browse files
                </p>
              </div>
              <p className="text-xs text-gray-500">Supports .xml files only</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <label
              htmlFor="file-input"
              className={`btn-secondary cursor-pointer text-center ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Browse Files
            </label>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`btn-primary min-w-[140px] ${
                !file || uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {uploading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                "Upload & Process"
              )}
            </button>
          </div>
        </div>
      </div>

      {message.text && (
        <div
          className={`mt-4 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-success-50 border-success-200 text-success-800"
              : "bg-danger-50 border-danger-200 text-danger-800"
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">
              {message.type === "success" ? "✔" : "❌"}
            </span>
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
