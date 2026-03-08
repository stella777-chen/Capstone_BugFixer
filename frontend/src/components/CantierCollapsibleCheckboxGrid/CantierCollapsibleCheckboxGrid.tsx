// import React, { useState } from 'react';
// import {
//   Checkbox,
//   Button,
// } from '@fluentui/react-components';
// import { Add20Regular, ChevronDown20Regular, ChevronRight20Regular } from '@fluentui/react-icons';
// import './CantierCollapsibleCheckboxGrid.css';

// interface ModulePermissions {
//   [key: string]: boolean;
// }

// interface Module {
//   id: string;
//   name: string;
//   checked: boolean;
//   permissions: ModulePermissions;
// }

// interface CmmsModuleGridTableProps {
//   headerTitle: string;
//   moduleLabel?: string; 
//   permissionHeaders: string[]; 
//   modules: Module[];
//   onModuleToggle: (moduleId: string, checked: boolean) => void;
//   onPermissionToggle: (moduleId: string, permission: string, checked: boolean) => void;
//   onAddModule: () => void;
//   addModuleButtonText?: string; 
//   initialExpanded?: boolean; 
// }

// const CantierCollapsibleCheckboxGrid: React.FC<CmmsModuleGridTableProps> = ({
//   headerTitle,
//   moduleLabel = "Modules",
//   permissionHeaders,
//   modules,
//   onModuleToggle,
//   onPermissionToggle,
//   onAddModule,
//   addModuleButtonText = "Add Module",
//   initialExpanded = true,
// }) => {
//   const [isExpanded, setIsExpanded] = useState(initialExpanded);

//   const toggleExpanded = () => {
//     setIsExpanded(!isExpanded);
//   };

 
//   const tableStyle = {
//     '--permission-count': permissionHeaders.length,
//   } as React.CSSProperties;

//   return (
//     <div className="cantier-container">
//       <div className="cantier-header">
//         <Button
//           appearance="transparent"
//           icon={isExpanded ? <ChevronDown20Regular /> : <ChevronRight20Regular />}
//           onClick={toggleExpanded}
//           size="small"
//           className="cantier-expand-button"
//         />
//         <span className="cantier-header-title">{headerTitle}</span>
//       </div>
      
//       {isExpanded && (
//         <div className="cantier-table-container">
//           <div className="cantier-table-grid" style={tableStyle}>
//             <div className="cantier-header-cell cantier-module-header-cell">
//               {moduleLabel}
//             </div>
//             {permissionHeaders.map((permission) => (
//               <div key={permission} className="cantier-header-cell">
//                 {permission}
//               </div>
//             ))}
            
//             {modules.map((module) => (
//               <React.Fragment key={module.id}>
//                 <div className="cantier-table-cell cantier-module-cell">
//                   <div className="cantier-module-cell-content">
//                     <Checkbox
//                       checked={module.checked}
//                       onChange={(_, data) => onModuleToggle(module.id, data.checked as boolean)}
//                       label={module.name}
//                       className="cantier-module-checkbox"
//                     />
//                   </div>
//                 </div>
//                 {permissionHeaders.map((permission) => (
//                   <div key={permission} className="cantier-table-cell">
//                     <Checkbox
//                       checked={module.permissions[permission] || false}
//                       onChange={(_, data) => onPermissionToggle(module.id, permission, data.checked as boolean)}
//                     />
//                   </div>
//                 ))}
//               </React.Fragment>
//             ))}
//           </div>
//         </div>
//       )}
      
//       {/* Uncomment if you want to show the add module button
//       {isExpanded && (
//         <Button
//           appearance="subtle"
//           icon={<Add20Regular />}
//           onClick={onAddModule}
//           className="cantier-add-module-button"
//         >
//           {addModuleButtonText}
//         </Button>
//       )} */}
//     </div>
//   );
// };

// export default CantierCollapsibleCheckboxGrid;

import React, { useState } from 'react';
import {
  Checkbox,
  Button,
} from '@fluentui/react-components';
import { Add20Regular, ChevronDown20Regular, ChevronRight20Regular } from '@fluentui/react-icons';
import './CantierCollapsibleCheckboxGrid.css';

interface ModulePermissions {
  [key: string]: boolean;
}

interface Module {
  id: string;
  name: string;
  checked: boolean;
  permissions: ModulePermissions;
  availableActions?: string[]; // NEW: Array of action names available for this module
}

interface CmmsModuleGridTableProps {
  headerTitle: string;
  moduleLabel?: string; 
  permissionHeaders: string[]; 
  modules: Module[];
  onModuleToggle: (moduleId: string, checked: boolean) => void;
  onPermissionToggle: (moduleId: string, permission: string, checked: boolean) => void;
  onAddModule: () => void;
  addModuleButtonText?: string; 
  initialExpanded?: boolean; 
}

const CantierCollapsibleCheckboxGrid: React.FC<CmmsModuleGridTableProps> = ({
  headerTitle,
  moduleLabel = "Modules",
  permissionHeaders,
  modules,
  onModuleToggle,
  onPermissionToggle,
  onAddModule,
  addModuleButtonText = "Add Module",
  initialExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Function to check if a module has a specific action available
  const isActionAvailableForModule = (module: Module, actionName: string): boolean => {
    return module.availableActions ? module.availableActions.includes(actionName) : true;
  };

  const tableStyle = {
    '--permission-count': permissionHeaders.length,
  } as React.CSSProperties;

  return (
    <div className="cantier-container">
      <div className="cantier-header">
        <Button
          appearance="transparent"
          icon={isExpanded ? <ChevronDown20Regular /> : <ChevronRight20Regular />}
          onClick={toggleExpanded}
          size="small"
          className="cantier-expand-button"
        />
        <span className="cantier-header-title">{headerTitle}</span>
      </div>
      
      {isExpanded && (
        <div className="cantier-table-container">
          <div className="cantier-table-grid" style={tableStyle}>
            <div className="cantier-header-cell cantier-module-header-cell">
              {moduleLabel}
            </div>
            {permissionHeaders.map((permission) => (
              <div key={permission} className="cantier-header-cell">
                {permission}
              </div>
            ))}
            
            {modules.map((module) => (
              <React.Fragment key={module.id}>
                <div className="cantier-table-cell cantier-module-cell">
                  <div className="cantier-module-cell-content">
                    <Checkbox
                      checked={module.checked}
                      onChange={(_, data) => onModuleToggle(module.id, data.checked as boolean)}
                      label={module.name}
                      className="cantier-module-checkbox"
                    />
                  </div>
                </div>
                {permissionHeaders.map((permission) => (
                  <div key={permission} className="cantier-table-cell">
                    {isActionAvailableForModule(module, permission) ? (
                      <Checkbox
                        checked={module.permissions[permission] || false}
                        onChange={(_, data) => onPermissionToggle(module.id, permission, data.checked as boolean)}
                      />
                    ) : (
                      // Render empty space or a disabled indicator when action is not available
                      <div className="cantier-unavailable-action">
                        {/* You can add a dash or leave empty */}
                        <span style={{ color: '#ccc', fontSize: '12px' }}>—</span>
                      </div>
                    )}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
      
      {/* Uncomment if you want to show the add module button
      {isExpanded && (
        <Button
          appearance="subtle"
          icon={<Add20Regular />}
          onClick={onAddModule}
          className="cantier-add-module-button"
        >
          {addModuleButtonText}
        </Button>
      )} */}
    </div>
  );
};

export default CantierCollapsibleCheckboxGrid;