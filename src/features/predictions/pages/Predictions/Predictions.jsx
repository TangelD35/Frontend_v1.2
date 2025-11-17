import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Activity, Users, Play, RefreshCw, Gauge, CheckCircle, AlertCircle } from 'lucide-react';
import mlPredictionsService from '../../../../shared/api/endpoints/mlPredictions';
import BanderaDominicana from '../../../../assets/icons/do.svg';

const Predictions = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [modelsInfo, setModelsInfo] = useState(null);
    const [loadingModels, setLoadingModels] = useState(true);
    const [gameData, setGameData] = useState({ rd_es_local: true, rd_fg_pct: 45.0, rival_fg_pct: 43.0, rd_reb: 42.0, rival_reb: 40.0, rd_ast: 22.0, rival_ast: 20.0 });
    const [gamePrediction, setGamePrediction] = useState(null);
    const [loadingGame, setLoadingGame] = useState(false);
    const [playerPointsData, setPlayerPointsData] = useState({ minutes_played: 32.5, field_goal_percentage: 45.5, free_throw_percentage: 80.0, total_rebounds: 8.0, assists: 5.0, field_goals_made: 6.0, three_point_made: 2.0 });
    const [playerPointsPrediction, setPlayerPointsPrediction] = useState(null);
    const [loadingPlayerPoints, setLoadingPlayerPoints] = useState(false);

    useEffect(() => { loadModelsInfo(); }, []);

    const loadModelsInfo = async () => {
        try {
            setLoadingModels(true);
            const data = await mlPredictionsService.getModelsInfo();
            setModelsInfo(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoadingModels(false);
        }
    };

    const handlePredictGame = async () => {
        try {
            setLoadingGame(true);
            const result = await mlPredictionsService.predictGameOutcome(gameData);
            setGamePrediction(result);
        } catch (error) {
            alert('Error al predecir');
        } finally {
            setLoadingGame(false);
        }
    };

    const handlePredictPlayerPoints = async () => {
        try {
            setLoadingPlayerPoints(true);
            const result = await mlPredictionsService.predictPlayerPoints(playerPointsData);
            setPlayerPointsPrediction(result);
        } catch (error) {
            alert('Error al predecir');
        } finally {
            setLoadingPlayerPoints(false);
        }
    };

    const availableModels = modelsInfo ? Object.values(modelsInfo).filter(m => m.status === 'available').length : 0;
    const totalModels = modelsInfo ? Object.keys(modelsInfo).length : 0;

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6'>
            <div className='max-w-7xl mx-auto'>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='relative overflow-hidden rounded-xl bg-gradient-to-r from-[#CE1126] via-[#8B0D1A] to-[#002D62] p-5 shadow-lg mb-4'>
                    <div className='relative z-10 flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                            <div className='w-12 h-12 rounded-lg bg-white/10 border border-white/30 overflow-hidden flex items-center justify-center'>
                                <img src={BanderaDominicana} alt='RD' className='w-full h-full object-cover' />
                            </div>
                            <div>
                                <h1 className='text-xl font-black text-white'>PREDICCIONES ML</h1>
                                <p className='text-white/80 text-xs'>Machine Learning • República Dominicana</p>
                            </div>
                        </div>
                        <button onClick={loadModelsInfo} className='px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-semibold flex items-center gap-2'>
                            <RefreshCw className={w-4 h-4 } />
                            Actualizar
                        </button>
                    </div>
                </motion.div>
                <div className='bg-white rounded-xl shadow-lg border p-2 mb-4'>
                    <div className='flex gap-2'>
                        {['dashboard', 'game', 'player'].map((tab, i) => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={lex-1 px-4 py-2.5 rounded-lg font-semibold text-sm }>
                                {tab === 'dashboard' ? 'Dashboard' : tab === 'game' ? 'Partidos' : 'Jugadores'}
                            </button>
                        ))}
                    </div>
                </div>
                {activeTab === 'dashboard' && (loadingModels ? <div className='flex justify-center py-20'><RefreshCw className='w-8 h-8 animate-spin' /></div> : modelsInfo && (
                    <>
                        <div className='grid grid-cols-3 gap-3 mb-4'>
                            <div className='bg-white rounded-xl shadow-lg border p-5 text-center'>
                                <p className='text-sm font-bold uppercase text-[#CE1126] mb-2'>Modelos</p>
                                <p className='text-4xl font-black'>{availableModels}/{totalModels}</p>
                            </div>
                            <div className='bg-white rounded-xl shadow-lg border p-5 text-center'>
                                <p className='text-sm font-bold uppercase text-[#002D62] mb-2'>Precisión</p>
                                <p className='text-4xl font-black'>96.3%</p>
                            </div>
                            <div className='bg-white rounded-xl shadow-lg border p-5 text-center'>
                                <p className='text-sm font-bold uppercase text-gray-600 mb-2'>Capacidades</p>
                                <p className='text-4xl font-black'>6</p>
                            </div>
                        </div>
                        <div className='grid grid-cols-3 gap-4'>
                            {Object.entries(modelsInfo).map(([key, model]) => (
                                <div key={key} className='bg-white rounded-xl shadow-lg border overflow-hidden'>
                                    <div className={px-4 py-2 }>
                                        <p className='text-xs font-bold text-white'>{model.status === 'available' ? '✓ Disponible' : '✗ No disponible'}</p>
                                    </div>
                                    <div className='p-4'>
                                        <h3 className='text-sm font-bold'>{model.model_name}</h3>
                                        {model.trained_samples && <p className='text-xs text-gray-500'>Muestras: {model.trained_samples}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ))}
                {activeTab === 'game' && <p className='text-center py-20'>Predicción de partidos - En desarrollo</p>}
                {activeTab === 'player' && <p className='text-center py-20'>Predicción de jugadores - En desarrollo</p>}
            </div>
        </div>
    );
};

export default Predictions;
