import { Readable, ReadableOptions } from 'stream';
import OpenAIInstances from './openai';

export type AssistantOptions = 
{
    id          : string,
    token       : string,
    functions?  : Record<string, Function>
}

export type AssistantConversationMessageOptions =
{
    context?    : string,
    functions?  : Record<string, Function>
}

export class AssistantStream extends Readable
{
    constructor( options?: ReadableOptions )
    {
        super( options );
    }

    public _read(){}

    /*clone()
    {
        
    }*/
}

export default class AssistantBase
{
    constructor( protected options: AssistantOptions ){}   

    protected get openai()
    {
        return OpenAIInstances.get( this.options.token );
    }
}