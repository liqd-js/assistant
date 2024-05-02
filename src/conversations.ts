import AssistantBase from './base';

const parseArgs = ( args: string ) => JSON.parse( args );
const parseOutput = ( output: any ) => typeof output === 'string' ? output : JSON.stringify( output );

export default class AssistantConversations extends AssistantBase
{
    list()
    {

    }

    async messages( conversationID: string )
    {
        const messages = await this.openai.beta.threads.messages.list( conversationID );

        return messages.data.map( m => m.content[0] );
    }

    async send( conversationID: string | undefined, message: string )
    {
        if( !conversationID )
        {
            conversationID = ( await this.openai.beta.threads.create(
            {
                //tool_resources: { file_search: { vector_store_ids: ['vs_py1ogkImXHhvgBimSVwLLIuu'] }}
            }
            )).id
        }

        await this.openai.beta.threads.messages.create( conversationID!, { role: 'user', content: message });

        let stream = await this.openai.beta.threads.runs.stream( conversationID!, { assistant_id: this.options.id });

        let response = '', done = false;

        while( !done )
        {
            for await ( const { event, data } of stream )
            {
                //console.log( event );

                if( event === 'thread.message.delta' )
                {
                    //console.log( data.delta.content );
                }
                else if( event === 'thread.message.completed' )
                {
                    if( data.content[0].type === 'text' )
                    {
                        response = data.content[0].text.value;
                    }
                }
                else if( event === 'thread.run.requires_action' )
                {
                    const outputs = await Promise.all( data.required_action!.submit_tool_outputs.tool_calls.map( async( call ) => (
                    {
                        tool_call_id    : call.id,
                        output          : parseOutput( await this.options.functions?.[call.function.name]?.( parseArgs( call.function.arguments )) || null )
                    })));

                    stream = await this.openai.beta.threads.runs.submitToolOutputsStream( conversationID!, data.id, { tool_outputs: outputs, stream: true });
                }
                else if( event === 'thread.run.completed' )
                {
                    done = true;
                }
            }
        }

        return { conversationID, response }
    }
};