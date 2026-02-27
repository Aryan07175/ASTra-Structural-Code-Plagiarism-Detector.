"use client";

import { useState, useEffect } from "react";
import UploadForm from "@/components/UploadForm";
import Link from "next/link";
import { Folder, ChevronRight, Activity } from "lucide-react";

interface Batch {
  id: number;
  name: string;
  created_at: string;
  submissions_count: number;
}

export default function Home() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/assignments");
      if (res.ok) {
        const data = await res.json();
        const sorted = data.sort((a: Batch, b: Batch) => b.id - a.id);
        setBatches(sorted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleUploadComplete = async (batchId: number) => {
    // Run comparison for the new batch immediately
    try {
      await fetch(`http://localhost:8000/api/compare/${batchId}`, {
        method: "POST"
      });
      fetchBatches();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-indigo-700 flex items-center">
              <Activity className="mr-3 h-8 w-8" />
              ASTra
            </h1>
            <p className="text-slate-500 mt-1">Abstract Syntax Tree Plagiarism Checker</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 border-slate-200">
            <UploadForm onUploadComplete={handleUploadComplete} />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-slate-800">
                <Folder className="mr-2 h-5 w-5 text-indigo-500" />
                Assignment Batches
              </h2>

              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-slate-100 rounded-lg w-full"></div>
                  ))}
                </div>
              ) : batches.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                  <p>No assignments uploaded yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {batches.map((batch) => (
                    <Link href={`/compare/${batch.id}`} key={batch.id} className="block group">
                      <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all">
                        <div>
                          <h3 className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {batch.name}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">
                            {batch.submissions_count} submissions • {new Date(batch.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
