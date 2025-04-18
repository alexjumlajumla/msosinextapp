import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { DEFAULT_TIMEZONE } from "constants/config";

dayjs.extend(utc);
dayjs.extend(timezone);

// Set default timezone
dayjs.tz.setDefault(DEFAULT_TIMEZONE);

export default dayjs;