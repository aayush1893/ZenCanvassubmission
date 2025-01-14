import React, { useState, useEffect } from "react";

interface GalleryProps {
  playerId: string;
  onBack: () => void;
  savedFiles: SavedFile[]; // Add savedFiles property
}

interface SavedFile {
  id: string;
  name: string;
  url: string;
}

const Gallery: React.FC<GalleryProps> = ({ playerId, onBack }) => {
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);

  useEffect(() => {
    // Fetch all files from localStorage
    const fetchSavedFiles = async () => {
      try {
        const allFiles = JSON.parse(localStorage.getItem("gallery") || "[]");
        const userFiles = allFiles.filter((file: any) => file.playerId === playerId); // Filter by playerId
        setSavedFiles(userFiles);
      } catch (error) {
        console.error("Error fetching saved files:", error);
      }
    };
  
    fetchSavedFiles();
  }, [playerId]);
  

  const handleDownload = (file: SavedFile) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* Header */}
      <header className="flex justify-between p-4 bg-gray-800 text-white">
        <h1 className="text-xl font-bold">Gallery</h1>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Back to Menu
        </button>
      </header>

      {/* Main Content */}
      <div className="p-4">
        <h2 className="text-lg font-semibold">
          Welcome, {playerId ? playerId : "Guest"}
        </h2>
        <p className="mt-2">Here you can view and download your saved files.</p>

        {/* Saved Files */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedFiles.length > 0 ? (
            savedFiles.map((file) => (
              <div
                key={file.id}
                className="border rounded-lg p-4 bg-white shadow-md"
              >
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-32 object-cover rounded-md"
                />
                <h3 className="mt-2 font-medium text-center">{file.name}</h3>
                <button
                  onClick={() => handleDownload(file)}
                  className="mt-2 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Download
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">
              No saved files found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
