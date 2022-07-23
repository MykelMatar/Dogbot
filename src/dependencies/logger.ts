// universal pino configuration
import pino from "pino";

export const log = pino(pino.destination({
    sync: false
}));