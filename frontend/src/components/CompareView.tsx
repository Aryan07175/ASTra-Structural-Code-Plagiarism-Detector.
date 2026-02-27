"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { X, Activity } from "lucide-react";

// MonacoEditor must be lazy-loaded on the client
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface MatchDetail {
    file1_lines: [number, number];
    file2_lines: [number, number];
}

interface Submission {
    id: number;
    student_id: string;
    filename: string;
    content: string;
}

interface CompareMatch {
    id: number;
    score: number;
    details: MatchDetail[];
    submission_1: Submission;
    submission_2: Submission;
}

interface CompareViewProps {
    match: CompareMatch;
    onClose: () => void;
}

export default function CompareView({ match, onClose }: CompareViewProps) {
    const editor1Ref = useRef<any>(null);
    const editor2Ref = useRef<any>(null);
    const decorations1Ref = useRef<any>([]);
    const decorations2Ref = useRef<any>([]);

    const handleEditor1Mount = (editor: any, monaco: any) => {
        editor1Ref.current = editor;
        highlightEditor(editor, monaco, match.details.map(d => d.file1_lines), decorations1Ref);
    };

    const handleEditor2Mount = (editor: any, monaco: any) => {
        editor2Ref.current = editor;
        highlightEditor(editor, monaco, match.details.map(d => d.file2_lines), decorations2Ref);
    };

    const highlightEditor = (editor: any, monaco: any, lineRanges: [number, number][], decorationsRef: any) => {
        const newDecorations = lineRanges.map(range => {
            return {
                range: new monaco.Range(range[0], 1, range[1], 1),
                options: {
                    isWholeLine: true,
                    className: 'bg-red-500/30 border-l-4 border-red-500',
                    marginClassName: 'bg-red-500/20'
                }
            };
        });

        // Fallback logic for Monaco deltaDecorations which changed in newer versions
        if (editor.createDecorationsCollection) {
            decorationsRef.current = editor.createDecorationsCollection(newDecorations);
        } else {
            decorationsRef.current = editor.deltaDecorations(decorationsRef.current || [], newDecorations);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 lg:p-8">
            <div className="bg-slate-900 shadow-2xl rounded-2xl border border-slate-700 w-full h-full flex flex-col overflow-hidden max-w-[1600px] max-h-[1000px]">

                {/* Header */}
                <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <div className="flex flex-col">
                        <div className="flex items-center space-x-3 mb-1">
                            <Activity className="h-5 w-5 text-indigo-400" />
                            <h2 className="text-xl font-bold text-white">Structural Match Inspection</h2>
                            <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-sm font-semibold tracking-wide">
                                {(match.score * 100).toFixed(1)}% Similarity
                            </span>
                        </div>
                        <p className="text-sm text-slate-400">Exact AST node sequence matches are highlighted in dark red.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-slate-300 hover:text-white group"
                    >
                        <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-200" />
                    </button>
                </header>

                {/* Content - Split Panes */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-px bg-slate-800">
                    {/* Pane 1 */}
                    <div className="flex flex-col bg-slate-900 h-full overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                            <div>
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Submission 1</span>
                                <p className="text-sm text-white font-medium mt-0.5">{match.submission_1.filename}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Student ID</span>
                                <p className="text-sm text-indigo-300 font-mono mt-0.5">{match.submission_1.student_id}</p>
                            </div>
                        </div>
                        <div className="flex-1">
                            <MonacoEditor
                                height="100%"
                                language="python"
                                theme="vs-dark"
                                value={match.submission_1.content}
                                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, padding: { top: 16 } }}
                                onMount={handleEditor1Mount}
                            />
                        </div>
                    </div>

                    {/* Pane 2 */}
                    <div className="flex flex-col bg-slate-900 h-full overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                            <div>
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Submission 2</span>
                                <p className="text-sm text-white font-medium mt-0.5">{match.submission_2.filename}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Student ID</span>
                                <p className="text-sm text-indigo-300 font-mono mt-0.5">{match.submission_2.student_id}</p>
                            </div>
                        </div>
                        <div className="flex-1">
                            <MonacoEditor
                                height="100%"
                                language="python"
                                theme="vs-dark"
                                value={match.submission_2.content}
                                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, padding: { top: 16 } }}
                                onMount={handleEditor2Mount}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
