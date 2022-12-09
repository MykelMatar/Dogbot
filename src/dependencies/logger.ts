// universal pino configuration
import pino from "pino";

const log = pino(pino.destination({
    sync: false
}));

export default log