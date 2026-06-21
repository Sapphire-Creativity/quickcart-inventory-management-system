import { motion } from 'framer-motion';

const KPICard = ({ title, subtitle, value, icon: Icon, trend, color }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-xl border border-default p-5 shadow-sm"
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-muted">{title}</p>
                <p className="text-2xl font-semibold mt-1">{value}</p>
                {subtitle && <p className="text-lg font-medium text-muted">{subtitle}</p>}
                {trend && <p className="text-xs text-green-600 mt-1">{trend}</p>}
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
        </div>
    </motion.div>
);
export default KPICard
