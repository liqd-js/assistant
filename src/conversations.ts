import AssistantBase, { AssistantConversationMessageOptions, AssistantStream } from './base';

const parseArgs = ( args: string ) => JSON.parse( args );
const parseOutput = ( output: any ) => typeof output === 'string' ? output : JSON.stringify( output );

export default class AssistantConversations extends AssistantBase
{
    list()
    {
        //this.openai.beta.threads
    }

    async messages( conversationID: string )
    {
        const messages = await this.openai.beta.threads.messages.list( conversationID );

        return messages.data.map( m => m.content[0] );
    }

    async send( conversationID: string | undefined, message: string, options: AssistantConversationMessageOptions = {} ): Promise<{ conversationID: string, response: AssistantStream }>
    {
        if( !conversationID )
        {
            conversationID = ( await this.openai.beta.threads.create(
            {
                //tool_resources: { file_search: { vector_store_ids: ['vs_py1ogkImXHhvgBimSVwLLIuu'] }}
            }
            )).id
        }

        this.options.debug && console.log( 'Assistant prompt: ' + message );

        await this.openai.beta.threads.messages.create( conversationID!, { role: 'user', content: message });

        let stream = await this.openai.beta.threads.runs.stream( conversationID!, 
        {
            assistant_id: this.options.id,
            additional_instructions: options.context
        });

        let response = new AssistantStream(), done = false;

        ( async() =>
        {
            while( !done )
            {
                for await ( const { event, data } of stream )
                {
                    //console.log( event );

                    if( event === 'thread.message.delta' )
                    {
                        if( data.delta.content?.[0].type === 'text' )
                        {
                            data.delta.content[0].text?.value && response.push( data.delta.content[0].text.value )
                        }
                        //console.log( data.delta.content );
                        //data.delta.content && response.push( data.delta.content );
                        
                    }
                    else if( event === 'thread.message.completed' )
                    {
                        if( data.content[0].type === 'text' )
                        {
                            //response = data.content[0].text.value;
                        }
                    }
                    else if( event === 'thread.run.requires_action' )
                    {
                        const outputs = await Promise.all( data.required_action!.submit_tool_outputs.tool_calls.map( async( call ) => 
                        {
                            try
                            {
                                const result = await ( options?.functions?.[call.function.name] ?? this.options.functions?.[call.function.name])?.( parseArgs( call.function.arguments ));

                                this.options.debug && console.log( 'Assistant Action', { function: call.function.name, arguments: call.function.arguments, result });
                                
                                return { tool_call_id: call.id, output: parseOutput( result )}
                            }
                            catch( e )
                            {
                                this.options.debug && console.log( 'Assistant Action Error', { function: call.function.name, arguments: call.function.arguments, error: e });
                            }

                            return { tool_call_id: call.id, output: 'There was an error processing this action' }
                        }));

                        stream = await this.openai.beta.threads.runs.submitToolOutputsStream( conversationID!, data.id, { tool_outputs: outputs, stream: true });
                    }
                    else if( event === 'thread.run.completed' )
                    {
                        done = true;
                    }
                }
            }

            response.push( null );
        })();

        return { conversationID, response }
    }
};