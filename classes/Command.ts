
export class Command {
    name: string
    description: string
    requiresAdmin: boolean
    execute
    
    public executeCommand():void{
        this.execute();
    }
    
    constructor() {
        console.log(`${this.name} requested by {user} in {guild}`)
        this.requiresAdmin = false
    }
}