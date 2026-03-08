import { PresenceBadgeStatus } from "@fluentui/react-components";
import React from "react";

  export const mapToPresenceStatus = (status?: string): PresenceBadgeStatus => {

    switch ((status || '').toLowerCase()) {
      case 'active':
        return 'available';
      case 'inactive':
        return 'offline';
      case 'pending':
        return 'away';
      case 'busy':
        return 'busy';
      case 'dnd':
      case 'do-not-disturb':
        return 'do-not-disturb';
      default:
        return 'offline';
    }
  };
  export const useWindowWidth = () => {
    const [width, setWidth] = React.useState(window.innerWidth);
  
    React.useEffect(() => {
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    return width;
  };
  export const normalizeDateTime = (value: string, type?: string) => {
  if (type === "datetime") {
    return value?.length === 16 ? `${value}:00.0000000` : value;
  }
  return value;
};


  export const formatLocalDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`; // local time format
};
