export const safelyStringifyJSON = <T extends unknown>(data: T): string => {
    try {
        return JSON.stringify(data);
    } catch (error) {
        console.error('Error stringifying JSON:', error);
        return '';
    }
};

export const safelyParseJSON = <T extends unknown>(data: string | null, fallback: T): T => {
    if (!data) return fallback;
    try {
        return JSON.parse(data) as T;
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return fallback;
    }
};