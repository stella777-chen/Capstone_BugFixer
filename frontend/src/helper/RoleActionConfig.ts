interface Action {
  actionName: string;
}

interface Module {
  moduleName: string;
  actions: Action[];
}

interface Application {
  applicationName: string;
  modules: Module[];
}
 export const getDynamicPermissions = (
  applicationName: string,
  moduleName: string,
  actionsToCheck: string[]
): Record<string, boolean> => {
  try {
    const data = localStorage.getItem('sideBarData');
    // console.info("data from local storage",data)
    if (!data) return buildDynamicPermissions(actionsToCheck);

    const sideBarData: Application[] = JSON.parse(data);

    const app = sideBarData.find(app => app.applicationName === applicationName);
    if (!app) return buildDynamicPermissions(actionsToCheck);

    const module = app.modules.find(mod => mod.moduleName === moduleName);
    if (!module) return buildDynamicPermissions(actionsToCheck);

    const availableActions = module.actions.map(action => action.actionName.toLowerCase());

    return buildDynamicPermissions(actionsToCheck, availableActions);
  } catch (error) {
    console.error("Error reading permissions:", error);
    return buildDynamicPermissions(actionsToCheck);
  }
};

const buildDynamicPermissions = (
  actionsToCheck: string[],
  availableActions: string[] = []
): Record<string, boolean> => {
  return actionsToCheck.reduce((acc, action) => {
    acc[action] = availableActions.includes(action.toLowerCase());
    return acc;
  }, {} as Record<string, boolean>);
};