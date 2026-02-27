"use client";

import { useState, useRef } from "react";
import { UploadCloud, File as FileIcon, X } from "lucide-react";

export default function UploadForm({ onUploadComplete }: { onUploadComplete: (batchId: number) => void }) {
    const [files, setFiles] = useState<File[]>([]);
    const [batchName, setBatchName] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.py'));
            setFiles(prev => [...prev, ...droppedFiles]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files).filter(f => f.name.endsWith('.py'));
            setFiles(prev => [...prev, ...selectedFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (files.length === 0 || !batchName.trim()) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("batch_name", batchName);
        files.forEach(file => {
            formData.append("files", file);
        });

        try {
            const response = await fetch("http://localhost:8000/api/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                onUploadComplete(data.batch_id);
                setFiles([]);
                setBatchName("");
            } else {
                console.error("Upload failed");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">New Assignment Batch</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Batch Name</label>
                    <input
                        type="text"
                        required
                        value={batchName}
                        onChange={(e) => setBatchName(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-slate-800"
                        placeholder="e.g., CS101 Homework 1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Python Files</label>
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDragging ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:border-slate-400 bg-slate-50"
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            multiple
                            accept=".py"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <UploadCloud className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                        <p className="text-sm text-slate-600">
                            Drag & drop student <span className="font-semibold">.py</span> files here, or click to browse
                        </p>
                    </div>
                </div>

                {files.length > 0 && (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 max-h-48 overflow-y-auto">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            Selected Files ({files.length})
                        </h3>
                        <ul className="space-y-2">
                            {files.map((file, i) => (
                                <li key={i} className="flex items-center justify-between text-sm text-slate-700 bg-white p-2 border border-slate-100 rounded-md">
                                    <div className="flex items-center space-x-2 truncate">
                                        <FileIcon className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                                        <span className="truncate">{file.name}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(i)}
                                        className="text-slate-400 hover:text-red-500 focus:outline-none"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={files.length === 0 || !batchName.trim() || uploading}
                    className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {uploading ? "Uploading..." : "Upload and Analyze"}
                </button>
            </form>
        </div>
    );
}
