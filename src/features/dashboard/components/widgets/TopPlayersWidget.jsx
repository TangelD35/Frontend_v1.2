import { motion } from 'framer-motion';
import { Users, Star } from 'lucide-react';
import { Badge } from '../../common';

const TopPlayersWidget = ({ players = [] }) => {
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-600" />
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Mejores Jugadores
                </h4>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
                {players.slice(0, 5).map((player, index) => (
                    <motion.div
                        key={player.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    >
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {player.number}
                            </div>
                            {index < 3 && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                    <Star className="w-2 h-2 text-white" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="font-semibold text-gray-800 dark:text-white text-sm">
                                {player.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {player.position}
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {player.rating}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Rating
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default TopPlayersWidget;