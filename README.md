ValueBridge is a strategic decision-support tool that helps organizations evaluate cost reduction initiatives through the lens of business value and risk. Instead of making budget cuts based on cost alone, ValueBridge scores and ranks initiatives using a priority formula — turning guesswork into data-driven decisions.

"From Cost Cutting to Value Creation."


✨ Features
FeatureDescription📋 Initiative ManagementAdd and track cost reduction initiatives with value and risk scores📊 Priority ScoringAutomatically ranks initiatives using a weighted value-risk formula🏷️ Smart RecommendationsClassifies each initiative as Invest, Review, or Avoid💡 AI InsightsContextual strategic commentary for each initiative⚡ Scenario SimulatorWhat-if analysis — see how budget cuts affect scores and recommendations📈 Visual AnalyticsValue vs. Risk scatter matrix and priority score bar chart🔍 Filter & SearchFilter by recommendation tier and search by initiative name📊 Summary DashboardKPI cards showing total cost, average score, and value-aligned spend

🏗️ Project Structure
valuebridge/
├── src/
│   └── ValueBridge.jsx       # Main React component (single-file app)
├── public/
│   └── index.html
├── package.json
└── README.md

🚀 Getting Started
Prerequisites

Node.js 16+
npm or yarn

Installation
bash# 1. Clone the repository
git clone https://github.com/your-username/valuebridge.git
cd valuebridge

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
Visit http://localhost:3000 to view the app.
Build for Production
bashnpm run build

🧮 Priority Scoring Formula
Each initiative is scored using a weighted formula that balances value against risk:
Priority Score = (Value × 0.6) − (Risk × 0.4)
Score RangeRecommendation≥ 5.0✅ Invest — High value, manageable risk2.0 – 4.9⚠️ Review — Mixed profile, needs deeper analysis< 2.0❌ Avoid — Risk outweighs projected value
Both Value Impact and Risk Level are rated on a scale of 1–10.

⚡ Scenario Simulator
The built-in simulator lets you model the impact of budget cuts on any initiative:

Select an initiative from the dropdown
Choose a budget reduction percentage (5%–50%)
Instantly see how cost, value, risk, and recommendation change

This helps answer questions like: "If we cut this project's budget by 30%, does it still make sense to invest?"

📊 Visualizations
Value vs. Risk Matrix (Scatter Chart)

X-axis: Risk level
Y-axis: Value impact
Dot size: Relative cost
Dot color: Recommendation tier (green / amber / red)

Priority Score Ranking (Horizontal Bar Chart)

All initiatives ranked by priority score
Color-coded by recommendation tier


🛠️ Tech Stack

Framework: React 18
Charts: Recharts
Styling: Inline CSS with design tokens
Fonts: Playfair Display, DM Sans, DM Mono (Google Fonts)


📦 Dependencies
json{
  "react": "^18.0.0",
  "recharts": "^2.x"
}

🤝 Contributing
Contributions and feature requests are welcome! Feel free to open an issue or submit a pull request.

📄 License
This project is licensed under the MIT License. See LICENSE for details.

👤 Author
Built with ❤️ using React & Recharts.
For queries or feedback, open an issue on GitHub.
