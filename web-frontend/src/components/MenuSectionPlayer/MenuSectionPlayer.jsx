import { useState } from "react";
import { FaCheck, FaPen, FaPlus } from "react-icons/fa";
import { useSelector } from "react-redux";
import { getWorld } from "../Game/Game";
import styles from "./MenuSectionPlayer.module.css";

const MenuSectionPlayer = () => {
    const name = useSelector((state) => state.main.player?.name);

    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInputValue, setNameInputValue] = useState("");

    const onClickEditName = () => {
        setNameInputValue(name);
        setIsEditingName(true);
    };

    const onFinishEditName = () => {
        setIsEditingName(false);
        if (nameInputValue) {
            getWorld().setName(nameInputValue);
        }
    };

    const onCancelEditName = () => {
        setIsEditingName(false);
    };

    return (
        <div className={styles.container}>
            {isEditingName ? (
                <div className={styles.editNameContainer}>
                    <input
                        value={nameInputValue}
                        onChange={(e) => setNameInputValue(e.target.value)}
                    />
                    <FaCheck
                        onClick={onFinishEditName}
                        className={styles.icon}
                    />
                    <FaPlus
                        style={{ transform: "rotate(45deg)" }}
                        onClick={onCancelEditName}
                        className={styles.icon}
                    />
                </div>
            ) : (
                <div className={styles.nameContainer}>
                    <div className={styles.name}>Name: {name}</div>
                    <FaPen
                        onClick={onClickEditName}
                        className={styles.icon}
                        style={{ paddingTop: 6 }}
                        size={12}
                    />
                </div>
            )}
        </div>
    );
};

export default MenuSectionPlayer;
