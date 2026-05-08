import { Provider } from "react-redux";
import { wipStore } from "src/pages/AIQuery/components/WipDashboard/store/store";
import WipDashboard from "./WipDashboard";


interface Props {}

const DashboardStore = (props: Props) => {
	return (
		<Provider store={wipStore}>
            <WipDashboard/>
		</Provider>
	);
};

export default DashboardStore;
