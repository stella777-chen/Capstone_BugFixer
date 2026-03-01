/**
 * Format a date/datetime string to a readable format
 * @param dateTimeString - The date/datetime string to format
 * @param type - The type of formatting ('date' or 'datetime')
 * @returns Formatted date string
 */
export const formatDateTime = (dateTimeString: string | number | null | undefined, type: 'date' | 'datetime' = 'datetime'): string => {
    try {
        if (!dateTimeString) return String(dateTimeString || '');

        let parsedDateString: string | number = dateTimeString;

        // Check if the input is in DD-MM-YYYY HH:mm:ss format
        if (typeof dateTimeString === 'string') {
            const ddmmyyyyPattern = /^(\d{2})-(\d{2})-(\d{4})(\s+(\d{2}):(\d{2}):(\d{2}))?$/;
            const match = dateTimeString.match(ddmmyyyyPattern);

            if (match) {
                const day = match[1];
                const month = match[2];
                const year = match[3];
                const time = match[4] ? match[4].trim() : '00:00:00';

                // Convert to ISO format: YYYY-MM-DDTHH:mm:ss
                parsedDateString = `${year}-${month}-${day}T${time}`;
            }
        }

        const date = new Date(parsedDateString);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return String(dateTimeString);
        }

        if (type === 'date') {
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit'
            });
        } else {
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }
    } catch (error) {
        return String(dateTimeString);
    }
};