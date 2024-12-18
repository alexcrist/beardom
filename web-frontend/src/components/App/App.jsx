import Game from "../Game/Game";
import Menu from "../Menu/Menu";
import styles from "./App.module.css";

const App = () => {
    return (
        <div className={styles.container}>
            <Game />
            <Menu />
        </div>
    );
};

export default App;
