import React from 'react';
import { Dumbbell, Utensils, Clock, Calendar } from 'lucide-react';

export default function SamplePlanPreview() {
    return (
        <div className="max-w-4xl mx-auto mb-12 p-6 md:p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 transform hover:scale-[1.01] transition-transform duration-300">
            <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                    See What You'll Get
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Your plan will be <span className="font-bold text-purple-600 dark:text-purple-400">100% customized</span> — but here is a sample of the detail you can expect:
                </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl mb-8 border border-purple-100 dark:border-purple-800/30">
                <div className="flex items-center gap-4 mb-2">
                    <div className="bg-white dark:bg-purple-900 p-2 rounded-lg shadow-sm">
                        <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-purple-900 dark:text-purple-100">
                            Sample: 4-Week Toning Plan
                        </h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300">Target: Lean Muscle & Fat Loss</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h5 className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                        <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm">
                            Week 1
                        </span>
                        Foundation Phase
                    </h5>

                    <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white text-lg">Day 1 — Full Body Power</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                                    <Clock className="w-4 h-4" /> 45 Minutes • Moderate Intensity
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Workout Column */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 font-semibold text-purple-600 dark:text-purple-400 border-b border-purple-100 dark:border-purple-800 pb-2 mb-2">
                                    <Dumbbell className="w-4 h-4" /> Workout
                                </div>
                                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                    <li className="flex gap-2">
                                        <span className="text-purple-500">•</span> Warm-up: 5 min dynamic stretch
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-purple-500">•</span> Goblet Squats: 3 sets × 12 reps
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-purple-500">•</span> Push-ups: 3 sets × 10 reps
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-purple-500">•</span> Plank: 3 sets × 45 sec
                                    </li>
                                </ul>
                            </div>

                            {/* Nutrition Column */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 font-semibold text-pink-600 dark:text-pink-400 border-b border-pink-100 dark:border-pink-900/30 pb-2 mb-2">
                                    <Utensils className="w-4 h-4" /> Nutrition
                                </div>
                                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                    <li className="flex gap-2">
                                        <span className="text-pink-500">•</span> <strong>Breakfast:</strong> Oatmeal w/ berries & whey
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-pink-500">•</span> <strong>Lunch:</strong> Grilled chicken salad (400 cal)
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-pink-500">•</span> <strong>Snack:</strong> Greek yogurt & almonds
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center italic text-gray-500 dark:text-gray-400 text-sm mt-8 border-t border-gray-100 dark:border-gray-800 pt-6">
                    "The detailed daily breakdown helps me stay consistent without guessing!" — <strong>Sarah, Beta Tester</strong>
                </p>
            </div>
        </div>
    );
}
