import apiClient from '../client';

class PredictiveAnalysisService {
    constructor() {
        this.baseURL = 'predictions';
        this.models = {
            gameOutcome: 'game_outcome_model',
            playerPerformance: 'player_performance_model',
            teamStrategy: 'team_strategy_model',
            injuryRisk: 'injury_risk_model'
        };
    }

    // Predicción de resultados de juegos
    async predictGameOutcome(gameData) {
        try {
            const { home_team_id, away_team_id, tournament_id } = gameData || {};
            const response = await apiClient.get(`${this.baseURL}/game-outcome`, {
                params: {
                    home_team_id,
                    away_team_id,
                    tournament_id,
                }
            });

            return {
                success: true,
                prediction: response.data?.prediction ?? response.data,
            };
        } catch (error) {
            console.error('Error predicting game outcome:', error);
            return {
                success: false,
                error: error.message,
                prediction: null
            };
        }
    }

    // Predicción de rendimiento de jugadores
    async predictPlayerPerformance(playerId, gameContext = {}) {
        try {
            const opponent_team_id = gameContext?.opponent_team_id ?? gameContext?.opponentId;
            const response = await apiClient.get(`${this.baseURL}/player-performance`, {
                params: {
                    player_id: playerId,
                    opponent_team_id,
                }
            });

            return {
                success: true,
                predictions: response.data?.predictions ?? response.data,
            };
        } catch (error) {
            console.error('Error predicting player performance:', error);
            return {
                success: false,
                error: error.message,
                predictions: null
            };
        }
    }

    // Análisis de estrategias de equipo
    async analyzeTeamStrategy(teamId, opponentId, gameContext = {}) {
        try {
            const response = await apiClient.post(`${this.baseURL}/team-strategy`, {
                model: this.models.teamStrategy,
                team_id: teamId,
                opponent_id: opponentId,
                context: gameContext,
                analysis_type: 'comprehensive'
            });

            return {
                success: true,
                recommended_strategies: response.data.strategies,
                matchup_analysis: response.data.matchups,
                tactical_advantages: response.data.advantages,
                risk_assessment: response.data.risks,
                lineup_suggestions: response.data.lineups
            };
        } catch (error) {
            console.error('Error analyzing team strategy:', error);
            return {
                success: false,
                error: error.message,
                strategies: null
            };
        }
    }

    // Predicción de riesgo de lesiones
    async predictInjuryRisk(playerId, timeframe = '30d') {
        try {
            const response = await apiClient.post(`${this.baseURL}/injury-risk`, {
                model: this.models.injuryRisk,
                player_id: playerId,
                timeframe: timeframe,
                factors: [
                    'workload',
                    'fatigue_indicators',
                    'injury_history',
                    'biomechanics',
                    'recovery_metrics'
                ]
            });

            return {
                success: true,
                risk_score: response.data.risk_score,
                risk_level: response.data.risk_level,
                contributing_factors: response.data.factors,
                recommendations: response.data.recommendations,
                monitoring_alerts: response.data.alerts
            };
        } catch (error) {
            console.error('Error predicting injury risk:', error);
            return {
                success: false,
                error: error.message,
                risk_score: null
            };
        }
    }

    // Análisis de tendencias del equipo
    async analyzeTeamTrends(teamId, timeframe = '90d') {
        try {
            const response = await apiClient.get(`${this.baseURL}/team-trends/${teamId}`, {
                params: {
                    timeframe,
                    include_predictions: true
                }
            });

            return {
                success: true,
                trends: response.data.trends,
                predictions: response.data.future_predictions,
                performance_indicators: response.data.indicators,
                anomalies: response.data.anomalies
            };
        } catch (error) {
            console.error('Error analyzing team trends:', error);
            return {
                success: false,
                error: error.message,
                trends: null
            };
        }
    }

    // Simulación de escenarios
    async simulateScenarios(scenarioConfig) {
        try {
            const response = await apiClient.post(`${this.baseURL}/simulate`, {
                scenarios: scenarioConfig.scenarios,
                iterations: scenarioConfig.iterations || 1000,
                variables: scenarioConfig.variables,
                constraints: scenarioConfig.constraints
            });

            return {
                success: true,
                results: response.data.simulation_results,
                statistics: response.data.statistics,
                confidence_intervals: response.data.confidence_intervals,
                sensitivity_analysis: response.data.sensitivity
            };
        } catch (error) {
            console.error('Error running scenario simulation:', error);
            return {
                success: false,
                error: error.message,
                results: null
            };
        }
    }

