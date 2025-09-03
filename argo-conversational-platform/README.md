# 🌊 Argo Conversational Platform

An AI-powered conversational platform for Argo ocean data with geospatial visualization, RAG, and natural language querying.

## 🎯 Features

- **Natural Language Queries**: Ask questions about ocean data in English/Hindi
- **Geospatial Visualization**: Interactive maps and plots using Streamlit
- **RAG-Powered Responses**: Vector search with Google Gemini LLM
- **Real-time Data**: Automated updates from Argo global repository
- **Multi-format Export**: CSV, NetCDF, ASCII outputs

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Docker & Docker Compose
- Google Gemini API key

### Setup
```bash
git clone <your-repo>
cd argo-conversational-platform
cp .env.template .env
# Edit .env with your API keys
docker-compose up -d
```

### Access
- **Dashboard**: http://localhost:8501
- **API**: http://localhost:8000/docs

## 🏗️ Architecture

```
Argo Data (argopy) → PostgreSQL+PostGIS+pgvector → RAG+Gemini → Streamlit UI
```

## 📊 Data Sources

- **Primary**: Argo global repository via argopy library
- **Scope**: Indian Ocean (initial), expanding to global
- **Types**: Temperature, Salinity, Pressure profiles
- **Update**: Every 30 minutes

## 🛠️ Tech Stack

- **Backend**: FastAPI, PostgreSQL, PostGIS, pgvector
- **Frontend**: Streamlit with Plotly/Leaflet maps
- **LLM**: Google Gemini with RAG
- **Data**: argopy, xarray, pandas
- **Deployment**: Docker, Render

## 📁 Project Structure

```
src/
├── config/         # Configuration management
├── data/           # Data ingestion & models
├── rag/            # RAG & LLM integration
├── api/            # FastAPI endpoints
├── ui/             # Streamlit dashboard
└── utils/          # Shared utilities
```

## 🔧 Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run tests
pytest tests/

# Start development server
streamlit run src/ui/app.py
```

## 📈 Roadmap

- [x] Project setup
- [ ] Database schema design
- [ ] Argo data ingestion
- [ ] RAG implementation
- [ ] Streamlit dashboard
- [ ] Deployment to Render

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
