import Link from "next/link";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors py-12 px-6">
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 md:p-12">
                {/* Navigation */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>

                {/* Content */}
                <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-transparent prose-h1:bg-clip-text prose-h1:bg-gradient-to-r prose-h1:from-purple-600 prose-h1:to-pink-600 prose-a:text-purple-600 dark:prose-a:text-purple-400">
                    <h1>Privacy Policy</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: January 14, 2026</p>

                    <h2>1. What We Collect</h2>
                    <p>We collect only the information you provide when you use our form:</p>
                    <ul>
                        <li>Name and email (for delivery)</li>
                        <li>Fitness goal, level, timeline, equipment, dietary preference (to generate your plan)</li>
                    </ul>

                    <h2>2. Why We Collect It</h2>
                    <p>To create and deliver your personalized 4-week fitness & nutrition plan, and to send you updates if you request them.</p>

                    <h2>3. How We Use & Share It</h2>
                    <p>We use it only for plan generation and email delivery. We do not sell, rent, or share your data with third parties except:</p>
                    <ul>
                        <li>Resend (for secure email sending)</li>
                        <li>Vercel (for hosting the site)</li>
                    </ul>
                    <p>All data is processed in memory — we do not store your personal info long-term.</p>

                    <h2>4. Security</h2>
                    <p>Your connection is encrypted with HTTPS (SSL/TLS). We use industry-standard security practices from Vercel and Resend.</p>

                    <h2>5. Your Rights</h2>
                    <p>You can request deletion of your data by emailing <a href="mailto:hello@ramafit.xyz">hello@ramafit.xyz</a>. We'll remove it promptly.</p>

                    <h2>6. Changes to This Policy</h2>
                    <p>We may update this Privacy Policy from time to time. Updates will be posted on this page with a revised effective date.</p>

                    <hr className="my-8 border-gray-200 dark:border-gray-800" />

                    <p className="font-medium">
                        Questions? Reply to any plan email or contact <a href="mailto:hello@ramafit.xyz">hello@ramafit.xyz</a>.
                    </p>
                </article>
            </div>
        </div>
    );
}
