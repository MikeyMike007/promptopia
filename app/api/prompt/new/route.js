import { connectToDb } from '@utils/database';
import Prompt from '@models/prompt';

export const POST = async (request) => {
  const { userId, prompt, tag } = await request.json();
  console.log(`Prompt: ${prompt}`);

  try {
    await connectToDb();

    const newPrompt = new Prompt({
      creator: userId,
      prompt,
      tag,
    });

    console.log('Submitted prompt');

    await newPrompt.save();

    console.log('Saved prompt');

    return new Response(JSON.stringify(newPrompt), { status: 201 });
  } catch (error) {
    return new Response('Failed to create a new prompt', { status: 500 });
  }
};
