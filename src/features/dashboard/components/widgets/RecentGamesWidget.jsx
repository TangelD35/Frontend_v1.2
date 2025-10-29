import { motion } from 'framer-motion';
import { Calendar, MapPin, Trophy } from 'lucide-react';
import { Badge } from '../../common';

const RecentGamesWidget = ({ games = [] }) => {
    const getResultBadge = (game) => {
        if (game.status !== 'completed') return null;

        const isDominicanHome = game.homeTeam === 'República Dominicana';
        const isDominicanAway = game.awayTeam === 'República Dominicana';

        let isWin = false;
        if (isDominicanHome && game.homeScore > game.awayScore) isWin = true;
        if (isDominicanAway && game.awayScore > game.homeScore) isWin = true;

        return (
            <Badge variant={isWin ? 'success' : 'danger'} size="small">
                {isWin ? 'Victoria' : 'Derrota'}
            </Badge>
        );
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-orange-600" />
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Partidos Recientes
                </h4>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
                {games.slice(0, 5).map((game, index) => (
                    <motion.div
                        key={game.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{game.homeLogo}</span>
                                <span className="text-sm font-medium">{game.homeTeam}</span>
                                {game.status === 'completed' ? (
                                    <span className="text-lg font-bold text-gray-800 dark:text-white">
                                        {game.homeScore}
                                    </span>
                                ) : null}
                            </div>
                            {getResultBadge(game)}
                        </div>

                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{game.awayLogo}</span>
                                <span className="text-sm font-medium">{game.awayTeam}</span>
                                {game.status === 'completed' ? (
                                    <span className="text-lg font-bold text-gray-800 dark:text-white">
                                        {game.awayScore}
                                    </span>
                                ) : null}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(game.date).toLocaleDateString('es-ES')}
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {game.venue}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default RecentGamesWidget;