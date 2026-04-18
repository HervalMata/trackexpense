import { styles } from "../assets/dummyStyles.js";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import {useState} from "react";

const Layout = ({onLogout, user}) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className={styles.layout.root}>
            <Navbar user={user} onLogout={onLogout} />
            <Sidebar user={user} isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />
        </div>
    )
}

export default Layout
