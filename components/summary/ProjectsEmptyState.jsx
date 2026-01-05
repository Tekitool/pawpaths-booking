import React from 'react';

export default function ProjectsEmptyState() {
    return (
        <div className="bg-white border border-brand-color-02 rounded-xl p-6 shadow-sm h-full flex flex-col">
            <h2 className="text-lg font-semibold text-brand-text-01 mb-6">Projects</h2>

            <div className="flex-1 flex flex-col items-center justify-center text-center min-h-[200px]">
                <button className="text-brand-color-03 hover:underline font-medium">
                    Add Project(s) to this watchlist
                </button>
            </div>
        </div>
    );
}
