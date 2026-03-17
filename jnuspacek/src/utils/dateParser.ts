import { ParsedDate } from '../types';

/**
 * 타임스탬프를 파싱하여 년, 월, 일, 시, 분, 초로 변환
 * @param timestamp - 형식: 20260317093817
 * @returns ParsedDate 객체
 */
export const parseTimestamp = (timestamp: string): ParsedDate => {
    if (timestamp.length !== 14) {
        throw new Error('Invalid timestamp format. Expected 14 characters (YYYYMMDDHHmmss)');
    }

    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(4, 6);
    const day = timestamp.substring(6, 8);
    const hour = timestamp.substring(8, 10);
    const minute = timestamp.substring(10, 12);
    const second = timestamp.substring(12, 14);

    const datetime = new Date(
        parseInt(year),
        parseInt(month),
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
    );

    const formatted = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

    return {
        year,
        month,
        day,
        hour,
        minute,
        second,
        formatted,
        datetime
    };
};
