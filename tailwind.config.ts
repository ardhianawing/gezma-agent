import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "var(--gezma-red)",
                    hover: "var(--gezma-red-hover)",
                    pressed: "var(--gezma-red-pressed)",
                    light: "var(--gezma-red-light)",
                },
                charcoal: {
                    DEFAULT: "var(--charcoal)",
                    light: "var(--charcoal-light)",
                },
                muted: {
                    DEFAULT: "var(--gray-600)",
                    foreground: "var(--gray-400)",
                },
                border: "var(--gray-border)",
                input: "var(--gray-200)",
                accent: "var(--gray-100)",
                success: {
                    DEFAULT: "var(--success)",
                    light: "var(--success-light)",
                },
                warning: {
                    DEFAULT: "var(--warning)",
                    light: "var(--warning-light)",
                },
                error: {
                    DEFAULT: "var(--error)",
                    light: "var(--error-light)",
                },
                info: {
                    DEFAULT: "var(--info)",
                    light: "var(--info-light)",
                },
                // Status Colors mapped for utility usage if needed
                status: {
                    lead: "var(--status-lead)",
                    dp: "var(--status-dp)",
                    lunas: "var(--status-lunas)",
                    dokumen: "var(--status-dokumen)",
                    visa: "var(--status-visa)",
                    ready: "var(--status-ready)",
                    departed: "var(--status-departed)",
                    completed: "var(--status-completed)",
                },
            },
            fontFamily: {
                sans: ["var(--font-sans)"],
                mono: ["var(--font-mono)"],
            },
            borderRadius: {
                lg: "var(--radius-lg)",
                md: "var(--radius-md)",
                sm: "var(--radius-sm)",
                xl: "var(--radius-xl)",
            },
        },
    },
},
    plugins: [],
};
export default config;
