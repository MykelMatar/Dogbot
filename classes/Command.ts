
export class Command {
    name: string
    description: string
    requiresAdmin: boolean
    execute
    
    public executeCommand():void{
        this.execute();
    }
    
    constructor() {
        this.requiresAdmin = false
    }
}