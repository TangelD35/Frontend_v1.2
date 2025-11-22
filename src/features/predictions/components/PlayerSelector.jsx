import { useState, useEffect } from 'react';
import { Search, X, User, TrendingUp, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import playersService from '../../../shared/api/endpoints/players';

const PlayerSelector = ({
    label = "Seleccionar Jugador",
    onSelect,
    showStats = true,
    filterActive = true,
    selectedPlayer = null
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filteredPlayers, setFilteredPlayers] = useState([]);

    // Cargar jugadores
    useEffect(() => {
        loadPlayers();
    }, []);

    // Filtrar jugadores por búsqueda
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredPlayers(players);
        } else {
            const filtered = players.filter(player => {
                const fullName = `${player.first_name || ''} ${player.last_name || ''}`.toLowerCase();
                const searchLower = searchTerm.toLowerCase();
                return fullName.includes(searchLower) ||
                    player.position?.toLowerCase().includes(searchLower);
            });
            setFilteredPlayers(filtered);
        }
    }, [searchTerm, players]);

    const loadPlayers = async () => {
        setLoading(true);
        try {
            const filters = filterActive ? { active: true } : {};
            console.log('🔍 PlayerSelector - Cargando jugadores con filtros:', filters);
            const response = await playersService.getAll(filters);
            console.log('✅ PlayerSelector - Response completa:', response);
            console.log('📊 PlayerSelector - Claves de response:', Object.keys(response));
            console.log('📊 PlayerSelector - response.data:', response.data);
            console.log('📊 PlayerSelector - response.players:', response.players);
            console.log('📊 PlayerSelector - response.results:', response.results);
            console.log('📊 PlayerSelector - response.items:', response.items);

            // Intentar diferentes estructuras de respuesta
            const playersData = response.data || response.players || response.results || response.items || response || [];
            console.log('🔢 PlayerSelector - Total jugadores encontrados:', playersData.length);

            // Verificar estructura de datos
            if (playersData.length > 0) {
                console.log('👤 PlayerSelector - Ejemplo jugador:', playersData[0]);
            }

            setPlayers(playersData);
            setFilteredPlayers(playersData);
        } catch (error) {
            console.error('❌ PlayerSelector - Error loading players:', error);
            console.error('❌ PlayerSelector - Error details:', error.response?.data);
            setPlayers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (player) => {
        onSelect(player);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = () => {
        onSelect(null);
        setSearchTerm('');
    };

    return (
        <div className="relative">
            {/* Label */}
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                {label}
            </label>

            {/* Selected Player Display */}
            {selectedPlayer ? (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#CE1126]/10 to-[#002D62]/10 dark:from-[#CE1126]/20 dark:to-[#002D62]/20 rounded-xl border-2 border-[#CE1126]/30 dark:border-[#CE1126]/50">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#CE1126] to-[#002D62] flex items-center justify-center text-white font-bold text-lg">
                        {(selectedPlayer.full_name || selectedPlayer.first_name || 'J').charAt(0)}
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white">
                            {selectedPlayer.full_name || `${selectedPlayer.first_name || ''} ${selectedPlayer.last_name || ''}`}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedPlayer.position} • {selectedPlayer.team_name || 'Sin equipo'}
                        </p>
                    </div>
                    <button
                        onClick={handleClear}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors touch-target"
                        aria-label="Limpiar selección"
                    >
                        <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </button>
                </div>
            ) : (
                /* Select Button */
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-[#CE1126] dark:hover:border-[#CE1126] transition-all duration-200 touch-target"
                >
                    <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-500 dark:text-gray-400">
                            Selecciona un jugador...
                        </span>
                    </div>
                    <Search className="w-5 h-5 text-gray-400" />
                </button>
            )}

            {/* Modal de Selección */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 max-h-[80vh] flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Seleccionar Jugador
                                </h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-target"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre o posición..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#CE1126] focus:border-transparent transition-all"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Players List */}
                            <div className="flex-1 overflow-y-auto p-4 scroll-smooth-y">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="w-8 h-8 border-4 border-[#CE1126] border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : filteredPlayers.length === 0 ? (
                                    <div className="text-center py-12">
                                        <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {searchTerm ? 'No se encontraron jugadores' : 'No hay jugadores disponibles'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredPlayers.map((player, index) => {
                                            const fullName = player.full_name || `${player.first_name || ''} ${player.last_name || ''}`;
                                            const playerId = player.player_id || player.id || index;
                                            return (
                                                <motion.button
                                                    key={playerId}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.03 }}
                                                    onClick={() => handleSelect(player)}
                                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group touch-target"
                                                >
                                                    {/* Avatar */}
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CE1126] to-[#002D62] flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                                                        {fullName.charAt(0) || 'J'}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 text-left">
                                                        <p className="font-bold text-gray-900 dark:text-white">
                                                            {fullName}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {player.position} • {player.team_name || 'Sin equipo'}
                                                        </p>
                                                    </div>

                                                    {/* Stats Preview (si showStats) */}
                                                    {showStats && player.stats && (
                                                        <div className="hidden md:flex items-center gap-4 text-xs">
                                                            <div className="text-center">
                                                                <p className="font-bold text-[#CE1126]">
                                                                    {player.stats.ppg?.toFixed(1) || '0.0'}
                                                                </p>
                                                                <p className="text-gray-500">PTS</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="font-bold text-[#002D62]">
                                                                    {player.stats.rpg?.toFixed(1) || '0.0'}
                                                                </p>
                                                                <p className="text-gray-500">REB</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="font-bold text-gray-600">
                                                                    {player.stats.apg?.toFixed(1) || '0.0'}
                                                                </p>
                                                                <p className="text-gray-500">AST</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                    {filteredPlayers.length} jugador{filteredPlayers.length !== 1 ? 'es' : ''} disponible{filteredPlayers.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PlayerSelector;
