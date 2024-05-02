import OpenAI from 'openai';

export default class OpenAIInstances
{
    private static instances: Map<string, OpenAI> = new Map();

    public static get( token: string ): OpenAI
    {
        if( !this.instances.has( token ) )
        {
            this.instances.set( token, new OpenAI({ apiKey: token }));
        }

        return this.instances.get( token )!;
    }
}