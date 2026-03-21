import React from 'react';
import { Dumbbell, Utensils, Clock, Printer } from 'lucide-react';

export default function ActualWeek1Preview({ plan }: { plan: any }) {
    if (!plan || !plan.days) return null;

    return (
        <div className="max-w-4xl mx-auto mb-12 p-6 md:p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 print:shadow-none print:border-none print:m-0 print:p-0">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 print:hidden">
                <div className="text-center md:text-left">
                    <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        Your Week 1 Plan
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Start right now. Your complete multi-week plan is being finalized.
                    </p>
                </div>
                <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl font-bold transition-all shadow-sm hover:shadow"
                >
                    <Printer className="w-5 h-5" />
                    Print Week 1 PDF
                </button>
            </div>

            {/* Print Title (Only visible when printing) */}
            <div className="hidden print:block mb-6">
                <h1 className="text-3xl font-bold text-purple-900">Your Week 1 Plan</h1>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-2xl mb-8 border border-purple-100 dark:border-purple-800/30 print:border-purple-300">
                <h4 className="text-xl font-bold text-purple-900 dark:text-purple-100">
                    {plan.weekTitle || "Week 1"}
                </h4>
                {plan.weekTarget && (
                    <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Target: {plan.weekTarget}</p>
                )}
            </div>

            <div className="space-y-6">
                {plan.days.map((day: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800 transition-colors print:border-gray-300 print:break-inside-avoid">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white text-lg">{day.dayTitle} — {day.focus}</p>
                                {day.timing && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                                        <Clock className="w-4 h-4" /> {day.timing}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Workout Column */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 font-semibold text-purple-600 dark:text-purple-400 border-b border-purple-100 dark:border-purple-800 pb-2 mb-2 print:text-purple-700 print:border-purple-300">
                                    <Dumbbell className="w-4 h-4" /> Workout
                                </div>
                                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 print:text-gray-900">
                                    {(day.workout || "").split(';').map((item: string, i: number) => {
                                        if (!item.trim()) return null;
                                        return (
                                            <li key={i} className="flex gap-2">
                                                <span className="text-purple-500 print:text-purple-700">•</span> {item.trim()}
                                            </li>
                                        );
                                    })}
                                </ul>
                                {day.trainerNote && (
                                    <div className="mt-3 p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-xl italic text-xs text-purple-700 dark:text-purple-300 print:bg-gray-100 print:text-gray-800">
                                        💡 {day.trainerNote}
                                    </div>
                                )}
                            </div>

                            {/* Nutrition Column */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 font-semibold text-pink-600 dark:text-pink-400 border-b border-pink-100 dark:border-pink-900/30 pb-2 mb-2 print:text-pink-700 print:border-pink-300">
                                    <Utensils className="w-4 h-4" /> Nutrition
                                </div>
                                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 print:text-gray-900">
                                    {(day.meals || "").split(';').map((item: string, i: number) => {
                                        if (!item.trim()) return null;
                                        const parts = item.split(':');
                                        if (parts.length > 1) {
                                            const [mealType, ...rest] = parts;
                                            return (
                                                <li key={i} className="flex gap-2">
                                                    <span className="text-pink-500 print:text-pink-700">•</span>
                                                    <span>
                                                        <strong>{mealType.trim()}:</strong> {rest.join(':').trim()}
                                                    </span>
                                                </li>
                                            );
                                        }
                                        return (
                                            <li key={i} className="flex gap-2">
                                                <span className="text-pink-500 print:text-pink-700">•</span> {item.trim()}
                                            </li>
                                        );
                                    })}
                                </ul>
                                {(day.calories || day.macros) && (
                                    <div className="mt-3 pt-3 flex gap-4 text-xs font-semibold text-pink-600 dark:text-pink-400 border-t border-pink-100 dark:border-pink-900/30 print:text-pink-800 print:border-pink-300">
                                        {day.calories && <span>{day.calories}</span>}
                                        {day.macros && <span>{day.macros}</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
