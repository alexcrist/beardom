import { useSelector } from "react-redux";
import { formatDecimal } from "../../util/format";
import styles from "./MenuSectionStats.module.css";

const MenuSectionStats = () => {
    const performanceStats = useSelector(
        (state) => state.main.performanceStats,
    );
    return (
        <div className={styles.container}>
            <div className={styles.stat}>
                FPS: {formatDecimal(performanceStats.fps, 0)}
            </div>
            <div className={styles.stat}>
                Logic time: {formatDecimal(performanceStats.ms, 0)} ms
            </div>
            <div className={styles.stat}>
                Heap size: {formatDecimal(performanceStats.memoryMB, 0)}
            </div>
        </div>
    );
};

export default MenuSectionStats;
