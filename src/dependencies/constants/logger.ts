// universal pino configuration
import pino from "pino";

const log = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'mm-dd-yyyy HH:MM:ss',
            ignore: 'hostname,pid',
        }
    },
});

export default log