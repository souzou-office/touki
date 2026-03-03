"use client";

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from "react";
import { Upload } from "lucide-react";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  onTextSubmit: (text: string) => void;
  disabled: boolean;
}

type Tab = "file" | "text";

export default function FileDropzone({
  onFileSelect,
  onTextSubmit,
  disabled,
}: FileDropzoneProps) {
  const [activeTab, setActiveTab] = useState<Tab>("file");
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const handleDragEnter = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      dragCounterRef.current += 1;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      e.dataTransfer.dropEffect = "copy";
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      dragCounterRef.current = 0;
      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        const ext = file.name.toLowerCase();
        if (ext.endsWith(".pdf") || ext.endsWith(".txt")) {
          setSelectedFile(file);
          onFileSelect(file);
        }
      }
    },
    [disabled, onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const files = e.target.files;
      if (files && files.length > 0) {
        setSelectedFile(files[0]);
        onFileSelect(files[0]);
      }
    },
    [disabled, onFileSelect]
  );

  const handleBrowseClick = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  const handleTextSubmit = useCallback(() => {
    if (disabled || textInput.trim().length === 0) return;
    onTextSubmit(textInput.trim());
  }, [disabled, textInput, onTextSubmit]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Tab switcher */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("file")}
          disabled={disabled}
          className={`
            flex-1 py-3 text-sm font-medium transition-colors
            ${
              activeTab === "file"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          ファイルアップロード
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("text")}
          disabled={disabled}
          className={`
            flex-1 py-3 text-sm font-medium transition-colors
            ${
              activeTab === "text"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          テキスト入力
        </button>
      </div>

      {/* File upload tab */}
      {activeTab === "file" && (
        <div>
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={`
              relative flex flex-col items-center justify-center
              w-full min-h-[200px] p-8
              border-2 border-dashed rounded-xl
              transition-all duration-200
              ${
                disabled
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                  : isDragOver
                    ? "border-blue-500 bg-blue-50 scale-[1.01]"
                    : "border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50 cursor-pointer"
              }
            `}
          >
            <div
              className={`
                flex items-center justify-center w-14 h-14 rounded-full mb-4
                transition-colors duration-200
                ${
                  isDragOver
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-400"
                }
              `}
            >
              <Upload className="w-7 h-7" />
            </div>

            {selectedFile ? (
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  {isDragOver
                    ? "ここにドロップしてください"
                    : "ファイルをドラッグ＆ドロップ"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  または クリックしてファイルを選択
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  対応形式: PDF, TXT
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              disabled={disabled}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Text input tab */}
      {activeTab === "text" && (
        <div className="space-y-4">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={disabled}
            placeholder="登記情報のテキストを貼り付けてください..."
            rows={10}
            className={`
              w-full px-4 py-3 rounded-xl border text-sm
              resize-y transition-colors
              placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${
                disabled
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed text-gray-400"
                  : "border-gray-300 bg-white text-gray-900"
              }
            `}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleTextSubmit}
              disabled={disabled || textInput.trim().length === 0}
              className={`
                inline-flex items-center gap-2 px-6 py-2.5
                text-sm font-medium rounded-lg transition-colors
                ${
                  disabled || textInput.trim().length === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                }
              `}
            >
              <Upload className="w-4 h-4" />
              送信する
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
