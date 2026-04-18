import { styles } from "../assets/dummyStyles.js";
import Navbar from "./Navbar.jsx";

const Layout = ({onLogout, user}) => {
    return (
        <div className={styles.layout.root}>
            <Navbar user={user} onLogout={onLogout} />
        </div>
    )
}

export default Layout
