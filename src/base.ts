import OpenAIInstances from './openai';

export type AssistantOptions = 
{
    id          : string,
    token       : string,
    functions?  : Record<string, Function>
}

export default class AssistantBase
{
    constructor( protected options: AssistantOptions ){}   

    protected get openai()
    {
        return OpenAIInstances.get( this.options.token );
    }
}