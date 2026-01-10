import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Westminster Shorter Catechism",
	description: "Interactive Westminster Shorter Catechism app",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<script src="https://cdn.tailwindcss.com"></script>
				<link
					href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600&display=swap"
					rel="stylesheet"
				/>
				<script
					dangerouslySetInnerHTML={{
						__html: `
              tailwind.config = {
                darkMode: 'class',
                theme: {
                  extend: {
                    fontFamily: {
                      serif: ['"Crimson Pro"', 'serif'],
                      sans: ['"Inter"', 'sans-serif'],
                    },
                    colors: {
                      paper: '#fdfbf7',
                      ink: '#2d2a2e',
                      gold: '#c5a059',
                      'gold-dark': '#a38343',
                    }
                  }
                }
              }
            `,
					}}
				/>
				<style
					dangerouslySetInnerHTML={{
						__html: `
              body {
                background-color: #fdfbf7;
                color: #2d2a2e;
                -webkit-tap-highlight-color: transparent;
              }
              /* Custom scrollbar for aesthetics */
              ::-webkit-scrollbar {
                width: 8px;
              }
              ::-webkit-scrollbar-track {
                background: transparent;
              }
              ::-webkit-scrollbar-thumb {
                background: #e5e7eb;
                border-radius: 4px;
              }
              ::-webkit-scrollbar-thumb:hover {
                background: #d1d5db;
              }
            `,
					}}
				/>
			</head>
			<body>{children}</body>
		</html>
	);
}
