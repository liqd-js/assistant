import AssistantBase, { AssistantOptions } from './base';
import AssistantConversations from './conversations';

export default class Assistant extends AssistantBase
{
    public readonly conversations: AssistantConversations

    constructor( options: AssistantOptions )
    {
        super( options );

        this.conversations = new AssistantConversations( options );
    }
}