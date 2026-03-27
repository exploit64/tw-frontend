import React, { useState, useEffect } from "react";

export const FilePreviewModal = ({ fileUrl, filename, isOpen, onClose }) => {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(filename);
  const isText = /\.(txt|log|json|xml|ya?ml|css|js|ts|jsx|tsx|md)$/i.test(
    filename
  );
  
  useEffect(() => {
    if (!isOpen) return;
    if (isImage || !isText) return;
    setIsLoading(true);
    setError("");
    fetch(fileUrl, {
      headers: {
        Accept: "text/plain",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Не удалось загрузить файл");
        return res.text();
      })
      .then((text) => {
        setContent(text);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [fileUrl, filename, isOpen, isImage, isText]);

  if (!isOpen) return null;
  
  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen z-50 flex items-center justify-center bg-black bg-opacity-70"
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "auto",
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-[95vw] h-[95vh] flex flex-col text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="text-base sm:text-lg font-medium text-gray-800 truncate pr-2">
            {filename}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const a = document.createElement("a");
                a.href = fileUrl;
                a.download = filename || "file";
                a.style.display = "none";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              className="inline-flex items-center px-2 py-1 text-xs sm:text-sm border rounded text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Скачать
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition p-1"
              aria-label="Закрыть"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden bg-gray-50">
          {isImage ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <img
                src={fileUrl}
                alt={filename}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  const parent = e.target.parentElement;
                  parent.innerHTML =
                    '<p class="text-red-500">Не удалось загрузить изображение</p>';
                }}
              />
            </div>
          ) : isText ? (
            isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-500">Загрузка...</p>
              </div>
            ) : error ? (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <pre className="w-full h-full text-xs font-mono whitespace-pre-wrap bg-gray-50 p-4 overflow-auto">
                {content}
              </pre>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600">
                  Файл не поддерживается для просмотра.
                </p>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-blue-600 underline"
                >
                  Скачать файл
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
