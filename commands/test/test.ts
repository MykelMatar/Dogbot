import { Command } from "../../classes/Command";

export default {
    name: 'test',
    description: 'command made for testing typescript',
    execute: async () => console.log('command executed')
    
} as Command