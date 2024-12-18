import { useMemo, useState } from "react";
import { GiBearHead, GiPc } from "react-icons/gi";
import MenuSectionPlayer from "../MenuSectionPlayer/MenuSectionPlayer";
import MenuSectionStats from "../MenuSectionStats/MenuSectionStats";
import styles from "./Menu.module.css";

const Menu = () => {
    const [activeSectionIndex, setActiveSectionIndex] = useState(0);
    const menuSections = useMemo(() => {
        return [
            {
                name: "Player",
                icon: GiBearHead,
                content: <MenuSectionPlayer />,
            },
            {
                name: "Stats",
                icon: GiPc,
                content: <MenuSectionStats />,
            },
        ];
    }, []);

    const onClickTab = (index) => () => {
        setActiveSectionIndex(index);
    };

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                {menuSections.map((menuSection, index) => {
                    const Icon = menuSection.icon;
                    const isActive = activeSectionIndex === index;
                    return (
                        <div
                            key={index}
                            className={`
                            ${styles.tab}
                            ${isActive ? styles.isActive : ""}
                        `}
                            onClick={onClickTab(index)}
                        >
                            <Icon size={25} />
                            <div className={styles.tabText}>
                                {menuSection.name}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className={styles.content}>
                {menuSections[activeSectionIndex].content}
            </div>
        </div>
    );
};

export default Menu;
