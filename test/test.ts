import 'dotenv/config';

import Assistant from '../src/assistant';

const assistant = new Assistant({ id: 'asst_l185HoiClMmGpinWezVkZ5UO', token: process.env.OPENAI_API_KEY!, functions: 
{
    get_fillrate: async( _: any ) => Math.random()
}});

async function test()
{
    const conversationID = 'thread_xuZomvTqvDDid35xZKZ18QCr';// 'thread_PIY0RAHC9Az0TLAEDubfZNiq';
    //const conversation = await assistant.conversations.send( conversationID, 'How can I see number of open jobs' );
    //const conversation = await assistant.conversations.send( conversationID, 'What can i see there' );
    //const conversation = await assistant.conversations.send( conversationID, 'What is my fill rate for past 12 months' );

    const conversation = await assistant.conversations.messages( conversationID );

    console.log( conversation );
}

test();