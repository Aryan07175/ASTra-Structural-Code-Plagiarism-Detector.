"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import CompareView from "@/components/CompareView";

export default function ComparePage({ params }: { params: Promise<{ batchId: string }> }) {
    const resolvedParams = use(params);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<any | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/results/${resolvedParams.batchId}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [resolvedParams.batchId]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/"
                            className="p-2 -ml-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-xl font-semibold text-slate-800">
                            Batch Analysis Results
                        </h1>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                        <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                            ID: {resolvedParams.batchId}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">

                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center animate-pulse h-64">
                        <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500 font-medium">Crunching AST structures...</p>
                    </div>
                ) : results.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                        <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">No similarities found</h2>
                        <p className="text-slate-500 max-w-md mx-auto">
                            We couldn't find any identical structural blocks between the submissions in this batch.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start">
                            <AlertCircle className="h-5 w-5 text-indigo-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <h3 className="font-medium text-indigo-900">High level of structural similarity detected</h3>
                                <p className="text-indigo-700 text-sm mt-1">
                                    We found {results.length} pairs of assignments with varying degrees of identical AST patterns.
                                    Click on any row to inspect the matched segments side-by-side.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4">Submission 1</th>
                                        <th className="px-6 py-4">Submission 2</th>
                                        <th className="px-6 py-4 text-center">Score</th>
                                        <th className="px-6 py-4 text-center">Matched Blocks</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {results.map((r) => {
                                        const similarityPercentage = (r.score * 100).toFixed(1);
                                        const isHighRisk = r.score > 0.6;

                                        return (
                                            <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-800">{r.submission_1.filename}</span>
                                                        <span className="text-xs font-mono text-slate-400 mt-0.5">{r.submission_1.student_id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-800">{r.submission_2.filename}</span>
                                                        <span className="text-xs font-mono text-slate-400 mt-0.5">{r.submission_2.student_id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full font-semibold text-xs ${isHighRisk ? "bg-red-100 text-red-700 border border-red-200" : "bg-orange-100 text-orange-700 border border-orange-200"
                                                        }`}>
                                                        {similarityPercentage}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center text-slate-500 font-medium">
                                                    {r.details?.length || 0} regions
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedMatch(r)}
                                                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors py-1 px-3 rounded-md hover:bg-indigo-50"
                                                    >
                                                        <FileText className="h-4 w-4 mr-1.5" />
                                                        Inspect
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal View */}
            {selectedMatch && (
                <CompareView
                    match={selectedMatch}
                    onClose={() => setSelectedMatch(null)}
                />
            )}
        </div>
    );
}
