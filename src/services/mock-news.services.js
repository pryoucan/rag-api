export const articles = [
    {
        id: 1,
        title: "NVIDIA shares surge amid AI boom",
        content: `
NVIDIA shares surged as demand for AI hardware continues to rise.
Major cloud providers are investing heavily in GPU infrastructure.
Analysts believe AI workloads are driving this growth.
Rising inflation and supply chain issues remain potential risks.
`
    },
    {
        id: 2,
        title: "Global inflation pressures markets",
        content: `
Inflation remains high across global markets.
Fuel prices and logistics disruptions have increased costs.
Central banks are adjusting interest rates to stabilize economies.
Investors are watching policy announcements closely.
`
    }
];

// auto-generating up to 50 news articles:
for (let i = 3; i <= 50; i++) {
    articles.push({
        id: i,
        title: `Market Update ${i}`,
        content: `
This article discusses developments in technology, economy, and global markets.
Artificial intelligence, inflation, and interest rates are recurring themes.
Experts highlight uncertainty and the need for innovation.
`
    });
}
