import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";

let openai: OpenAI | null = null;

const openIaApiKey = Deno.env.get("OPENAI_API_KEY");

export const getOpenAIInstance = () => {
  if (!openai) {
    openai = new OpenAI({
      apiKey: openIaApiKey,
    });
  }
  return openai;
};


export const requestRecommendedGiftOpenIA = async (query: string) => {
  const openai = getOpenAIInstance();

  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: query }],
    model: 'gpt-4o-mini',
    stream: false,
  })

  const reply = chatCompletion.choices[0].message.content
  return reply?.replaceAll('`', '').replace('json', '');
}