    // Obtener modelos disponibles
    async getAvailableModels() {
        try {
            const response = await apiClient.get(`${this.baseURL}/models`);
            return {
                success: true,
                models: response.data.models,
                capabilities: response.data.capabilities
            };
        } catch (error) {
            console.error('Error fetching available models:', error);
            return {
                success: false,
                error: error.message,
                models: []
            };
        }
    }

    // Entrenar modelo personalizado
    async trainCustomModel(modelConfig) {
        try {
            const response = await apiClient.post(`${this.baseURL}/train`, {
                model_type: modelConfig.type,
                training_data: modelConfig.data,
                features: modelConfig.features,
                target: modelConfig.target,
                hyperparameters: modelConfig.hyperparameters,
                validation_split: modelConfig.validationSplit || 0.2
            });

            return {
                success: true,
                model_id: response.data.model_id,
                training_metrics: response.data.metrics,
                validation_results: response.data.validation,
                feature_importance: response.data.feature_importance
            };
        } catch (error) {
            console.error('Error training custom model:', error);
            return {
                success: false,
                error: error.message,
                model_id: null
            };
        }
    }

    // Evaluar precisión del modelo
    async evaluateModel(modelId, testData) {
        try {
            const response = await apiClient.post(`${this.baseURL}/evaluate/${modelId}`, {
                test_data: testData,
                metrics: ['accuracy', 'precision', 'recall', 'f1_score', 'auc_roc']
            });

            return {
                success: true,
                evaluation_metrics: response.data.metrics,
                confusion_matrix: response.data.confusion_matrix,
                feature_importance: response.data.feature_importance,
                recommendations: response.data.recommendations
            };
        } catch (error) {
            console.error('Error evaluating model:', error);
            return {
                success: false,
                error: error.message,
                metrics: null
            };
        }
    }

    // Obtener explicaciones de predicciones (XAI)
    async explainPrediction(predictionId) {
        try {
            const response = await apiClient.get(`${this.baseURL}/explain/${predictionId}`);

            return {
                success: true,
                explanation: response.data.explanation,
                feature_contributions: response.data.feature_contributions,
                similar_cases: response.data.similar_cases,
                counterfactuals: response.data.counterfactuals
            };
        } catch (error) {
            console.error('Error explaining prediction:', error);
            return {
                success: false,
                error: error.message,
                explanation: null
            };
        }
    }

    // Configurar alertas predictivas
    async setupPredictiveAlerts(alertConfig) {
        try {
            const response = await apiClient.post(`${this.baseURL}/alerts`, {
                alert_type: alertConfig.type,
                conditions: alertConfig.conditions,
                thresholds: alertConfig.thresholds,
                notification_settings: alertConfig.notifications,
                frequency: alertConfig.frequency
            });

            return {
                success: true,
                alert_id: response.data.alert_id,
                status: response.data.status
            };
        } catch (error) {
            console.error('Error setting up predictive alerts:', error);
            return {
                success: false,
                error: error.message,
                alert_id: null
            };
        }
    }

    // Obtener historial de predicciones
    async getPredictionHistory(filters = {}) {
        try {
            const response = await apiClient.get(`${this.baseURL}/history`, {
                params: {
                    start_date: filters.startDate,
                    end_date: filters.endDate,
                    model_type: filters.modelType,
                    accuracy_threshold: filters.accuracyThreshold,
                    limit: filters.limit || 100
                }
            });

            return {
                success: true,
                predictions: response.data.predictions,
                accuracy_stats: response.data.accuracy_stats,
                trends: response.data.trends
            };
        } catch (error) {
            console.error('Error fetching prediction history:', error);
            return {
                success: false,
                error: error.message,
                predictions: []
            };
        }
    }
}

const predictiveAnalysisService = new PredictiveAnalysisService();
export default predictiveAnalysisService;