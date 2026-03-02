"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PrivacyPolicy() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors py-12 px-6">
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 md:p-12">
                {/* Navigation */}
                <div className="mb-8 flex justify-between items-center">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                    >
                        ← Back
                    </button>
                    <Link href="/terms" className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors">
                        Terms & Refund Policy →
                    </Link>
                </div>

                {/* Content */}
                <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-transparent prose-h1:bg-clip-text prose-h1:bg-gradient-to-r prose-h1:from-purple-600 prose-h1:to-pink-600 prose-a:text-purple-600 dark:prose-a:text-purple-400">
                    <h1>Privacy Policy</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: February 27, 2026</p>

                    <p>RamaFit (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates ramafit.xyz. This Privacy Policy explains how we collect, use, and protect your information when you use our service.</p>

                    <h2>1. Information We Collect</h2>
                    <p>We collect only the information you provide through our fitness wizard form:</p>
                    <ul>
                        <li><strong>Personal details:</strong> Name, email address, age, gender</li>
                        <li><strong>Physical data:</strong> Height, weight (used for BMI calculation)</li>
                        <li><strong>Fitness profile:</strong> Goal, fitness level, timeline, equipment, dietary preference, workout location, past injuries</li>
                        <li><strong>Payment information:</strong> Processed securely by Lemon Squeezy — we never see or store your card details</li>
                    </ul>

                    <h2>2. How We Use Your Information</h2>
                    <ul>
                        <li>To generate your personalized AI fitness and nutrition plan</li>
                        <li>To deliver your plan PDF via email</li>
                        <li>To process your payment through our payment provider</li>
                        <li>To prevent abuse of our free sample feature</li>
                    </ul>
                    <p>We do <strong>not</strong> use your data for marketing, advertising, or any purpose beyond delivering the product you purchased.</p>

                    <h2>3. Third-Party Services</h2>
                    <p>We use the following trusted services to operate RamaFit:</p>
                    <ul>
                        <li><strong>Lemon Squeezy</strong> — Payment processing. Subject to <a href="https://www.lemonsqueezy.com/privacy" target="_blank" rel="noopener noreferrer">Lemon Squeezy&apos;s Privacy Policy</a></li>
                        <li><strong>OpenAI</strong> — AI plan generation. Your fitness data is sent to generate your plan but is not stored by OpenAI for training</li>
                        <li><strong>Resend</strong> — Email delivery of your plan PDF</li>
                        <li><strong>Vercel</strong> — Website hosting and serverless infrastructure</li>
                    </ul>
                    <p>We do not sell, rent, or share your personal data with any other third parties.</p>

                    <h2>4. Data Storage & Retention</h2>
                    <ul>
                        <li>Your fitness profile data is processed <strong>in memory only</strong> during plan generation and is not stored in a database</li>
                        <li>Your email address hash may be stored to enforce the one-time free sample limit</li>
                        <li>Payment records are maintained by Lemon Squeezy per their data retention policies</li>
                    </ul>

                    <h2>5. Cookies & Local Storage</h2>
                    <p>We use browser cookies and localStorage solely to:</p>
                    <ul>
                        <li>Save your wizard progress (so you don&apos;t lose your form data)</li>
                        <li>Track whether you&apos;ve used your free sample plan</li>
                    </ul>
                    <p>We do not use tracking cookies, analytics cookies, or advertising cookies.</p>

                    <h2>6. Security</h2>
                    <p>All connections are encrypted via HTTPS (SSL/TLS). Payment processing is handled entirely by Lemon Squeezy&apos;s PCI-compliant infrastructure. We never access or store your credit card information.</p>

                    <h2>7. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li>Request deletion of any data we hold about you</li>
                        <li>Ask what information we have on file</li>
                        <li>Withdraw consent at any time</li>
                    </ul>
                    <p>Contact us at <a href="mailto:hello@ramafit.xyz">hello@ramafit.xyz</a> for any data requests.</p>

                    <h2>8. Children&apos;s Privacy</h2>
                    <p>RamaFit is not intended for users under 16 years of age. We do not knowingly collect information from children.</p>

                    <h2>9. Changes to This Policy</h2>
                    <p>We may update this Privacy Policy from time to time. Updates will be posted on this page with a revised effective date.</p>

                    <hr className="my-8 border-gray-200 dark:border-gray-800" />

                    <p className="font-medium">
                        Questions? Contact us at <a href="mailto:hello@ramafit.xyz">hello@ramafit.xyz</a>.
                    </p>
                </article>
            </div>
        </div>
    );
}
