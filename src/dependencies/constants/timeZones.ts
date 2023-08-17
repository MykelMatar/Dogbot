// via https://www.ge.com/digital/documentation/meridium/V36160/Help/Master/Subsystems/AssetPortal/Content/Time_Zone_Mappings.htm
const timezonesNegative: Record<string, string> = {
    'Dateline Standard Time': 'UTC-12',
    'UTC-11': 'UTC-11',
    'Hawaiian Standard Time': 'UTC-10',
    'Alaskan Standard Time': 'UTC-9',
    'Pacific Standard Time (US & Canada)': 'UTC-8',
    'Mountain Standard Time (US & Canada)': 'UTC-7',
    'Central Standard Time': 'UTC-06',
    'Eastern Standard Time': 'UTC-05',
    'Venezuelan Standard Time': 'UTC-4:30',
    'Atlantic Standard Time': 'UTC-04',
    'Newfoundland Standard Time': 'UTC-3:30',
    'E. South America Standard Time': 'UTC-3',
    'Mid-Atlantic Standard Time': 'UTC-2',
    'Carpe Verde, Azores Standard Time': 'UTC-1',
    'Coordinated Universal Time': 'UTC',
} as const;

const timezonesDaylight: Record<string, string> = {
    'Hawaiian Standard Time': 'UTC-10',
    'Hawaiian Daylight Time (Aleutian Islands)': 'UTC-9',
    'Alaskan Daylight Time': 'UTC-8',
    'Pacific Daylight Time (US & Canada)': 'UTC-7',
    'Mountain Daylight Time (US & Canada)': 'UTC-6',
    'Central Daylight Time': 'UTC-05',
    'Eastern Daylight Time': 'UTC-04',
} as const;

const timezonesPositive: Record<string, string> = {
    'Coordinated Universal Time': 'UTC',
    'Central Europe Standard Time': 'UTC+1',
    'Middle East Standard Time': 'UTC+2',
    'Arabic Standard Time': 'UTC+3',
    'Iran Standard Time': 'UTC+3:30',
    'Russian Standard Time': 'UTC+4',
    'Afghanistan Standard Time': 'UTC+4:30',
    'West Asia Standard Time': 'UTC+5',
    'India Standard Time': 'UTC+5:30',
    'Nepal Standard Time': 'UTC+5:45',
    'Myanmar Standard Time': 'UTC+6:30',
    'Asia Central Standard Time': 'UTC+6',
    'Asia SE Standard Time': 'UTC+7',
    'Asia N Standard Time': 'UTC+8',
    'Asia NE Standard Time': 'UTC+9',
    'AUS Central Standard Time': 'UTC+9:30',
    'AUS Eastern Standard Time': 'UTC+10',
    'Central Pacific Standard Time': 'UTC+11',
    'New Zealand Standard Time': 'UTC+12',
    'Samoa Standard Time': 'UTC+13',
} as const;

export {timezonesNegative, timezonesPositive};